import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { DomainException } from './domain-exceptions';
import { Request, Response } from 'express';
import { DomainExceptionCode } from './domain-exception-codes';
import { DomainErrorResponseBody } from './domain-error-response-body.type';

//https://docs.nestjs.com/exception-filters#exception-filters-1
//Ошибки класса DomainException (instanceof DomainException)
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
    catch(exception: DomainException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = this.mapToHttpStatus(exception.code);
        const responseBody = this.buildResponseBody(exception);
        response.status(status).json(responseBody);
    }

    private mapToHttpStatus(code: DomainExceptionCode): number {
        switch (code) {
            case DomainExceptionCode.BadRequest:
            case DomainExceptionCode.ValidationError:
            case DomainExceptionCode.ConfirmationCodeExpired:
            case DomainExceptionCode.EmailNotConfirmed:
            case DomainExceptionCode.PasswordRecoveryCodeExpired:
                return HttpStatus.BAD_REQUEST;
            case DomainExceptionCode.Forbidden:
                return HttpStatus.FORBIDDEN;
            case DomainExceptionCode.NotFound:
                return HttpStatus.NOT_FOUND;
            case DomainExceptionCode.Unauthorized:
                return HttpStatus.UNAUTHORIZED;
            case DomainExceptionCode.InternalServerError:
                return HttpStatus.INTERNAL_SERVER_ERROR;
            default:
                return HttpStatus.I_AM_A_TEAPOT;
        }
    }

    private buildResponseBody(exception: DomainException): DomainErrorResponseBody {
        const response: any = [];
        for (const extension of exception.extensions) {
            const body = {
                message: extension.message,
                field: extension.key
            };
            response.push(body);
        }
        return { errorsMessages: response };
    }
}
