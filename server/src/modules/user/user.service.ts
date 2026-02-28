import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { RegisterUserDTO } from '../auth/auth.dto';
import { AiService } from '../ai/ai.service';


@Injectable()
export class UserService {
    // user model injection as prop
    constructor(
        @InjectModel(User.name) private userModel : Model<User>,
        private readonly aiService: AiService
    ) {}

    async createUser (regDto: RegisterUserDTO) {
        try {
            const createdUser = await this.userModel.create(regDto)
            return createdUser   
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findUserByEmail (email: string) {
        try {
            const user = await this.userModel.findOne({email: email})
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async findUserById (id: any) {
        try {
            const user = await this.userModel.findById(id)
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async updateOnboardingData(userId: any, onboardingData: any) {
        try {
            const user = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    targetCompany: onboardingData.targetCompany,
                    targetRole: onboardingData.targetRole,
                    daysLeft: onboardingData.daysLeft,
                    skillsHave: onboardingData.skillsHave,
                    skillsNeeded: onboardingData.skillsNeeded,
                    careerGap: onboardingData.careerGap
                },
                { new: true }
            )
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async updateInterviewScores(userId: any, scores: any) {
        try {
            const user = await this.userModel.findByIdAndUpdate(
                userId,
                { interviewScores: scores },
                { new: true }
            )
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async savePersonalizedSchedule(userId: any, schedule: any) {
        try {
            const user = await this.userModel.findByIdAndUpdate(
                userId,
                { personalizedSchedule: schedule },
                { new: true }
            )
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getPersonalizedSchedule(userId: any) {
        try {
            const user = await this.userModel.findById(userId)
            return user?.personalizedSchedule || null
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async completeTask(userId: any, taskData: { taskId: string; day: number; phase: string; category: string }) {
        try {
            const user = await this.userModel.findById(userId)
            if (!user) return null

            // Find the task in the schedule to get the completionScore
            const schedule = user.personalizedSchedule
            let taskScore = 0
            let found = false

            if (schedule?.taskSchedule?.phases) {
                for (const phase of schedule.taskSchedule.phases) {
                    if (phase.dailyTasks) {
                        for (const dailyTask of phase.dailyTasks) {
                            if (dailyTask.taskId === taskData.taskId) {
                                taskScore = dailyTask.completionScore || 0
                                found = true
                                break
                            }
                        }
                    }
                    if (found) break
                }
            }

            // Only add if task wasn't previously completed
            const isAlreadyCompleted = user.completedTasks?.some(t => t.taskId === taskData.taskId)
            if (isAlreadyCompleted) {
                return { flag: "warning", data: "Task already completed" }
            }

            const completedTask = {
                ...taskData,
                completionScore: taskScore,
                completedAt: new Date()
            }

            // Update user with completed task
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    $push: { completedTasks: completedTask },
                    $inc: { totalEarnedScore: taskScore }
                },
                { new: true }
            )

            if (!updatedUser) {
                return { flag: "fail", data: "Failed to update user" }
            }

            // Calculate and update improvement score (percentage based)
            const earned = updatedUser.totalEarnedScore
            const improvementPercentage = Math.round(
                ( earned! / (updatedUser.totalScheduleScore || 100)) * 100
            )
            // update improvement and log history
            await this.userModel.findByIdAndUpdate(
                userId,
                { 
                    improvement: improvementPercentage,
                    $push: { improvementHistory: { date: new Date(), score: improvementPercentage } }
                },
                { new: true }
            )

            return { flag: "success", data: { completedTask, earnedScore: taskScore } }
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async getTaskProgress(userId: any) {
        try {
            const user = await this.userModel.findById(userId)
            if (!user) return null

            const totalTasks = user.personalizedSchedule?.taskSchedule?.phases
                ?.reduce((acc, phase) => acc + (phase.dailyTasks?.length || 0), 0) || 0

            return {
                flag: "success",
                data: {
                    totalScheduleScore: user.totalScheduleScore || 0,
                    totalEarnedScore: user.totalEarnedScore || 0,
                    improvementPercentage: user.improvement || 0,
                    completedTasksCount: user.completedTasks?.length || 0,
                    totalTasksCount: totalTasks,
                    completedTasks: user.completedTasks || []
                }
            }
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async initializeScheduleScores(userId: any, totalScheduleScore: number) {
        try {
            const user = await this.userModel.findByIdAndUpdate(
                userId,
                {
                    totalScheduleScore: totalScheduleScore,
                    totalEarnedScore: 0,
                    scheduleStarted: true,
                    scheduleStartedAt: new Date(),
                    completedTasks: [],
                    improvement: 0,
                    $push: { improvementHistory: { date: new Date(), score: 0 } }
                },
                { new: true }
            )
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

    // regenerate schedule purely from user profile (without report context)
    async regenerateScheduleForUser(userId: any) {
        try {
            const user = await this.userModel.findById(userId)
            if (!user) return null

            const interviewScores = user.interviewScores || {}
            const onboardingData = {
                targetCompany: user.targetCompany || "",
                targetRole: user.targetRole || "",
                daysLeft: user.daysLeft || 30,
                skillsHave: user.skillsHave || [],
                skillsNeeded: user.skillsNeeded || [],
                careerGap: user.careerGap || ""
            }

            // use AI service via report service or directly by injecting here
            // to avoid circular, we'll require AiService at constructor
            const schedule = await this.aiService.generatePersonalizedSchedule(interviewScores, onboardingData)
            if (schedule) {
                await this.userModel.findByIdAndUpdate(userId, { personalizedSchedule: schedule })
                const totalScore = schedule.totalPossibleScore || 0
                await this.initializeScheduleScores(userId, totalScore)
            }
            return schedule
        } catch (error) {
            console.log(error)
            return null
        }
    }
}
