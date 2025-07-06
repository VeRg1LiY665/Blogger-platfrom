import { Injectable } from '@nestjs/common';
import { SecurityDevice, SecurityDeviceDocument, SecurityDeviceModelType } from '../domain/device.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SecurityDevicesRepository {
    constructor(
        @InjectModel(SecurityDevice.name)
        private securityDeviceModel: SecurityDeviceModelType
    ) {}

    async ShowDevice(deviceId: string): Promise<SecurityDeviceDocument | null> {
        const device = await this.securityDeviceModel.findOne({ _id: deviceId });
        if (!device) {
            return null;
        }
        return device;
    }

    async save(device: SecurityDeviceDocument): Promise<void> {
        await device.save();
    }

    async DeleteDevice(deviceId: string): Promise<void> {
        await this.securityDeviceModel.deleteOne({ _id: deviceId });
        return;
    }

    async DeleteAllDevices(dto: { deviceId: string; userId: string }): Promise<void> {
        let filter: any = {};
        filter.userId = dto.userId;
        filter._id = { $nin: [dto.deviceId] };
        await this.securityDeviceModel.deleteMany({ $and: [filter] });

        return;
    }
}
