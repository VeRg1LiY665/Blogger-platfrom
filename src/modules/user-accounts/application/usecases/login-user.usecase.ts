import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../../dto/login-user.dto';
import { SecurityDevice, SecurityDeviceModelType } from '../../domain/device.entity';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { IatFactory } from '../factories/Iat.factory';
import { Inject } from '@nestjs/common';
import {
    ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
    REFRESH_TOKEN_STRATEGY_INJECT_TOKEN
} from '../../constants/auth-tokens.inject-constants';

export class LoginUserCommand {
    constructor(public dto: LoginUserDto) {}
}

/**
 * Логинизация пользователя через email&пароль
 */
@CommandHandler(LoginUserCommand)
export class LoginUserUseCase
    implements ICommandHandler<LoginUserCommand, { accessToken: string; refreshToken: string }>
{
    constructor(
        @InjectModel(SecurityDevice.name)
        private securityDevice: SecurityDeviceModelType,
        private devicesRepo: SecurityDevicesRepository,
        private iatFactory: IatFactory,
        @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        private accessTokenContext: JwtService,

        @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
        private refreshTokenContext: JwtService
    ) {}

    async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const { iat, refIat, rem } = this.iatFactory.create();

        const deviceDto = {
            userId: dto.userId,
            ip: dto.ip,
            title: dto.title,
            iat: iat
        };
        const device = this.securityDevice.createInstance(deviceDto);
        await this.devicesRepo.save(device);

        const accessToken = this.accessTokenContext.sign({
            id: dto.userId,
            deviceId: device._id.toString()
        });

        const refreshToken = this.refreshTokenContext.sign({
            id: dto.userId,
            deviceId: device._id.toString(),
            iat: refIat,
            rem: rem
        });
        //console.log(refreshToken);
        return {
            accessToken,
            refreshToken
        };
    }
}
