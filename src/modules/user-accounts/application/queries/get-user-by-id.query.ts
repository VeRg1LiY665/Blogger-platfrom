import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQRepository } from '../../infrastructure/users.query-repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class GetUserByIdQuery {
    constructor(public userId: string) {}
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
    constructor(private usersQRepository: UsersQRepository) {}

    async execute(query: GetUserByIdQuery) {
        const user = await this.usersQRepository.findById(query.userId);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }
        return user;
    }
}
