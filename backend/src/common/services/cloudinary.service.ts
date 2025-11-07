import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('cloudinary.url');
    const cloud_name = this.config.get<string>('cloudinary.cloud_name');
    const api_key = this.config.get<string>('cloudinary.api_key');
    const api_secret = this.config.get<string>('cloudinary.api_secret');

    // Prefer CLOUDINARY_URL if provided, otherwise use explicit credentials
    if (url) {
      try {
        const u = new URL(url);
        const parsedCloudName = u.hostname;
        const parsedApiKey = decodeURIComponent(u.username);
        const parsedApiSecret = decodeURIComponent(u.password);
        cloudinary.config({
          cloud_name: parsedCloudName,
          api_key: parsedApiKey,
          api_secret: parsedApiSecret,
          secure: true,
        });
      } catch (e) {
        // Fallback to env var if parsing fails
        process.env.CLOUDINARY_URL = url;
        cloudinary.config({ secure: true });
      }
    } else if (cloud_name && api_key && api_secret) {
      cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    } else {
      // Leave default config; uploads will fail clearly if misconfigured
      cloudinary.config({ secure: true });
    }
  }

  async uploadImageBuffer(
    file: any,
    options?: UploadApiOptions & { folder?: string },
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const folder = options?.folder || 'uploads';

    const streamUpload = () =>
      new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image', ...options },
          (error, result) => {
            if (error || !result)
              return reject(error || new Error('Upload failed'));
            resolve({ secure_url: result.secure_url });
          },
        );
        stream.end(file.buffer);
      });

    const { secure_url } = await streamUpload();
    return secure_url;
  }
}
