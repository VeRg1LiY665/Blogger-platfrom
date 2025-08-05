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
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';

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
        /*@InjectModel(SecurityDevice.name)
        private securityDevice: SecurityDeviceModelType,*/
        private devicesRepo: SecurityDevicesRepository,
        private devicesSqlRepo: SecurityDevicesSqlRepository,
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

        const device = SecurityDevice.createInstance(deviceDto);
        console.log(deviceDto.iat);
        await this.devicesSqlRepo.FindByTitle(dto.title, +dto.userId);
        const id = await this.devicesSqlRepo.save(device);

        const accessToken = this.accessTokenContext.sign({
            id: dto.userId,
            deviceId: id.toString()
        });

        const refreshToken = this.refreshTokenContext.sign({
            id: dto.userId,
            deviceId: id.toString(),
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
