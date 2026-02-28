import { Prop } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class InterviewCTX {
    @ApiProperty({ example: "any" })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    title: string;

    @ApiProperty({ example: "5 mins" })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    dur: string;

    @ApiProperty({ example: "google" })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    targetCmp: string;
}


export class ReportDetailsDTO {
    @ApiProperty({ type: InterviewCTX })
    @ValidateNested()
    @Type(() => InterviewCTX)
    @IsNotEmpty()
    @Prop({ required: true })
    metadata: InterviewCTX;

    @ApiProperty({ example: "any" })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    recordURL: string;

    @ApiProperty({ example: ["any"] })
    @IsArray()
    @IsNotEmpty()
    @Prop({ required: true })
    questions: [string];

    @ApiProperty({ example: ["any"] })
    @IsArray()
    @IsNotEmpty()
    @Prop({ required: true })
    answers: [string];
}