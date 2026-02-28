import { Inject, Injectable } from '@nestjs/common';
import { AiPrompots } from './ai.prompts';
import { InnerAiService } from './ai.inner.service';

@Injectable()
export class AiService {
    constructor(
        @Inject() private readonly aiPrompts: AiPrompots,
        @Inject() private readonly innerServices: InnerAiService
    ) {}
    aiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`

    async evaluateAnswers(questions: string[], answers: string[]) {
        try {
            const prompt = this.aiPrompts.getEvaluationPrompt(questions, answers)
            console.log(prompt)
            return await this.innerServices.generateResponse(prompt)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async createCS(topic: string) {
        try {
            const prompt = this.aiPrompts.getCheatShPrompt(topic)
            console.log(prompt)
            return await this.innerServices.generateResponse(prompt)
        } catch (error) {
            console.log(error)
            return null
        }
    }

}
