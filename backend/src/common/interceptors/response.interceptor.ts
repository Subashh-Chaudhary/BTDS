// src/common/interceptors/response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<unknown>> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();
    const statusCode = response?.statusCode ?? HttpStatus.OK;
    const message = this.getDefaultMessage(statusCode);

    return next.handle().pipe(
      map((data: IApiResponse<unknown>) => ({
        success: true,
        statusCode,
        message: data.message || message,
        data: data.data,
        meta: data.meta || {
          timestamp: new Date().toISOString(),
          path: request?.url,
          method: request?.method,
        },
      })),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages = {
      [HttpStatus.CREATED]: 'Resource created successfully',
      [HttpStatus.OK]: 'Operation successful',
    };
    return messages[statusCode] as string;
  }
}
