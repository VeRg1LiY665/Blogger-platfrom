import { SecurityDevice } from '../../domain/device.entity';

export class DevicesViewDto {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;

    static mapSqlToView(rows: SecurityDevice): DevicesViewDto {
        const dto = new DevicesViewDto();
        dto.deviceId = rows.id.toString();
        dto.ip = rows.ip;
        dto.lastActiveDate = new Date(rows.iat * 1000).toISOString();
        dto.title = rows.title;

        return dto;
    }
}
