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
    
    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: `scan${imageExt}`,
      encoding: '7bit',
      mimetype,
      buffer,
      size: buffer.length,
      stream: Readable.from(buffer),
      destination: '',
      filename: `scan${imageExt}`,
      path: '',
    };

    const mlPrediction = await this.mlClientService.predict(multerFile);

    // Create prediction record for the detection with highest confidence
    const highestConfidenceDetection = mlPrediction.detections.reduce(
      (prev, current) =>
        prev.confidence > current.confidence ? prev : current,
    );

    // Get the processed image (with bounding boxes) and upload to Cloudinary
    let outputImageUrl: string;

    try {
      if (!mlPrediction.outputBuffer) {
        throw new Error('No output image received from ML service');
      }

      // Create unique filename for the processed image
      const timestamp = new Date().getTime();
      const originalName = path.basename(scan.image_url);
      const newFilename = `detected_${timestamp}_${originalName}`;

      console.log('Uploading processed image to Cloudinary:', newFilename);

      // Upload the processed image (with bounding boxes) to Cloudinary
      outputImageUrl = await this.cloudinaryService.uploadImageBuffer({
        buffer: mlPrediction.outputBuffer,
        originalname: newFilename,
        mimetype: 'image/jpeg',
        size: mlPrediction.outputBuffer.length,
      } as Express.Multer.File);

      console.log('Successfully uploaded processed image:', outputImageUrl);
    } catch (error: unknown) {
      console.error('Failed to process or upload the image:', error);
      throw new Error(
        `Failed to process or upload the image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    const prediction = new Prediction();
    prediction.tumor_type = highestConfidenceDetection.class;
    prediction.confidence_score = highestConfidenceDetection.confidence;
    prediction.description = `Found ${mlPrediction.totalDetections} detection(s). Location: ${JSON.stringify(highestConfidenceDetection.bbox)}`;
    prediction.output_image_url = outputImageUrl;

    // Save prediction
    return this.predictionsRepository.save(prediction);
  }
}
