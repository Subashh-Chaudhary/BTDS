export interface IApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
    meta: {
        timestamp: string;
        path?: string;
        method?: string;
    };
}
export interface IApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error: string;
    data: null;
    meta: {
        timestamp: string;
        path?: string;
        method?: string;
    };
}
export interface IApiSuccessResponse<T = any> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    meta: {
        timestamp: string;
        path?: string;
        method?: string;
    };
}
export interface IPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface IPaginatedResponse<T> {
    items: T[];
    pagination: IPaginationMeta;
}
