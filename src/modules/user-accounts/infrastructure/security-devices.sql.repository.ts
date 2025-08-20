import { Injectable } from '@nestjs/common';
import { SecurityDevice } from '../domain/device.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SecurityDevicesSqlRepository {
    private devices: Repository<SecurityDevice>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.devices = this.dataSource.getRepository(SecurityDevice);
    }

    async ShowDevice(deviceId: string): Promise<SecurityDevice | null> {
        const device = await this.devices.findOne({
            where: { id: +deviceId }
        });

        return device ? device : null;
    }

    async save(device: SecurityDevice): Promise<number> {
        const res = await this.devices.save(device);
        return res.id;
    }

    async DeleteDevice(deviceId: string): Promise<void> {
        await this.devices.delete({ id: +deviceId });
        return;
    }

    async DeleteAllDevices(dto: { deviceId: string; userId: string }): Promise<void> {
        await this.devices.delete({
            userId: dto.userId,
            id: Not(+dto.deviceId)
        });

        return;
    }
}
