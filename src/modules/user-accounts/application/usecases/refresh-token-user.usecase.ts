import { InjectModel } from '@nestjs/mongoose';
import { SecurityDevice, SecurityDeviceModelType } from '../../domain/device.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { DomainException, Extension } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

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
        @InjectModel(SecurityDevice.name)
        private securityDevice: SecurityDeviceModelType,
        private jwtService: JwtService,
        private devicesRepo: SecurityDevicesRepository
    ) {}

    async execute({ dto }: RefreshTokenUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const RefIat: number = Math.floor(Date.now()); //New iat for RToken in ms

        const device = await this.devicesRepo.ShowDevice(dto.deviceId);
        if (!device) {
            //Error if secret is correct, but deviceId from payload is not
            throw new DomainException({
                code: DomainExceptionCode.Unauthorized,
                message: 'Invalid token',
                extensions: [new Extension('REFRESH_ERROR: Refresh token is depreciated', 'token')]
            });
        }

        if (dto.iat !== device.iat) {
            throw new DomainException({
                // Error if depreciated token is in use (had been stolen after revoke)
                code: DomainExceptionCode.Unauthorized,
                message: 'Invalid token',
                extensions: [new Extension('REFRESH_ERROR: Refresh token is depreciated', 'token')]
            });
        }

        const accessToken = this.jwtService.sign(
            { id: dto.userId, deviceId: device._id.toString() },
            {
                secret: 'kjsjhd67t43b9v',
                expiresIn: '10s'
            }
        );

        const refreshToken = this.jwtService.sign(
            { id: dto.userId, deviceId: device._id.toString(), iat: RefIat },
            {
                secret: 'pokjcleYm&hd93g1!',
                expiresIn: '20s'
            }
        );

        device.updateInstance(RefIat);
        await this.devicesRepo.save(device);

        return {
            accessToken,
            refreshToken
        };
    }
}
