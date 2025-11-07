import { registerAs } from '@nestjs/config';

export default registerAs('ml', () => ({
  serviceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  predictPath: process.env.ML_PREDICT_PATH || '/predict',
}));
