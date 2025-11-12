import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  feedback_text: string;
}
