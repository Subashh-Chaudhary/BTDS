import { HttpStatus } from '@nestjs/common';
import {
  IApiErrorResponse,
  IApiSuccessResponse,
  IPaginatedResponse,
  IPaginationMeta,
} from '../interfaces/api-response.interface';

/**
 * Response Helper Service
 * Provides standardized methods for creating API responses
 */
export class ResponseHelper {
  /**
   * Create a successful API response
   * @param data - Response data
   * @param message - Success message
   * @param statusCode - HTTP status code (default: 200)
   * @param path - Request path (optional)
   * @param method - HTTP method (optional)
   * @returns Standardized success response
   */
  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    statusCode: number = HttpStatus.OK,
    path?: string,
    method?: string,
  ): IApiSuccessResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        path,
        method,
      },
    };
  }

  /**
   * Create an error API response
   * @param message - Error message
   * @param error - Error details
   * @param statusCode - HTTP status code (default: 400)
   * @param path - Request path (optional)
   * @param method - HTTP method (optional)
   * @returns Standardized error response
   */
  static error(
    message: string,
    error: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    path?: string,
    method?: string,
  ): IApiErrorResponse {
    return {
      success: false,
      statusCode,
      message,
      error,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path,
        method,
      },
    };
  }

  /**
   * Create a paginated response
   * @param items - Array of items
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @param message - Success message
   * @param path - Request path (optional)
   * @param method - HTTP method (optional)
   * @returns Standardized paginated response
   */
  static paginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Data retrieved successfully',
    path?: string,
    method?: string,
  ): IApiSuccessResponse<IPaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const paginationMeta: IPaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };

    const paginatedData: IPaginatedResponse<T> = {
      items,
      pagination: paginationMeta,
    };

    return this.success(paginatedData, message, HttpStatus.OK, path, method);
  }

  /**
   * Create a created response (201 status)
   * @param data - Created resource data
   * @param message - Success message
   * @param path - Request path (optional)
   * @param method - HTTP method (optional)
   * @returns Standardized created response
   */
  static created<T>(
    data: T,
    message: string = 'Resource created successfully',
    path?: string,
    method?: string,
  ): IApiSuccessResponse<T> {
    return this.success(data, message, HttpStatus.CREATED, path, method);
  }

  /**
   * Create a no content response (204 status)
   * @param message - Success message
   * @param path - Request path (optional)
   * @param method - HTTP method (optional)
   * @returns Standardized no content response
   */
  static noContent(
    message: string = 'Operation completed successfully',
    path?: string,
    method?: string,
  ): IApiSuccessResponse<{ message: string }> {
    return this.success(
      { message },
      message,
      HttpStatus.NO_CONTENT,
      path,
      method,
    );
  }
}
