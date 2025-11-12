import { IsString, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  feedback_text?: string;
}
