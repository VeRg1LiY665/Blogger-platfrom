import { User } from '../../../domain/user.entity';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../factories/users.factory';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class CreateUserCommand {
    constructor(public dto: CreateUserDto) {}
}

/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, number> {
    constructor(
        private usersSqlRepository: UsersSqlRepository,
        private usersFactory: UsersFactory
    ) {}

    async execute({ dto }: CreateUserCommand): Promise<number> {
        if ((await this.usersSqlRepository.findByLoginOrEmail(dto.login)) !== null) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User already exists',
                extensions: [new Extension('User already exists', 'login')]
            });
        }

        if ((await this.usersSqlRepository.findByLoginOrEmail(dto.email)) !== null) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User already exists',
                extensions: [new Extension('User already exists', 'email')]
            });
        }

        const user: User = await this.usersFactory.create(dto);
        const domainDto = { emailConfirmation: user.emailConfirmation };
        domainDto.emailConfirmation.isConfirmed = true;
        user.update(domainDto);

        const id = await this.usersSqlRepository.save(user);

        return id;
    }
}
