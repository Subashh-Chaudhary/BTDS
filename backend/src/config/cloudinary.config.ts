import { registerAs } from '@nestjs/config';

export type CloudinaryConfig = {
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
  url?: string;
};

export default registerAs(
  'cloudinary',
  (): CloudinaryConfig => ({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    url: process.env.CLOUDINARY_URL,
  }),
);
