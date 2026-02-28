import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ReportDetailsDTO } from './report.dto';

export type ReportDocument = HydratedDocument<Report>;

class VideoMetrics {
  facevisible: number;
  eyecontact: number;
  blankvisual: number;
  softsmile: number
} 

export class AnswerMetrics {
  questionId: number;
  suggestion: string;
  flaw: string;
  accuracy: number;
  fillerScore: number;
}


@Schema()
export class Report extends ReportDetailsDTO {
  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ ref: 'User' })
  interviewer: mongoose.Schema.Types.ObjectId;

  @Prop()
  videoMetrics: VideoMetrics

  @Prop()
  answersMetrics: AnswerMetrics[]

  @Prop() 
  personalityScore: number

  @Prop()
  fluencyScore: number;

  @Prop() 
  confusionLevel: number;

  @Prop()
  hitScore: number

  @Prop()
  improvementSugg: string
}

export const ReportSchema = SchemaFactory.createForClass(Report);