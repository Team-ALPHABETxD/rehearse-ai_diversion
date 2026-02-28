import { Inject, Injectable } from '@nestjs/common';
import { AiPrompots } from './ai.prompts';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';

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


    async extractResumeData(filePath: string) {
    try {
      let buffer: Buffer;

      // Check if it's a cloud/remote URL (http/https)
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // Fetch PDF from cloud URL
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
        }
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        // Assume it's a local file path
        buffer = fs.readFileSync(filePath);
      }

      const data = await pdfParse(buffer);
      const extractedText = data.text;
      console.log('Extracted text:', extractedText.substring(0, 100) + '...');

      return extractedText
        .replace(/\s+/g, ' ')
        .trim();

    } catch (error) {
      console.error('Resume parsing failed:', error);
    }
  }
}
