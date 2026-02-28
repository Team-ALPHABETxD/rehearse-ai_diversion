import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './report.schema';
import { EmailModule } from '../email/email.module';
import { KafkaModule } from '../kafka/kafka.module';
import { AiModule } from '../ai/ai.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
      MongooseModule.forFeature([{name: Report.name, schema: ReportSchema}]),
      EmailModule,
      KafkaModule,
      AiModule,
      EmailModule,
      UserModule
    ],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService]
})
export class ReportModule {}
