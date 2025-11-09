import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
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
  // ML service may return a single output image path or multiple paths
  outputImage: string | string[];
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
  ): Promise<MlPredictionResult & { outputBuffer?: Buffer | Buffer[]; requestId?: string }> {
    if (!file) throw new Error('File is required for prediction');

    const url = `${this.baseUrl}${this.predictPath}`;
    const form = new FormData();

    form.append('file', file.buffer, {
      filename: file.originalname || 'image.jpg',
      contentType: file.mimetype || 'image/jpeg',
      knownLength: file.size,
    } as FormData.AppendOptions);

  // Add a request identifier to help the ML service associate outputs with this request
  const requestId = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  form.append('request_id', requestId);
  const headers = form.getHeaders();
  console.log('ML request id:', requestId);

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

      // Get the output image path(s) from the response (may be string or array)
      const outputPathOrPaths = response.data.outputImage;

      // Normalize to array for fetching
      const outputPaths = Array.isArray(outputPathOrPaths)
        ? outputPathOrPaths
        : [outputPathOrPaths];

      // Construct full URLs and fetch all output images in parallel.
      // Handle both absolute URLs and relative paths returned by the ML service.
      // Add a cache-busting query param to avoid getting stale/incorrect files from proxies or CDN caches.
      const outputUrls = outputPaths.map((p) => {
        if (!p) return '';
        // If ML returned full URL, use it as-is
        if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) {
          return `${p}${p.includes('?') ? '&' : '?'}__cb=${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
        }
        // Otherwise treat as relative path and join with baseUrl ensuring single slash
        const prefix = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const suffix = (p as string).startsWith('/') ? (p as string) : `/${p}`;
        const url = `${prefix}${suffix}`;
        return `${url}${url.includes('?') ? '&' : '?'}__cb=${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      });
      console.log('Attempting to fetch output image(s) from:', JSON.stringify(outputUrls));

      const fetches = outputUrls.map((u) =>
        axios.get<Buffer>(u, { responseType: 'arraybuffer' }).then((r) => r.data),
      );

      const buffers = await Promise.all(fetches);

      // Ensure none are empty
      if (!buffers || buffers.length === 0 || buffers.some((b) => !b || b.length === 0)) {
        throw new Error('Received empty image data from ML service');
      }

      // Log buffer sizes and short hashes for diagnostics
      const bufferInfo = buffers.map((b) => {
        const hash = crypto.createHash('sha256').update(b).digest('hex').slice(0, 12);
        return { size: b.length, hash };
      });
      console.log('Fetched output buffer info:', JSON.stringify(bufferInfo));

      // Return single buffer when ML returned one, or array when multiple
      return {
        ...response.data,
        outputBuffer: buffers.length === 1 ? buffers[0] : buffers,
        outputImage: outputUrls.length === 1 ? outputUrls[0] : outputUrls,
        requestId,
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
