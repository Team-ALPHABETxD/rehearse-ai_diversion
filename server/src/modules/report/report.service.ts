import { Injectable } from '@nestjs/common';
import { ReportDetailsDTO } from './report.dto';
import { Report } from './report.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { AiService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ReportService {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<Report>,
        private readonly kafkaService: KafkaProducerService,
        private readonly aiService: AiService,
        private readonly emailService: EmailService,
        private readonly userService: UserService
    ) { }

    async createReport(reportData: ReportDetailsDTO, userId: any) {
        try {
            const createdReport = await this.reportModel.create(reportData)
            createdReport.interviewer = userId
            await createdReport.save()

            const reportId = createdReport.id
            // enqueue for analysis
            const res = await this.kafkaService.send('waited-reports', { reportId: reportId })
            console.log("Status of insertion in waiting room:" , res)

            // run analysis right away so metrics populate
            this.analyseReport(reportId).catch(e => console.log('auto analysis error', e))

            return { flag: "success", data: createdReport }
        } catch (error) {
            console.log(error)
            return { flag: "fail", data: "" }
        }
    }

    async fetchReportsByUserId(userId: any) {
        try {
            const reports = await this.reportModel.find({ interviewer: userId })
            return { flag: "success", data: reports }
        } catch (error) {
            console.log(error)
            return { flag: "fail", data: "" }
        }
    }

    async analyseQnA(questions: string[], answers: string[]) {
        try {
            const metrics = await this.aiService.evaluateAnswers(questions, answers)
            return metrics
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async analyseRcrd(rcrdUrl: string) {
        if (!rcrdUrl) return null

        const aiAnalysed = await this.aiService.analyseVdo(rcrdUrl)
        const analysedData = {
            facevisible: 41,
            eyecontact: 24,
            blankvisual: 12,
            softsmile: 23
        }

        return analysedData
    }


    async analyseReport(reportId: any) {
        try {
            console.log("Getting: ", reportId)

            const report = await this.reportModel.findById(reportId)
            if (!report) return null

            // Idempotent: skip if already analyzed
            if (report.answersMetrics && report.answersMetrics.length > 0) {
                console.log(`Report ${reportId} has already been analyzed, skipping...`)
                return report.id
            }

            // Analyze QnA via AI
            const answerMetrics: any[] = await this.analyseQnA(report.questions, report.answers) || []

            // Compute averages from answer metrics
            const avgAccuracy = answerMetrics.length > 0
                ? Math.round(answerMetrics.reduce((s, m) => s + (m.accuracy || 0), 0) / answerMetrics.length)
                : 0
            const avgFiller = answerMetrics.length > 0
                ? Math.round(answerMetrics.reduce((s, m) => s + (m.fillerScore || 0), 0) / answerMetrics.length)
                : 0

            // Video metrics (use raw metrics if provided for simulation)
            const videoMetrics = report.rawVideoMetrics || await this.analyseRcrd(report.recordURL ?? null)
            let personalityScore = 50, confusionLevel = 50, fluencyScore = 50
            if (videoMetrics) {
                personalityScore = Math.round(
                    (videoMetrics.blankvisual * -0.4)
                    + (videoMetrics.eyecontact * 0.6)
                    + (videoMetrics.facevisible * 0.2)
                    + (videoMetrics.softsmile * 0.8)
                )

                confusionLevel = Math.round(
                    (videoMetrics.blankvisual * 0.5)
                    + (videoMetrics.eyecontact * -0.6)
                    + (videoMetrics.facevisible * -0.2)
                    + (videoMetrics.softsmile * -0.8)
                )

                fluencyScore = Math.round(
                    (videoMetrics.blankvisual * -0.4)
                    + (videoMetrics.eyecontact * 0.6)
                    + (videoMetrics.facevisible * 0.2)
                    + (videoMetrics.softsmile * 0.8)
                )
            }

            // Derive a consolidated hit/technical score for the report
            const hitScore = Math.round((avgAccuracy * 0.6) + (fluencyScore * 0.2) + (personalityScore * 0.2))

            const improvementSuggestion = hitScore < 60 ? 'Focus on core concepts and timed practice.' : 'Keep practicing with mocks and real projects.'

            // Interview-level scores to feed schedule generator
            const interviewScores = {
                accuracy: avgAccuracy,
                fillerScore: avgFiller,
                behavioralScore: personalityScore,
                technicalScore: hitScore,
                confidenceLevel: Math.max(0, 100 - Math.abs(confusionLevel))
            }

            const evaluatedMetrices = {
                videoMetrics: videoMetrics,
                answersMetrics: answerMetrics,
                personalityScore: personalityScore,
                confusionLevel: confusionLevel,
                fluencyScore: fluencyScore,
                hitScore: hitScore,
                improvementSugg: improvementSuggestion,
                interviewScores: interviewScores
            }

            await report.updateOne(evaluatedMetrices)

            // Persist interview scores to user profile for quick access on dashboard
            await this.userService.updateInterviewScores(report.interviewer, interviewScores)

            // automatically regenerate schedule based on latest performance and onboarding
            try {
                await this.generatePersonalizedScheduleForReport(reportId, report.interviewer)
            } catch (_) {
                // non-fatal, just log
                console.log('Schedule regeneration failed after analysis')
            }

            const emailPayload = {
                title: report.metadata.title,
                targetCmp: report.metadata.targetCmp,
                reportLink: "/",
                timestamp: report.createdAt.toLocaleDateString()
            }

            const user = await this.userService.findUserById(report.interviewer)

            await this.emailService.sendEmail(
                user?.email || "samajdarsoumyajeet0@gmail.com",
                "Report Updation Notification",
                "report-notification-mail",
                emailPayload
            )

            return report.id
        } catch (error) {
            console.log(error)
            return null
        }
    }


    async giveReports(userId: any) {
        try {
            const reports = await this.reportModel.find({ interviewer: userId })
            return reports
        } catch (error) {
            console.log(error)
        }
    }

    async generatePersonalizedScheduleForReport(reportId: any, userId: any) {
        try {
            const report = await this.reportModel.findById(reportId)
            if (!report) return { flag: "fail", data: "Report not found" }

            // Extract interview scores from report metrics
            const interviewScores = {
                accuracy: report.answersMetrics?.[0]?.accuracy || 0,
                fillerScore: report.answersMetrics?.[0]?.fillerScore || 0,
                behavioralScore: report.personalityScore || 0,
                technicalScore: (report.hitScore || 0),
                confidenceLevel: 100 - (report.confusionLevel || 0)
            };

            // Get user onboarding data
            const user = await this.userService.findUserById(userId)
            const onboardingData = {
                targetCompany: user?.targetCompany || report.metadata?.targetCmp || "Not specified",
                targetRole: user?.targetRole || report.metadata?.title || "Not specified",
                daysLeft: user?.daysLeft || 30,
                skillsHave: user?.skillsHave || [],
                skillsNeeded: user?.skillsNeeded || [],
                careerGap: user?.careerGap || ""
            };

            // Generate personalized schedule using AI service
            const schedule = await this.aiService.generatePersonalizedSchedule(interviewScores, onboardingData)
            
            if (schedule) {
                // Save schedule to report
                await this.reportModel.findByIdAndUpdate(
                    reportId,
                    {
                        personalizedSchedule: schedule,
                        scheduleGenerated: true
                    },
                    { new: true }
                )

                // Also save to user profile and initialize schedule scores
                await this.userService.savePersonalizedSchedule(userId, schedule)
                const totalScore = schedule.totalPossibleScore || 0
                await this.userService.initializeScheduleScores(userId, totalScore)

                return { flag: "success", data: schedule }
            }

            return { flag: "fail", data: "Failed to generate schedule" }
        } catch (error) {
            console.log(error)
            return { flag: "fail", data: error.message }
        }
    }

    async getPersonalizedSchedule(reportId: any) {
        try {
            const report = await this.reportModel.findById(reportId)
            if (!report) return { flag: "fail", data: "Report not found" }

            if (!report.scheduleGenerated || !report.personalizedSchedule) {
                return { flag: "fail", data: "Schedule not yet generated" }
            }

            return { flag: "success", data: report.personalizedSchedule }
        } catch (error) {
            console.log(error)
            return { flag: "fail", data: error.message }
        }
    }

    async getUserPersonalizedSchedule(userId: any) {
        try {
            const schedule = await this.userService.getPersonalizedSchedule(userId)
            if (!schedule) {
                return { flag: "fail", data: "No personalized schedule found" }
            }
            return { flag: "success", data: schedule }
        } catch (error) {
            console.log(error)
            return { flag: "fail", data: error.message }
        }
    }
}
