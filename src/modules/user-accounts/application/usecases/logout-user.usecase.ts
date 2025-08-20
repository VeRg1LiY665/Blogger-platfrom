import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { IatFactory } from '../factories/Iat.factory';
import { RefreshContextDto } from '../../guards/dto/refresh-context.dto';
import { SecurityDevicesSqlRepository } from '../../infrastructure/security-devices.sql.repository';

export class LogoutUserCommand {
    constructor(public dto: RefreshContextDto) {} //TODO Separate DTO?
}

/**
 * Logout пользователя
 */
@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand, void> {
    constructor(
        private devicesSqlRepo: SecurityDevicesSqlRepository,
        private iatFactory: IatFactory
    ) {}

    async execute({ dto }: LogoutUserCommand): Promise<void> {
        const device = await this.devicesSqlRepo.ShowDevice(dto.deviceId);
        if (!device) {
            //Error if secret is correct, but device has been logged out
            throw new DomainException({
                code: DomainExceptionCode.Unauthorized,
                message: 'Device logged out',
                extensions: [new Extension('Device has been already logged out', 'token')]
            });
        }

        if (this.iatFactory.rebuild({ iat: BigInt(dto.iat), rem: dto.rem }) !== device.iat) {
            throw new DomainException({
                // Error if depreciated token is in use (had been stolen after revoke)
                code: DomainExceptionCode.Unauthorized,
                message: 'Invalid token',
                extensions: [new Extension('REFRESH_ERROR: Refresh token is depreciated', 'token')]
            });
        }

        await this.devicesSqlRepo.DeleteDevice(device.id.toString());
    }
}
