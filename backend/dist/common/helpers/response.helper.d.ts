import { IApiErrorResponse, IApiSuccessResponse, IPaginatedResponse } from '../interfaces/api-response.interface';
export declare class ResponseHelper {
    static success<T>(data: T, message?: string, statusCode?: number, path?: string, method?: string): IApiSuccessResponse<T>;
    static error(message: string, error: string, statusCode?: number, path?: string, method?: string): IApiErrorResponse;
    static paginated<T>(items: T[], page: number, limit: number, total: number, message?: string, path?: string, method?: string): IApiSuccessResponse<IPaginatedResponse<T>>;
    static created<T>(data: T, message?: string, path?: string, method?: string): IApiSuccessResponse<T>;
    static noContent(message?: string, path?: string, method?: string): IApiSuccessResponse<{
        message: string;
    }>;
}
