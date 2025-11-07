import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHelper } from '../helpers/response.helper';

/**
 * Global HTTP Exception Filter
 * Handles all exceptions and returns standardized error responses
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HttpException (including NotFoundException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as {
        message: string;
        error: string;
      };

      // Extract message from exception response
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        message =
          exceptionResponse.message || exceptionResponse.error || message;
        error = exceptionResponse.error || this.getErrorName(status);
      } else {
        message = exception.message || message;
      }
    } else if (exception instanceof Error) {
      // Handle generic Error objects
      message = exception.message || message;
      error = exception.name || 'Error';
    }

    // Create standardized error response
    const errorResponse = ResponseHelper.error(
      message,
      error,
      status,
      request.url,
      request.method,
    );

    // Log the error for debugging
    console.error('Exception caught by HttpExceptionFilter:', {
      status,
      message,
      error,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      exception: exception instanceof Error ? exception.stack : exception,
    });

    // Send the response
    response.status(status).json(errorResponse);
  }

  /**
   * Get error name based on HTTP status code
   */
  private getErrorName(status: number): string {
    switch (status as HttpStatus) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.METHOD_NOT_ALLOWED:
        return 'Method Not Allowed';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too Many Requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      case HttpStatus.NOT_IMPLEMENTED:
        return 'Not Implemented';
      case HttpStatus.BAD_GATEWAY:
        return 'Bad Gateway';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable';
      default:
        return 'Error';
    }
  }
}
