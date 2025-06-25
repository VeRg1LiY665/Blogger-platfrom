import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Error } from 'mongoose';
import ValidationError = Error.ValidationError;
import { MongooseErrorResponseBodyType } from './mongoose-error-response-body.type';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Ошибки валидации mongoose
@Catch(ValidationError)
export class MongooseErrorExceptionFilter implements ExceptionFilter {
    catch(exception: ValidationError, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        console.log(exception);
        const status = HttpStatus.BAD_REQUEST;
        const responseBody = this.buildResponseBody(exception);

        response.status(status).json(responseBody);
    }

    private buildResponseBody(exception: ValidationError): MongooseErrorResponseBodyType {
        const response: any = [];
        for (const error in exception.errors) {
            const body = {
                message: exception.errors[error].message,
                field: exception.errors[error].path
            };
            response.push(body);
        }
        return { errorsMessages: response };
    }
}
