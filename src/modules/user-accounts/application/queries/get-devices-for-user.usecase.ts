import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesSqlQueryRepository } from '../../infrastructure/security-devices.sql.query-repository';

export class GetAllDevicesQuery {
    constructor(public userId: string) {}
}

@QueryHandler(GetAllDevicesQuery)
export class GetAllDevicesQueryHandler implements IQueryHandler<GetAllDevicesQuery> {
    constructor(private securityDevicesSqlQueryRepository: SecurityDevicesSqlQueryRepository) {}

    async execute(userId: GetAllDevicesQuery) {
        return await this.securityDevicesSqlQueryRepository.showAllDevices(userId.userId);
    }
}
