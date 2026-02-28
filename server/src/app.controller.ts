import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { ReportService } from './modules/report/report.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly reportService: ReportService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @MessagePattern('waited-reports')
  async handleWaitedReports(message: any) {
    try {
      console.log('Message received on waited-reports topic:', message);
      const res = await this.reportService.analyseReport(message.reportId)
      console.log(`[Task Completed]: Report Id ${message.reportId} has been evaluated`)      
    } catch (error) {
      console.error('Error processing message:', error)
      // Don't rethrow to prevent uncommitted offsets
    }
  }
}
