import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainException, Extension } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class RefreshGuard extends AuthGuard('refresh') {
    handleRequest(err, user) {
        if (err || !user) {
            // здесь можно выбросить любую свою ошибку
            throw new DomainException({
                code: DomainExceptionCode.Unauthorized,
                message: 'Unauthorized',
                extensions: [new Extension('REFRESH_ERROR: Refresh token is invalid', 'token')]
            });
        }
        return user;
    }
}
