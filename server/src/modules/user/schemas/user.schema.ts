import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export interface CompletedTask {
  taskId: string;
  day: number;
  phase: string;
  completionScore: number;
  completedAt: Date;
  category: string;
}

@Schema()
export class User {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: "client" })
  role: string;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: 0 })
  improvement: number;

  @Prop({ type: [Object], default: [] })
  improvementHistory?: { date: Date; score: number }[];

  @Prop({ default: Date.now() })
  createdAt: Date

  // Onboarding & Interview Data
  @Prop()
  targetCompany?: string;

  @Prop()
  targetRole?: string;

  @Prop()
  daysLeft?: number;

  @Prop()
  skillsHave?: string[];

  @Prop()
  skillsNeeded?: string[];

  @Prop()
  careerGap?: string;

  // Interview Performance Metrics
  @Prop({ type: Object, default: {} })
  interviewScores?: {
    accuracy?: number;
    fillerScore?: number;
    behavioralScore?: number;
    technicalScore?: number;
    confidenceLevel?: number;
  };

  @Prop({ type: Object, default: {} })
  personalizedSchedule?: Record<string, any>; // JSON object from AI

  // Task Tracking & Improvement Score
  @Prop({ type: [Object], default: [] })
  completedTasks?: CompletedTask[];

  @Prop({ default: 0 })
  totalScheduleScore?: number; // Total possible score from schedule

  @Prop({ default: 0 })
  totalEarnedScore?: number; // Score earned from completed tasks

  @Prop({ default: false })
  scheduleStarted?: boolean;

  @Prop({ type: Date })
  scheduleStartedAt?: Date;

  @Prop({ type: Date })
  scheduleDeadline?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);