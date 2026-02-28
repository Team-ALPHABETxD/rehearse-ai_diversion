import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './modules/auth/auth.module';
import { ReportModule } from './modules/report/report.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UploadModule } from './modules/upload/upload.module';
import { join } from 'path';
import * as express from 'express';
import { AiModule } from './modules/ai/ai.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())

  // KAFKA microservice 
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:9092'],
      },
      consumer: {
        groupId: 'rehearsal-ai-group-v2',
        allowAutoCommit: true,
        autoCommitInterval: 1000,
        autoCommitThreshold: 1,
      },
      subscribe: {
        fromBeginning: false,
      },
    },
  });

  // Auth APIs Documentation
  const authConfig = new DocumentBuilder()
    .setTitle('Rehearse AI API')
    .setDescription('Auth APIs documentation')
    .setVersion('1.0')
    .build();

  const authDocument = SwaggerModule.createDocument(app, authConfig, {
    include: [AuthModule]
  });
  SwaggerModule.setup('auth-api-docs', app, authDocument);

  
  // Report APIs Documentation
  const reportConfig = new DocumentBuilder()
    .setTitle('Rehearse AI API')
    .setDescription('Report APIs documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const reportDocument = SwaggerModule.createDocument(app, reportConfig, {
    include: [ReportModule]
  });
  SwaggerModule.setup('report-api-docs', app, reportDocument);


  // Upload APIs Documentation
  const uploadConfig = new DocumentBuilder()
    .setTitle('Rehearse AI API')
    .setDescription('upload APIs documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const uploadDocument = SwaggerModule.createDocument(app, uploadConfig, {
    include: [UploadModule]
  });
  SwaggerModule.setup('upload-api-docs', app, uploadDocument);


  // AI apis
  const AIConfig = new DocumentBuilder()
    .setTitle('Rehearse AI API')
    .setDescription('ai APIs documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const AIDocument = SwaggerModule.createDocument(app, AIConfig, {
    include: [AiModule]
  });
  SwaggerModule.setup('ai-api-docs', app, AIDocument);

  // making files accessible globally
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));


  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log(`Auth API Document UI is running on http://localhost:${process.env.PORT || 3000}/auth-api-docs`)
  console.log(`Report API Document UI is running on http://localhost:${process.env.PORT || 3000}/report-api-docs`)
  console.log(`Upload API Document UI is running on http://localhost:${process.env.PORT || 3000}/upload-api-docs`)
  console.log(`AI API Document UI is running on http://localhost:${process.env.PORT || 3000}/ai-api-docs`)
  console.log(`Kafka UI is running on http://localhost:${process.env.KAFKA_UI_PORT || 8080}`)

}

bootstrap();