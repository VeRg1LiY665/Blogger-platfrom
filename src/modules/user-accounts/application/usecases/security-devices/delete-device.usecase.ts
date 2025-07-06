import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices.repository';

export class DeleteDeviceCommand {
    constructor(public id: string) {}
}

/**
 * Удаление авторизованным пользователем девайса
 */
@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase implements ICommandHandler<DeleteDeviceCommand, void> {
    constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

    async execute({ id }: DeleteDeviceCommand): Promise<void> {
        const user = await this.securityDevicesRepository.ShowDevice(id);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Device not found'
            });
        }

        return await this.securityDevicesRepository.DeleteDevice(id);
    }
}
