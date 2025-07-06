import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesQueryRepository } from '../../infrastructure/security-devices.query-repository';

export class GetAllDevicesQuery {
    constructor(public userId: string) {}
}

@QueryHandler(GetAllDevicesQuery)
export class GetAllDevicesQueryHandler implements IQueryHandler<GetAllDevicesQuery> {
    constructor(private securityDevicesQueryRepository: SecurityDevicesQueryRepository) {}

    async execute(userId: GetAllDevicesQuery) {
        return await this.securityDevicesQueryRepository.showAllDevices(userId.userId);
    }
}
