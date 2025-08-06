import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAllDevicesDto } from '../../../dto/delete-all-devices.dto';
import { SecurityDevicesSqlRepository } from '../../../infrastructure/security-devices.sql.repository';

export class DeleteAllDevicesCommand {
    constructor(public dto: DeleteAllDevicesDto) {}
}

/**
 * Удаление авторизованным пользователем всех девайсов кроме текущего
 */
@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase implements ICommandHandler<DeleteAllDevicesCommand, void> {
    constructor(private devicesSqlRepo: SecurityDevicesSqlRepository) {}

    async execute({ dto }: DeleteAllDevicesCommand): Promise<void> {
        return await this.devicesSqlRepo.DeleteAllDevices(dto);
    }
}
