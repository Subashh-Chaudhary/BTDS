import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MlClientService } from '../../common/services/ml-client.service';
import { CloudinaryService } from '../../common/services/cloudinary.service';
import { Scan } from './entities/scan.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { Readable } from 'stream';
import * as path from 'path';

@Injectable()
export class ScansMlService {
  constructor(
    @InjectRepository(Prediction)
    private predictionsRepository: Repository<Prediction>,
    private readonly mlClientService: MlClientService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getPrediction(scan: Scan): Promise<Prediction> {
    // Get prediction from ML service
    console.log('Fetching image from:', scan.image_url);
    
    // Get the image from Cloudinary
    const imageResponse = await fetch(scan.image_url);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    if (buffer.length === 0) {
      throw new Error('Received empty image buffer from Cloudinary');
    }
    
    // Determine mimetype from Cloudinary URL
    const imageExt = path.extname(scan.image_url).toLowerCase();
    const mimetype = imageExt === '.png' ? 'image/png' : 'image/jpeg';
    
    console.log('Image details:', {
      size: buffer.length,
      mimetype,
      url: scan.image_url
    });
    
    const uniqueId = `${new Date().getTime()}_${Math.random().toString(36).slice(2,8)}`;
    const uniqueOriginalName = `scan_${uniqueId}${imageExt}`;

    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: uniqueOriginalName,
      encoding: '7bit',
      mimetype,
      buffer,
      size: buffer.length,
      stream: Readable.from(buffer),
      destination: '',
      filename: uniqueOriginalName,
      path: '',
    };

    const mlPrediction = await this.mlClientService.predict(multerFile);
    console.log('ML prediction summary:', {
      totalDetections: mlPrediction?.totalDetections,
      detections: Array.isArray(mlPrediction?.detections) ? mlPrediction.detections.length : 0,
      outputImage: mlPrediction?.outputImage,
      requestId: (mlPrediction as any)?.requestId,
    });

    // Guard: if the ML service returned no detections, return a safe prediction
    if (!mlPrediction || !Array.isArray(mlPrediction.detections) || mlPrediction.detections.length === 0) {
      // Try to upload outputBuffer if the ML service produced a processed image, but don't fail if upload fails
      let outputImageUrl: string | null = null;
      try {
        if (mlPrediction && mlPrediction.outputBuffer) {
          // Support single Buffer or array of Buffers
          const buffers: Buffer[] = Array.isArray(mlPrediction.outputBuffer)
            ? mlPrediction.outputBuffer
            : [mlPrediction.outputBuffer as Buffer];

          const uploadedUrls: string[] = [];
          for (let i = 0; i < buffers.length; i++) {
            try {
              const timestamp = new Date().getTime();
              const originalName = path.basename(scan.image_url);
              const newFilename = `detected_${timestamp}_${i}_${originalName}`;

              const url = await this.cloudinaryService.uploadImageBuffer({
                buffer: buffers[i],
                originalname: newFilename,
                mimetype: 'image/jpeg',
                size: buffers[i].length,
              } as Express.Multer.File);
              uploadedUrls.push(url);
            } catch (uploadErr) {
              console.error('Failed to upload one of processed images for no-detections case:', uploadErr);
              // continue uploading remaining buffers
            }
          }

          if (uploadedUrls.length === 1) outputImageUrl = uploadedUrls[0];
          else if (uploadedUrls.length > 1) outputImageUrl = JSON.stringify(uploadedUrls);
        }
      } catch (err) {
        console.error('Failed to upload processed image for no-detections case:', err);
        // proceed without output image
        outputImageUrl = null;
      }

  const safePrediction = new Prediction();
      // Use explicit "none"/0 values so DB columns are satisfied and callers can detect this case
      safePrediction.tumor_type = 'none';
      safePrediction.confidence_score = 0;
  safePrediction.description = `No detections | ml_request_id=${(mlPrediction as any)?.requestId ?? 'n/a'}`;
      safePrediction.output_image_url = outputImageUrl ?? '';

      return this.predictionsRepository.save(safePrediction);
    }

    // Create prediction record for the detection with highest confidence
    const highestConfidenceDetection = mlPrediction.detections.reduce((prev, current) =>
      prev.confidence > current.confidence ? prev : current,
    );

    // Get the processed image(s) (with bounding boxes) and upload to Cloudinary
    let outputImageUrl: string;

    try {
      if (!mlPrediction.outputBuffer) {
        throw new Error('No output image received from ML service');
      }

      // Support single Buffer or array of Buffers
      const buffers: Buffer[] = Array.isArray(mlPrediction.outputBuffer)
        ? mlPrediction.outputBuffer
        : [mlPrediction.outputBuffer as Buffer];

      const uploadedUrls: string[] = [];
      for (let i = 0; i < buffers.length; i++) {
        // Create unique filename for each processed image
        const timestamp = new Date().getTime();
        const originalName = path.basename(scan.image_url);
        const newFilename = `detected_${timestamp}_${i}_${originalName}`;

        console.log('Uploading processed image to Cloudinary:', newFilename);

        try {
          const url = await this.cloudinaryService.uploadImageBuffer({
            buffer: buffers[i],
            originalname: newFilename,
            mimetype: 'image/jpeg',
            size: buffers[i].length,
          } as Express.Multer.File);
          uploadedUrls.push(url);
          console.log('Successfully uploaded processed image:', url);
        } catch (uploadErr) {
          console.error('Failed to upload one processed image:', uploadErr);
          // continue uploading remaining images
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('Failed to upload any processed images to Cloudinary');
      }

      // If multiple, store JSON array string so callers can see all URLs; otherwise store single URL
      outputImageUrl = uploadedUrls.length === 1 ? uploadedUrls[0] : JSON.stringify(uploadedUrls);
    } catch (error: unknown) {
      console.error('Failed to process or upload the image:', error);
      throw new Error(
        `Failed to process or upload the image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    const prediction = new Prediction();
    prediction.tumor_type = highestConfidenceDetection.class;
    prediction.confidence_score = highestConfidenceDetection.confidence;
    prediction.description = `Found ${mlPrediction.totalDetections} detection(s). Location: ${JSON.stringify(
      highestConfidenceDetection.bbox,
    )} | ml_request_id=${(mlPrediction as any)?.requestId ?? 'n/a'}`;
    prediction.output_image_url = outputImageUrl;

    // Save prediction
    return this.predictionsRepository.save(prediction);
  }
}
