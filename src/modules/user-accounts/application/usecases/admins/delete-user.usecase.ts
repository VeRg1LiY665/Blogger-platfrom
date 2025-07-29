import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class DeleteUserCommand {
    constructor(public id: string) {}
}

/**
 * Удаление администратором пользователя через админскую панель
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand, void> {
    constructor(
        private usersRepository: UsersRepository,
        private usersSqlRepository: UsersSqlRepository
    ) {}

    async execute({ id }: DeleteUserCommand): Promise<void> {
        const user = await this.usersSqlRepository.findById(id);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        return await this.usersSqlRepository.delete(id);
    }
}
