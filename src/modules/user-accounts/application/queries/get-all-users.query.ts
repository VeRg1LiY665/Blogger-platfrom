import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params';
import { UsersSqlQueryRepository } from '../../infrastructure/users.sql.query-repository';

export class GetAllUsersQuery {
    constructor(public query: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
    constructor(private usersSqlQRepository: UsersSqlQueryRepository) {}

    async execute(query: GetAllUsersQuery) {
        return await this.usersSqlQRepository.findAll(query.query);
    }
}
