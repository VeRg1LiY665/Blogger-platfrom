import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices.repository';
import { DeleteDeviceDto } from '../../../dto/delete-device.dto';

export class DeleteDeviceCommand {
    constructor(public dto: DeleteDeviceDto) {}
}

/**
 * Удаление авторизованным пользователем девайса
 */
@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand, void> {
    constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

    async execute({ dto }: DeleteDeviceCommand): Promise<void> {
        const device = await this.securityDevicesRepository.ShowDevice(dto.deviceId);
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
        return await this.securityDevicesRepository.DeleteDevice(device._id.toString());
    }
}
