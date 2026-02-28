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
            const res = await this.kafkaService.send('waited-reports', { reportId: reportId })
            console.log("Status of insertion in waiting room:" , res)
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

        // rcrd analysis data fetch from python db
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

            // Check if report has already been analyzed
            if (report.answersMetrics && report.answersMetrics.length > 0) {
                console.log(`Report ${reportId} has already been analyzed, skipping...`)
                return report.id
            }

            const answerMetrics = await this.analyseQnA(report.questions, report.answers)
            const videoMetrics = await this.analyseRcrd(report.recordURL ?? null)
            let personalityScore = 50, confusionLevel = 50, fluencyScore = 50
            if (videoMetrics) {
                personalityScore = (videoMetrics.blankvisual * (-0.4)
                    + videoMetrics.eyecontact * (0.6)
                    + videoMetrics.facevisible * (0.2)
                    + videoMetrics.softsmile * (0.8)
                ) % 100

                confusionLevel = (videoMetrics.blankvisual * (0.5)
                    + videoMetrics.eyecontact * (-0.6)
                    + videoMetrics.facevisible * (-0.2)
                    + videoMetrics.softsmile * (-0.8)
                ) % 100

                fluencyScore = (videoMetrics.blankvisual * (-0.4)
                    + videoMetrics.eyecontact * (0.6)
                    + videoMetrics.facevisible * (0.2)
                    + videoMetrics.softsmile * (0.8)
                ) % 100
            }


            // AI to evaluate 
            const hitScore = 78
            const sugg = "Never give up!"


            const evaluatedMetrices = {
                videoMetrics: videoMetrics,
                answersMetrics: answerMetrics,
                personalityScore: personalityScore,
                confusionLevel: confusionLevel,
                fluencyScore: fluencyScore,
                hitScore: hitScore,
                improvementSugg: sugg
            }

            await report.updateOne(evaluatedMetrices)
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
}
