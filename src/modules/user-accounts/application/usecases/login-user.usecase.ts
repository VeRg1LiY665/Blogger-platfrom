import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../../dto/login-user.dto';
import { SecurityDevice, SecurityDeviceModelType } from '../../domain/device.entity';
import { SecurityDevicesRepository } from '../../infrastructure/security-devices.repository';

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
        @InjectModel(User.name)
        private userModel: UserModelType, //TODO убрать это вообще отсюда
        @InjectModel(SecurityDevice.name)
        private securityDevice: SecurityDeviceModelType,
        private jwtService: JwtService,
        private devicesRepo: SecurityDevicesRepository
    ) {}

    async execute({ dto }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
        const RefIat: number = Math.floor(Date.now());

        const deviceDto = {
            userId: dto.userId,
            ip: dto.ip,
            title: dto.title,
            iat: RefIat
        };
        const device = this.securityDevice.createInstance(deviceDto);
        await this.devicesRepo.save(device);

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
        console.log(refreshToken);
        return {
            accessToken,
            refreshToken
        };
    }
}
