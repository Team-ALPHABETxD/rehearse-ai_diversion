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
}
