import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { AiPrompots } from './ai.prompts';
import { AiController } from './ai.controller';
import { InnerAiService } from './ai.inner.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [AiService, AiPrompots, InnerAiService],
  exports: [AiService],
  controllers: [AiController]
})
export class AiModule {}
