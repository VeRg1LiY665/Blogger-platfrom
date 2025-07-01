import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../infrastructure/users.repository';

export class DeleteUserCommand {
    constructor(public id: string) {}
}

/**
 * Удаление администратором пользователя через админскую панель
 */
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand, void> {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType, //Зачем?
        private usersRepository: UsersRepository
    ) {}

    async execute({ id }: DeleteUserCommand): Promise<void> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        return await this.usersRepository.delete(id);
    }
}
