import { IsUUID, IsString, IsInt, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreatePredictionResultDto {
    @IsUUID()
    prediction_id: string;

    @IsString()
    model_name: string;

    @IsInt()
    @Min(0)
    @Max(1)
    prediction_value: number;

    @IsNumber()
    @Min(0)
    @Max(1)
    probability: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1)
    ensemble_prediction?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    ensemble_confidence?: number;
}
