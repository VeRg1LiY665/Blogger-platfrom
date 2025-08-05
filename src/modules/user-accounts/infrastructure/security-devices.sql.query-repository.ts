import { Inject, Injectable } from '@nestjs/common';
import { DevicesViewDto } from '../api/view-dto/devices-view.dto';
import { Pool } from 'pg';

@Injectable()
export class SecurityDevicesSqlQueryRepository {
    constructor(@Inject('PG_POOL') private pool: Pool) {}
    async showAllDevices(userId: string): Promise<DevicesViewDto[]> {
        const AllDevices = await this.pool.query(`SELECT * FROM devices WHERE "userId" = ${userId}`);

        return AllDevices.rows.map((el) => DevicesViewDto.mapSqlToView(el));
    }
}
