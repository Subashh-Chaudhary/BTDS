import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import axios from 'axios';

export interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

export interface MlPredictionResult {
  totalDetections: number;
  detections: Detection[];
  outputImage: string;
}

@Injectable()
export class MlClientService {
  private readonly baseUrl: string;
  private readonly predictPath: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'ml.serviceUrl',
      'http://localhost:8000',
    );
    this.predictPath = this.config.get<string>('ml.predictPath', '/predict');
  }

  async predict(
    file: Express.Multer.File,
  ): Promise<MlPredictionResult & { outputBuffer?: Buffer }> {
    if (!file) throw new Error('File is required for prediction');

    const url = `${this.baseUrl}${this.predictPath}`;
    const form = new FormData();

    form.append('file', file.buffer, {
      filename: file.originalname || 'image.jpg',
      contentType: file.mimetype || 'image/jpeg',
      knownLength: file.size,
    } as FormData.AppendOptions);

    const headers = form.getHeaders();

    try {
      const response = await axios.post<MlPredictionResult>(url, form, {
        headers,
        validateStatus: (status) => status === 200,
        timeout: 30000, // 30 second timeout
      });

      // Log the ML service response for debugging
      console.log('ML Service response:', JSON.stringify(response.data, null, 2));

      // Ensure the base URL is properly formatted
      const baseUrl = this.baseUrl.endsWith('/')
        ? this.baseUrl.slice(0, -1)
        : this.baseUrl;

      // Get the output image path from the response
      const outputPath = response.data.outputImage;

      // Construct the full URL
      const imageUrl = `${baseUrl}${outputPath}`;
      console.log('Attempting to fetch predicted image from:', imageUrl);
      console.log('Attempting to fetch output image from:', imageUrl);

      const imageResponse = await axios.get<Buffer>(imageUrl, {
        responseType: 'arraybuffer',
      });

      if (!imageResponse.data || imageResponse.data.length === 0) {
        throw new Error('Received empty image data');
      }

      return {
        ...response.data,
        outputBuffer: imageResponse.data,
        outputImage: imageUrl,
      };
    } catch (error: unknown) {
      console.error('Failed to fetch output image:', error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';
      throw new Error(`Failed to fetch output image: ${message}`);
    }
  }
}
