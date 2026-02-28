import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor (
        @Inject() private readonly aiService: AiService
    ) {}


    @Post('/cheatsheet')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                topic: {
                    type: 'string',
                },
            },
        },
    })
    @ApiOperation({ description: "Cheatsheet Generation" })
    async generateChSheet (@Body() data: any) {
        const res = await this.aiService.createCS(data.topic)
        console.log(res)
        return { flag: "succes", data: res }
    }

    @Post('/questions')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                jobTitle: {
                    type: 'string'
                },
                exp: {
                    type: 'string'
                },
                skills: {
                    type: 'array',
                },
                projects: {
                    type: 'array'
                }
            },
        },
    })
    @ApiOperation({ description: "Interview questions Generation" })
    async generateQuess (@Body() data: any) {
        const { jobTitle, exp, skills, projects } =  data
        const res = await this.aiService.createQS(jobTitle, exp, skills, projects)
        console.log(res)
        return { flag: "succes", data: res }
    }


    @Post('/resume')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string'
                }
            },
        },
    })
    @ApiOperation({ description: "Interview questions Generation" })
    async analyseResume (@Body() data: any) {
        const res = await this.aiService.resumeService(data.path)
        console.log(res)
        return { flag: "succes", data: res }
    }
}
