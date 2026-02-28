import { Body, Controller, Get, NotFoundException, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ description: "Get user profile with onboarding data" })
    async getProfile(@Req() request: any) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const user = await this.userService.findUserById(userId)
        return { flag: "success", data: user }
    }

    @UseGuards(AuthGuard)
    @Put('onboarding')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                targetCompany: { type: 'string' },
                targetRole: { type: 'string' },
                daysLeft: { type: 'number' },
                skillsHave: { type: 'array', items: { type: 'string' } },
                skillsNeeded: { type: 'array', items: { type: 'string' } },
                careerGap: { type: 'string' }
            }
        }
    })
    @ApiOperation({ description: "Update user onboarding data" })
    async updateOnboarding(
        @Body() data: any,
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const updated = await this.userService.updateOnboardingData(userId, data)
        return { flag: "success", data: updated }
    }

    @UseGuards(AuthGuard)
    @Put('interview-scores')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                accuracy: { type: 'number' },
                fillerScore: { type: 'number' },
                behavioralScore: { type: 'number' },
                technicalScore: { type: 'number' },
                confidenceLevel: { type: 'number' }
            }
        }
    })
    @ApiOperation({ description: "Update user interview scores" })
    async updateScores(
        @Body() data: any,
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const updated = await this.userService.updateInterviewScores(userId, data)
        return { flag: "success", data: updated }
    }

    @UseGuards(AuthGuard)
    @Get('personalized-schedule')
    @ApiBearerAuth()
    @ApiOperation({ description: "Get user's personalized schedule" })
    async getSchedule(@Req() request: any) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const schedule = await this.userService.getPersonalizedSchedule(userId)
        if (!schedule) {
            return { flag: "fail", data: "No personalized schedule found" }
        }
        return { flag: "success", data: schedule }
    }

    @UseGuards(AuthGuard)
    @Post('complete-task')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                taskId: { type: 'string' },
                day: { type: 'number' },
                phase: { type: 'string' },
                category: { type: 'string' }
            }
        }
    })
    @ApiOperation({ description: "Mark a task as completed and add score to improvement" })
    async completeTask(
        @Body() data: any,
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const result = await this.userService.completeTask(userId, data)
        return result || { flag: "fail", data: "Failed to complete task" }
    }

    @UseGuards(AuthGuard)
    @Get('task-progress')
    @ApiBearerAuth()
    @ApiOperation({ description: "Get user's task completion progress and improvement score" })
    async getTaskProgress(@Req() request: any) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const progress = await this.userService.getTaskProgress(userId)
        return progress || { flag: "fail", data: "Failed to get progress" }
    }

    @UseGuards(AuthGuard)
    @Get('improvement-history')
    @ApiBearerAuth()
    @ApiOperation({ description: "Retrieve user's improvement history" })
    async getImprovementHistory(@Req() request: any) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const user = await this.userService.findUserById(userId)
        return { flag: "success", data: user?.improvementHistory || [] }
    }

    @UseGuards(AuthGuard)
    @Post('regen-schedule')
    @ApiBearerAuth()
    @ApiOperation({ description: "Regenerate personalized schedule based on current onboarding and scores" })
    async regenSchedule(@Req() request: any) {
        const userId = await request['user']['userId']
        if (!userId)
            return new NotFoundException("User Not Found!")

        const user = await this.userService.findUserById(userId)
        if (!user) return { flag: "fail", data: "User not found" }

        // call AI directly using user data
        const schedule = await this.userService.regenerateScheduleForUser(userId)
        return { flag: schedule ? "success" : "fail", data: schedule }
    }
}
