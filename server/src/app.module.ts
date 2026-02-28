import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ReportModule } from './modules/report/report.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule, UserModule, ReportModule, KafkaModule, AiModule, UploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }