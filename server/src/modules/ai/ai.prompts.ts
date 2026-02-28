import { Injectable } from "@nestjs/common"

@Injectable()
export class AiPrompots {
    getEvaluationPrompt(questions: string[], answers: string[]) {

        const formattedQA = questions.map((q, i) => {
            return `Question ${i + 1}: ${q}
            Answer ${i + 1}: ${answers[i] ?? ""}`
        }).join("\n\n")

        const prompt = `
            You are a professional HR interviewer evaluating candidate responses.

            Below are the interview questions and corresponding answers.

            ${formattedQA}

            INSTRUCTIONS:
            - Evaluate each question-answer pair separately.
            - Be precise, analytical, and objective.
            - Detect conceptual mistakes, communication gaps, weak structure, irrelevance, and confidence issues.
            - If the answer is empty or weak, reflect that in scoring.

            OUTPUT REQUIREMENTS (VERY IMPORTANT):
            - Return ONLY a valid JSON array.
            - Do NOT include markdown.
            - Do NOT include explanations.
            - Do NOT wrap the JSON in backticks.
            - Response must be strictly parseable JSON.
            - The response must start with "[" and end with "]".

            JSON SCHEMA (strictly follow this structure):

            [
            {
                "questionId": number,
                "suggestion": string,
                "flaw": string,
                "accuracy": number,
                "fillerScore": number
            }
            ]

            SCORING RULES:
            - accuracy: 0–100 (content correctness and depth)
            - fillerScore: 0–100 (higher means excessive filler words)

            Return the JSON array now.
            `

        return prompt
    }

    getCheatShPrompt(topic: string) {
        const prompt = `
        You are an expert technical educator and interview preparation strategist.

        Generate a highly structured, interview-focused cheatsheet for the topic: ${topic}.

        Target audience:
        - Candidates preparing for technical interviews
        - Need fast but deep revision (10–20 minutes)

        Return ONLY valid JSON. No extra text.

        The cheatsheet must:
        1. Cover all major concepts required for interviews.
        2. Be concise but conceptually complete.
        3. Flag critical concepts using: "isImportant": true.
        4. If the topic is:
        - Aptitude / Quantitative / Mathematics / Algorithms → include important formulas.
        - Core CS subject (OS, DBMS, CN, etc.) → include important equations, laws, or definitions where applicable.
        - Theoretical topic → include key definitions instead.

        JSON Schema:

        {
        "topic": string,
        "category": "technical | aptitude | theory",
        "revisionTimeMinutes": number,
        "sections": [
            {
            "title": string,
            "isImportant": boolean,
            "summary": string,
            "keyPoints": [
                {
                "point": string,
                "isImportant": boolean
                }
            ]
            }
        ],
        "formulas": [
            {
            "name": string,
            "expression": string,
            "variables": [
                {
                "symbol": string,
                "meaning": string
                }
            ],
            "whenToUse": string,
            "isImportant": boolean
            }
        ],
        "interviewQuestions": [
            {
            "question": string,
            "answerSummary": string,
            "isImportant": boolean
            }
        ],
        "diagram": {
            "type": "graph | flow | math-visual | null",
            "nodes": [],
            "edges": [],
            "flowExplanation": string
        }
        }

        Rules:
        - If formulas are not relevant, return empty array.
        - If topic is formula-heavy (e.g., Probability, Time & Work, OS scheduling, TCP congestion control), include all high-frequency formulas.
        - Flag formulas commonly asked in interviews as isImportant: true.
        - Ensure JSON is valid.
        `

        return prompt;
    }

    getQuestionsPrompt(jobTitle: string, exp: string, skills: string[], projects: string[]) {
        const prompt = `
            You are an expert technical interviewer.

            Your task is to generate exactly 5 high-quality interview questions based on the candidate profile provided below.

            Candidate Profile:
            - Job Title: ${jobTitle}
            - Years of Experience: ${exp}
            - Skills: ${skills}
            - Projects: ${projects}

            Instructions:
            1. Generate questions relevant to the job role and experience level.
            2. Questions should evaluate practical understanding, real-world problem solving, and conceptual clarity.
            3. Prefer scenario-based or applied questions over theoretical ones.
            4. Avoid generic or overly simple questions.
            5. Questions must reflect the candidate’s listed skills and projects.
            6. Generate EXACTLY 5 questions.

            Output Rules:
            - Return ONLY valid JSON.
            - Do NOT include explanations, numbering, markdown, or extra text.
            - The JSON must contain only one key: "questions".
            - The value must be an array of strings.

            Output Format:

            {
            "questions": [
                "Question 1",
                "Question 2",
                "Question 3",
                "Question 4",
                "Question 5"
            ]
            }
        `

        return prompt
    }

    getResumePrompt(resume: string) {
        const prompt = `
            You are an intelligent resume parsing system.

            Your task is to extract ONLY the candidate's SKILLS and PROJECTS from the provided resume text.

            Resume Text:
            """
            ${resume}
            """

            Instructions:

            1. Extract skills mentioned explicitly in the resume.
            2. Separate skills into:
            - technicalSkills
            - softSkills
            - toolsAndTechnologies
            3. Normalize skills:
            - Remove duplicates
            - Fix casing (e.g., react → React)
            - Ignore languages spoken (English, Hindi, etc.)
            4. Extract all projects mentioned.
            5. Each project must contain:
            - projectTitle
            - technologiesUsed (if mentioned, otherwise empty array)
            6. Do NOT invent skills or projects.
            7. Ignore education, certifications, achievements, or extracurricular activities unless they directly describe a project.
            8. Return ONLY valid JSON.
            9. If something is missing, return an empty array instead of null.
            10. If not an resume content return { validation: "fail" }

            Output Format:

            {
            "technicalSkills": [],
            "softSkills": [],
            "toolsAndTechnologies": [],
            "projects": [
                {
                "projectTitle": "",
                "technologiesUsed": []
                }
            ]
            }
        `

        return prompt
    }
}