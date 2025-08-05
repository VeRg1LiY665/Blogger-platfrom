import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { InputConfirmEmailDto } from '../../../api/input-dto/input-registration-confirmation';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class ConfirmRegistrationUserCommand {
    constructor(public dto: InputConfirmEmailDto) {}
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(ConfirmRegistrationUserCommand)
export class ConfirmRegistrationUserUseCase implements ICommandHandler<ConfirmRegistrationUserCommand, void> {
    constructor(
        private usersRepository: UsersRepository,
        private usersSqlRepository: UsersSqlRepository
    ) {}

    async execute({ dto }: ConfirmRegistrationUserCommand): Promise<void> {
        const user = await this.usersSqlRepository.findByUUID(dto.code);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User with passed confirmation code does not exist',
                extensions: [new Extension('User with passed confirmation code does not exists', 'code')]
            });
        }

        if (user.emailConfirmation.isConfirmed == true) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User email has been already confirmed',
                extensions: [new Extension('User email has been already confirmed', 'code')]
            });
        }

        if (Date.now() - user.emailConfirmation.expirationDate.getTime() > 86400000) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'Email confirmation link has expired',
                extensions: [new Extension('Email confirmation link has expired', 'email')]
            });
        }

        const domainDto = { emailConfirmation: user.emailConfirmation };
        domainDto.emailConfirmation.isConfirmed = true;
        user.update(domainDto);
        await this.usersSqlRepository.save(user);

        return;
    }
}
