import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().optional().default(3001),

  // Admin Credentials
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(6).required(),
  ADMIN_NAME: Joi.string().optional().default('System Administrator'),
  ADMIN_PHONE: Joi.string().optional().default('+1234567890'),
  ADMIN_ADDRESS: Joi.string().optional().default('System Address'),

  // Cloudinary (require either URL or individual credentials)
  CLOUDINARY_URL: Joi.string().uri().optional(),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),

  // ML service (Python FastAPI)
  ML_SERVICE_URL: Joi.string().uri().optional(),
  ML_PREDICT_PATH: Joi.string().optional().default('/predict'),
}).custom((value, helpers) => {
  const hasUrl = !!value.CLOUDINARY_URL;
  const hasParts =
    !!value.CLOUDINARY_CLOUD_NAME &&
    !!value.CLOUDINARY_API_KEY &&
    !!value.CLOUDINARY_API_SECRET;
  if (!hasUrl && !hasParts) {
    return helpers.error('any.invalid', {
      message:
        'Provide either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET',
    });
  }
  return value;
});
