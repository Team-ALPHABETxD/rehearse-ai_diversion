import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBody, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportDetailsDTO } from './report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { EmailService } from '../email/email.service';

@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
        private readonly emailService: EmailService
    ) {}

    @Get('email-test')
    @ApiOperation({ description: "Test" })
    async sendmail () {
        try {
            await this.emailService.sendEmail("samajdarsoumyajeet0@gmail.com", "Hello", "user-activation-mail", {userName: "Soumyo", otp: 14752})
            return {flag: "success!"}
        } catch (error) {
            console.log(error)
            return null
        }
    
    }

    @UseGuards(AuthGuard)
    @Post('create')
    @ApiBearerAuth()
    @ApiBody({ type: ReportDetailsDTO })
    @ApiOperation({ description: "Store interview report with questions, answers, and metadata" })
    async storeReport(
        @Body() reportData: ReportDetailsDTO, 
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        console.log(userId)
        if(!userId) 
            return new NotFoundException("User Not Found!")

        return await this.reportService.createReport(reportData, userId)
    }

    @UseGuards(AuthGuard)
    @Post('analyze')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                reportId: { type: 'string' }
            }
        }
    })
    @ApiOperation({ description: "Analyze a report (QnA + video) and save metrics" })
    async analyzeReport(
        @Body() data: any,
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        if(!userId) 
            return new NotFoundException("User Not Found!")

        return await this.reportService.analyseReport(data.reportId)
    }

    @UseGuards(AuthGuard)
    @Post('own')
    @ApiBearerAuth()
    @ApiOperation({ description: "Give all reports of an user" })
    async getReports(
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        console.log(userId)
        if(!userId) 
            return new NotFoundException("User Not Found!")

        return await this.reportService.giveReports(userId)
    }

    @UseGuards(AuthGuard)
    @Post('generate-schedule')
    @ApiBearerAuth()
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                reportId: { type: 'string' }
            }
        }
    })
    @ApiOperation({ description: "Generate personalized interview prep schedule for a report" })
    async generateSchedule(
        @Body() data: any,
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        if(!userId) 
            return new NotFoundException("User Not Found!")

        return await this.reportService.generatePersonalizedScheduleForReport(data.reportId, userId)
    }

    @UseGuards(AuthGuard)
    @Get('schedule/:reportId')
    @ApiBearerAuth()
    @ApiOperation({ description: "Get personalized schedule for a report" })
    async getSchedule(
        @Req() request: any
    ) {
        const reportId = request.params.reportId
        if(!reportId)
            return new NotFoundException("Report ID not provided!")

        return await this.reportService.getPersonalizedSchedule(reportId)
    }

    @UseGuards(AuthGuard)
    @Get('my-schedule')
    @ApiBearerAuth()
    @ApiOperation({ description: "Get user's current personalized schedule" })
    async getMySchedule(
        @Req() request: any
    ) {
        const userId = await request['user']['userId']
        if(!userId)
            return new NotFoundException("User Not Found!")

        return await this.reportService.getUserPersonalizedSchedule(userId)
    }
}
