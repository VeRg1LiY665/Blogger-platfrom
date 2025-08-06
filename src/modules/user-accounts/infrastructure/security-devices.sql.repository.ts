import { Inject, Injectable, Scope } from '@nestjs/common';
import { SecurityDevice } from '../domain/device.entity';
import { Pool } from 'pg';

@Injectable({ scope: Scope.REQUEST })
export class SecurityDevicesSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: SecurityDevice | null = null;

    private dataMapper(deviceData: any): SecurityDevice {
        const device = new SecurityDevice();
        device.id = deviceData.id;
        device.userId = deviceData.userId;
        device.ip = deviceData.ip;
        device.title = deviceData.title;
        device.iat = +deviceData.iat;

        this.entity = JSON.parse(JSON.stringify(device));

        return device;
    }

    async ShowDevice(deviceId: string): Promise<SecurityDevice | null> {
        const device = await this.pool.query(`SELECT * FROM devices WHERE id = ${deviceId}`);
        if (!device) {
            return null;
        }
        return device.rows.length > 0 ? this.dataMapper(device.rows[0]) : null;
    }

    async FindByTitle(title: string, userId: number): Promise<void> {
        const device = await this.pool.query(
            `SELECT * FROM devices WHERE title LIKE '${title}' AND "userId" = ${userId}`
        );
        if (device.rows.length > 0) {
            this.dataMapper(device.rows[0]);
        }
    }

    async save(device: SecurityDevice): Promise<number> {
        if (JSON.stringify(this.entity) !== JSON.stringify(device) && this.entity !== null) {
            await this.pool.query(`UPDATE devices SET "userId" = $1, ip = $2, title = $3, iat = $4 WHERE id = $5`, [
                device.userId,
                device.ip,
                device.title,
                device.iat,
                this.entity.id
            ]);
            return this.entity.id;
        }

        const res = await this.pool.query(
            `INSERT INTO devices ("userId", ip, title, iat) VALUES ($1, $2, $3, $4) RETURNING id`,
            [device.userId, device.ip, device.title, device.iat]
        );
        return res.rows[0].id;
    }

    async DeleteDevice(deviceId: string): Promise<void> {
        await this.pool.query(`DELETE FROM devices WHERE id = ${deviceId}`);
        return;
    }

    async DeleteAllDevices(dto: { deviceId: string; userId: string }): Promise<void> {
        const filter: any = {};
        filter.userId = dto.userId;
        filter._id = { $nin: [dto.deviceId] };
        await this.pool.query(`DELETE FROM devices WHERE id = ${dto.userId} AND "deviceId" NOT IN ${dto.deviceId}`);

        return;
    }
}
