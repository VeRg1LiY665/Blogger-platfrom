import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQRepository } from '../../infrastructure/users.query-repository';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params';

export class GetAllUsersQuery {
    constructor(public query: GetUsersQueryParams) {}
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler implements IQueryHandler<GetAllUsersQuery> {
    constructor(private usersQRepository: UsersQRepository) {}

    async execute(query: GetAllUsersQuery) {
        return await this.usersQRepository.findAll(query.query);
    }
}
