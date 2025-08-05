import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InputEmailResendingDto } from '../../../api/input-dto/input-email-resending';
import { randomUUID } from 'node:crypto';
import { EmailService } from '../../../../notifications/email.service';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class EmailResendingUserCommand {
    constructor(public dto: InputEmailResendingDto) {}
}

/**
 * Регистрация пользователя через email на странице регистрации сайта
 */
@CommandHandler(EmailResendingUserCommand)
export class EmailResendingUserUseCase implements ICommandHandler<EmailResendingUserCommand, void> {
    constructor(
        private usersSqlRepository: UsersSqlRepository,
        private emailService: EmailService
    ) {}

    async execute({ dto }: EmailResendingUserCommand): Promise<void> {
        const user = await this.usersSqlRepository.findByLoginOrEmail(dto.email);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User email does not exist',
                extensions: [new Extension('User email does not exist', 'email')]
            });
        }

        if (user.emailConfirmation.isConfirmed == true) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User email has been already confirmed',
                extensions: [new Extension('User email has been already confirmed', 'email')]
            });
        }
        const confirmCode = randomUUID();
        user.setConfirmationCode(confirmCode);
        await this.usersSqlRepository.save(user);

        this.emailService.sendConfirmationEmail(user.email, confirmCode).catch(console.error);
        return;
    }
}
