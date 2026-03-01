import { Inject, Injectable } from '@nestjs/common';
import { AiPrompots } from './ai.prompts';
import { InnerAiService } from './ai.inner.service';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

@Injectable()
export class AiService {
    constructor(
        @Inject() private readonly aiPrompts: AiPrompots,
        @Inject() private readonly innerServices: InnerAiService
    ) { }
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


    async createQS(jobTitle: string, exp: string, skills: string[], projects: string[]) {
        try {
            const prompt = this.aiPrompts.getQuestionsPrompt(jobTitle, exp, skills, projects)
            console.log(prompt)
            return await this.innerServices.generateResponse(prompt)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async resumeService(path: string) {
        try {
            const resumeText = await this.innerServices.extractResumeData(path) as string
            const prompt = await this.aiPrompts.getResumePrompt(resumeText)
            return await this.innerServices.generateResponse(prompt)
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async generatePersonalizedSchedule(
        interviewScores: {
            accuracy?: number;
            fillerScore?: number;
            behavioralScore?: number;
            technicalScore?: number;
            confidenceLevel?: number;
        },
        onboardingData: {
            targetCompany: string;
            targetRole: string;
            daysLeft: number;
            skillsHave: string[];
            skillsNeeded?: string[];
            careerGap?: string;
        }
    ) {
        try {
            const prompt = this.aiPrompts.getPersonalizedSchedulePrompt(interviewScores, onboardingData)
            console.log('Generating personalized schedule...')
            return await this.innerServices.generateResponse(prompt)
        } catch (error) {
            console.log(error)
            return null
        }
    }


    async analyseVdo(path: string) {
        try {
            const prompt = this.aiPrompts.getVdoPrompt()
            return await this.innerServices.analyseVideo(prompt, path)
        } catch (error) {

        }
    }


    config = {
        api: {
            bodyParser: false,
        },
    };

    async transcript(audioBlob: any) {
        try {
            const elevenlabs = new ElevenLabsClient({
                apiKey: process.env.ELEVENLABS_API_KEY
            });

            const result = await elevenlabs.speechToText.convert({
                file: audioBlob,
                modelId: "scribe_v1",
                languageCode: "eng"
            });
            console.log(result)

            return result.text;
        } catch (error) {
            console.log(error)
            return null
        }
    }

}
