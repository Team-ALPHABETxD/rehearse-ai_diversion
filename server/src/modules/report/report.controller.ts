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
}
