import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../../domain/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { randomUUID } from 'node:crypto';
import { UsersFactory } from '../../factories/users.factory';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { EmailService } from '../../../../notifications/email.service';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class RegisterUserCommand {
    constructor(public dto: CreateUserDto) {}
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand, void> {
    constructor(
        private usersRepository: UsersRepository,
        private usersSqlRepository: UsersSqlRepository,
        private usersFactory: UsersFactory,
        private emailService: EmailService
    ) {}

    async execute({ dto }: RegisterUserCommand): Promise<void> {
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

        const user = await this.usersFactory.create(dto);
        //const user = await this.usersRepository.findOrNotFoundFail(userId);
        const confirmCode = randomUUID();
        user.setConfirmationCode(confirmCode);
        const userId = await this.usersSqlRepository.save(user);

        await this.usersSqlRepository.findOrNotFoundFail(userId.toString());

        this.emailService.sendConfirmationEmail(user.email, confirmCode).catch(console.error);

        return;
    }
}
