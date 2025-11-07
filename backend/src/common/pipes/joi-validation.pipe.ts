import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  transform(value: unknown): unknown {
    const validationResult = this.schema.validate(value, {
      abortEarly: false,
    });

    if (validationResult.error) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: validationResult.error.details.map((detail) => detail.message),
      });
    }

    return validationResult.value;
  }
}
