import { Controller, Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { RefreshGuard } from '../guards/bearer/refresh.guard';
import { ExtractUserForRefreshFromRequest } from '../guards/decorators/param/extract-user-for-refresh-from-request.decorator';
import { RefreshContextDto } from '../guards/dto/refresh-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DevicesViewDto } from './view-dto/devices-view.dto';
import { GetAllDevicesQuery } from '../application/queries/get-devices-for-user.usecase';
import { DeleteDeviceCommand } from '../application/usecases/security-devices/delete-device.usecase';
import { DeleteAllDevicesCommand } from '../application/usecases/security-devices/delete-all-except-current-device.usecase';

@Controller('security/devices')
export class SecurityDevicesController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshGuard)
    getDevices(@ExtractUserForRefreshFromRequest() user: RefreshContextDto): Promise<DevicesViewDto[]> {
        return this.queryBus.execute<GetAllDevicesQuery>(new GetAllDevicesQuery(user.id));
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(RefreshGuard)
    deleteDevice(
        @ExtractUserForRefreshFromRequest() user: RefreshContextDto,
        @Param('id') deviceId: string
    ): Promise<void> {
        const dto = {
            deviceId: deviceId,
            RdeviceId: user.deviceId
        };
        return this.commandBus.execute<DeleteDeviceCommand>(new DeleteDeviceCommand(dto));
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(RefreshGuard)
    deleteAllDevices(@ExtractUserForRefreshFromRequest() user: RefreshContextDto): Promise<void> {
        const dto = {
            deviceId: user.deviceId,
            userId: user.id
        };
        return this.commandBus.execute<DeleteAllDevicesCommand>(new DeleteAllDevicesCommand(dto));
    }
}
