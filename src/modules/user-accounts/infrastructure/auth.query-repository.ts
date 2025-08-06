import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../api/view-dto/users-view.dto';
import { UsersSqlRepository } from './users-sql.repository';

@Injectable()
export class AuthQueryRepository {
    constructor(private usersSqlRepository: UsersSqlRepository) {}

    async me(userId: string): Promise<MeViewDto> {
        const user = await this.usersSqlRepository.findOrNotFoundFail(userId);

        return MeViewDto.mapSqlToView(user);
    }
}
