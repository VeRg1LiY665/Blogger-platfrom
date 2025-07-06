import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { RefreshGuard } from '../guards/bearer/refresh.guard';
import { ExtractUserForRefreshFromRequest } from '../guards/decorators/param/extract-user-for-refresh-from-request.decorator';
import { RefreshContextDto } from '../guards/dto/refresh-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
//import { SecurityDevicesQueryRepository } from '../infrastructure/security-devices.query-repository';
import { DevicesViewDto } from './view-dto/devices-view.dto';
import { GetAllDevicesQuery } from '../application/queries/get-devices-for-user.usecase';

@Controller('security/devices')
export class SecurityDevicesController {
    constructor(
        //private securityDevicesQueryRepository: SecurityDevicesQueryRepository,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshGuard)
    getDevices(@ExtractUserForRefreshFromRequest() user: RefreshContextDto): Promise<DevicesViewDto[]> {
        return this.queryBus.execute<GetAllDevicesQuery>(new GetAllDevicesQuery(user.id));
    }
}
