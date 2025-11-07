import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IApiResponse } from '../interfaces/api-response.interface';
export declare class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IApiResponse<unknown>>;
    private getDefaultMessage;
}
