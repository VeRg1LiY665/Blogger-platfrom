import { Injectable } from '@nestjs/common';
import { DevicesViewDto } from '../api/view-dto/devices-view.dto';
import { DataSource, Repository } from 'typeorm';
import { SecurityDevice } from '../domain/device.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class SecurityDevicesSqlQueryRepository {
    private devices: Repository<SecurityDevice>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.devices = this.dataSource.getRepository(SecurityDevice);
    }
    async showAllDevices(userId: string): Promise<DevicesViewDto[]> {
        const AllDevices = await this.devices
            .createQueryBuilder('d')
            .select(['d.id as "id"', 'd.ip as "ip"', 'd.lastActiveDate as "lastActiveDate"', 'd.title as "title"'])
            .where({ userId: userId })
            .getRawMany();

        return AllDevices.map((el) => DevicesViewDto.mapSqlToView(el));
    }
}
