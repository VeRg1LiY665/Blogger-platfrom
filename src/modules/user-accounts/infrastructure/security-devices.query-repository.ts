import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SecurityDevice, SecurityDeviceModelType } from '../domain/device.entity';
import { DevicesViewDto } from '../api/view-dto/devices-view.dto';

@Injectable()
export class SecurityDevicesQueryRepository {
    constructor(
        @InjectModel(SecurityDevice.name)
        private securityDeviceModel: SecurityDeviceModelType
    ) {}
    async showAllDevices(userId: string): Promise<DevicesViewDto[]> {
        const AllDevices = await this.securityDeviceModel.find({ userId });

        return AllDevices.map((el) => DevicesViewDto.mapToView(el));
    }
}
