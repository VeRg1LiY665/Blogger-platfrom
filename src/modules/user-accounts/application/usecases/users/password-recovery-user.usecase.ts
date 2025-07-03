import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserModelType } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'node:crypto';
import { EmailService } from '../../../../notifications/email.service';
import { InputPasswordRecoveryDto } from '../../../api/input-dto/input-password-recovery';

export class PasswordRecoveryUserCommand {
    constructor(public dto: InputPasswordRecoveryDto) {}
}

/**
 * Восстановление пароля пользователем через страницу сайта
 */
@CommandHandler(PasswordRecoveryUserCommand)
export class PasswordRecoveryUserUseCase implements ICommandHandler<PasswordRecoveryUserCommand, void> {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType, //Зачем?
        private usersRepository: UsersRepository,
        private emailService: EmailService
    ) {}

    async execute({ dto }: PasswordRecoveryUserCommand): Promise<void> {
        const user = await this.usersRepository.findByLoginOrEmail(dto.email);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User with passed confirmation code does not exist'
            });
        }

        const confirmCode = randomUUID() + '-rq';
        const expirationDate = new Date(Date.now() + 86400000); //текущая + сутки в мс

        user.setRecoveryCode(confirmCode, expirationDate);
        await this.usersRepository.save(user);

        this.emailService.sendRecoveryEmail(user.email, confirmCode).catch(console.error);
        return;
    }
}
