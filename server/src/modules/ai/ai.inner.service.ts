import { Inject, Injectable } from '@nestjs/common';
import { AiPrompots } from './ai.prompts';

@Injectable()
export class InnerAiService {
    constructor(@Inject() private readonly aiPrompts: AiPrompots) {}
    aiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`

    async generateResponse(prompt: any) {
        try {
            const response = await fetch(this.aiEndpoint, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": prompt
                                }
                            ]
                        }
                    ]
                })
            })

            const data = await response.json()
            console.log(data)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            const cleanedText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim()
            return JSON.parse(cleanedText)
        } catch (error) {
            console.log(error)
            return null
        }
    }
}
