import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices.repository';
import { DeleteDeviceDto } from '../../../dto/delete-device.dto';
import { SecurityDevicesSqlRepository } from '../../../infrastructure/security-devices.sql.repository';

export class DeleteDeviceCommand {
    constructor(public dto: DeleteDeviceDto) {}
}

/**
 * Удаление авторизованным пользователем девайса
 */
@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand, void> {
    constructor(
        private securityDevicesRepository: SecurityDevicesRepository,
        private securityDevicesSqlRepository: SecurityDevicesSqlRepository
    ) {}

    async execute({ dto }: DeleteDeviceCommand): Promise<void> {
        const device = await this.securityDevicesSqlRepository.ShowDevice(dto.deviceId);
        if (!device) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Device not found'
            });
        }

        if (dto.userId !== device.userId) {
            //error if user tries to delete device of another user
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'Forbidden',
                extensions: [new Extension('Device to be deleted is not yours', 'token')]
            });
        }
        return await this.securityDevicesSqlRepository.DeleteDevice(device.id.toString());
    }
}
