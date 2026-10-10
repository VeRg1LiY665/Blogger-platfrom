import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from './error-response-body.type';
import { DomainExceptionCode } from './domain-exception-codes';
import { CoreConfig } from '../core.config';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Все ошибки
@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
    constructor(@Inject() private readonly coreConfig: CoreConfig) {}

    catch(exception: any, host: ArgumentsHost): void {
        //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        //Если сработал этот фильтр, то пользователю улетит 500я ошибка
        const message = exception.message || 'Unknown exception occurred.';
        const status = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
        const responseBody = this.buildResponseBody(request.url, message);
        console.error(exception);
        response.status(status).json(responseBody);
    }

    private buildResponseBody(requestUrl: string, message: string): ErrorResponseBody {
        //get .env from coreConfig done
        const isProduction = this.coreConfig.env === 'production';

        if (isProduction) {
            return {
                timestamp: new Date().toISOString(),
                path: null,
                message: 'Some error occurred',
                extensions: [],
                code: DomainExceptionCode.InternalServerError
            };
        }

        return {
            timestamp: new Date().toISOString(),
            path: requestUrl,
            message,
            extensions: [],
            code: DomainExceptionCode.InternalServerError
        };
    }
}
