import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/security-devices.repository';
import { DeleteAllDevicesDto } from '../../../dto/delete-all-devices.dto';

export class DeleteAllDevicesCommand {
    constructor(public dto: DeleteAllDevicesDto) {}
}

/**
 * Удаление авторизованным пользователем всех девайсов кроме текущего
 */
@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommand, void> {
    constructor(private securityDevicesRepository: SecurityDevicesRepository) {}

    async execute({ dto }: DeleteAllDevicesCommand): Promise<void> {
        return await this.securityDevicesRepository.DeleteAllDevices(dto);
    }
}
