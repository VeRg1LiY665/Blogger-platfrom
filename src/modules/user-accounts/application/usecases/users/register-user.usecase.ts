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

export class RegisterUserCommand {
    constructor(public dto: CreateUserDto) {}
}

/**
 * Удаление администратором пользователя через админскую панель
 */
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand, void> {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType, //Зачем?
        private usersRepository: UsersRepository,
        private usersFactory: UsersFactory,
        private emailService: EmailService
    ) {}

    async execute({ dto }: RegisterUserCommand): Promise<void> {
        if ((await this.usersRepository.findByLoginOrEmail(dto.login)) !== null) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User already exists',
                extensions: [new Extension('User already exists', 'login')]
            });
        }

        if ((await this.usersRepository.findByLoginOrEmail(dto.email)) !== null) {
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
        await this.usersRepository.save(user);

        await this.usersRepository.findOrNotFoundFail(user._id);

        this.emailService.sendConfirmationEmail(user.email, confirmCode).catch(console.error);

        return;
    }
}
