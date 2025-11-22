import { IsUUID, IsInt, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class DiabetesPredictDto {
  @IsUUID()
  user_id: string;

  @IsInt()
  @Min(0)
  pregnancies: number;

  @IsInt()
  @Min(0)
  glucose: number;

  @IsInt()
  @Min(0)
  blood_pressure: number;

  @IsInt()
  @Min(0)
  skin_thickness: number;

  @IsInt()
  @Min(0)
  insulin: number;

  @IsNumber()
  @Min(0)
  bmi: number;

  @IsNumber()
  @Min(0)
  diabetes_pedigree_function: number;

  @IsInt()
  @Min(0)
  age: number;

  // allow optional fields in case frontend omits zeros
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  predicted_label?: number;
}
