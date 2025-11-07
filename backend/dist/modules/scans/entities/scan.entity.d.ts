import { Users } from '../../users/entities/users.entity';
import { Prediction } from '../../predictions/entities/prediction.entity';
export declare class Scan {
    id: string;
    image_url: string;
    user: Users;
    user_id: string;
    model_prediction: Prediction;
    model_prediction_id: string;
    uploaded_at: Date;
}
