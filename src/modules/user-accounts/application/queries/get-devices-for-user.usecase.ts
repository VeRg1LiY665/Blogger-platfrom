import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SecurityDevicesSqlQueryRepository } from '../../infrastructure/security-devices.sql.query-repository';
import { UserAccountsConfig } from '../../config/user-accounts.config';
import { convertToSeconds } from '../utils/parse-time-from-string';
import { DevicesViewDto } from '../../api/view-dto/devices-view.dto';

export class GetAllDevicesQuery {
    constructor(public userId: string) {}
}

@QueryHandler(GetAllDevicesQuery)
export class GetAllDevicesQueryHandler implements IQueryHandler<GetAllDevicesQuery> {
    constructor(
        private securityDevicesSqlQueryRepository: SecurityDevicesSqlQueryRepository,
        private userAccountsConfig: UserAccountsConfig
    ) {}

    async execute(userId: GetAllDevicesQuery) {
        const devices: DevicesViewDto[] = await this.securityDevicesSqlQueryRepository.showAllDevices(userId.userId);

        //TODO is it even necessary to show only active sessions?
        /*const expTime: number = convertToSeconds(this.userAccountsConfig.accessTokenExpireIn);
        const activeDevices = devices.map((x: DevicesViewDto) => {
            if (Math.floor(Date.now()) - Math.floor(new Date(x.lastActiveDate).getTime() / 1000) <= expTime * 1000) {
                return x;
            }
        });*/

        return devices;
    }
}
