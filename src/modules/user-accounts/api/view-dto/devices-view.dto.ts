import { SecurityDeviceDocument } from '../../domain/device.entity';

export class DevicesViewDto {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;

    static mapToView(device: SecurityDeviceDocument): DevicesViewDto {
        const dto = new this();
        dto.ip = device.ip;
        dto.title = device.title;
        dto.lastActiveDate = new Date(device.iat * 1000).toISOString();
        dto.deviceId = device._id.toString();

        return dto;
    }
}
