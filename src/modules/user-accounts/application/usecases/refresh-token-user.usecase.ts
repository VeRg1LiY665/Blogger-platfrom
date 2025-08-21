import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { DomainException, Extension } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { IatFactory } from '../factories/Iat.factory';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';
import { Inject } from '@nestjs/common';
import {
    ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
    REFRESH_TOKEN_STRATEGY_INJECT_TOKEN
} from '../../constants/auth-tokens.inject-constants';

export class RefreshTokenUserCommand {
    constructor(public dto: RefreshTokenDto) {}
}

/**
 * Логинизация пользователя через email&пароль
 */
@CommandHandler(RefreshTokenUserCommand)
export class RefreshTokenUserUseCase
    implements ICommandHandler<RefreshTokenUserCommand, { accessToken: string; refreshToken: string }>
{
    constructor(
        @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        private accessTokenContext: JwtService,

        @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        private refreshTokenContext: JwtService,
        private devicesSqlRepo: SecurityDevicesSqlRepository,
        private iatFactory: IatFactory
    ) {}

    async execute({ dto }: RefreshTokenUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const { iat, refIat, rem } = this.iatFactory.create();

        const device = await this.devicesSqlRepo.ShowDevice(dto.deviceId);
        if (!device) {
            //Error if secret is correct, but deviceId from payload is not
            throw new DomainException({
                code: DomainExceptionCode.Unauthorized,
                message: 'Invalid token',
                extensions: [new Extension('REFRESH_ERROR: Refresh token is depreciated', 'token')]
            });
        }

        if (this.iatFactory.rebuild({ iat: dto.iat, rem: dto.rem }) !== +device.iat) {
            throw new DomainException({
                // Error if depreciated token is in use (had been stolen after revoke)
                code: DomainExceptionCode.Unauthorized,
                message: 'Invalid token',
                extensions: [new Extension('REFRESH_ERROR: Refresh token is depreciated', 'token')]
            });
        }

        const accessToken = this.accessTokenContext.sign({ id: dto.userId, deviceId: device.id.toString() });

        const refreshToken = this.refreshTokenContext.sign({
            id: dto.userId,
            deviceId: device.id.toString(),
            iat: refIat,
            rem: rem
        });

        device.updateInstance(iat);
        await this.devicesSqlRepo.save(device);

        return {
            accessToken,
            refreshToken
        };
    }
}
