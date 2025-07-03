import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User, UserModelType } from '../../../domain/user.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { randomUUID } from 'node:crypto';
import { EmailService } from '../../../../notifications/email.service';
import { InputNewPasswordDto } from '../../../api/input-dto/input-new-password-dto';
import { CryptoService } from '../../crypto.service';

export class NewPasswordUserCommand {
    constructor(public dto: InputNewPasswordDto) {}
}

/**
 * Установка нового пароля пользователем через страницу сайта
 */
@CommandHandler(NewPasswordUserCommand)
export class NewPasswordUserUseCase implements ICommandHandler<NewPasswordUserCommand, void> {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType, //Зачем?
        private usersRepository: UsersRepository,
        private cryptoService: CryptoService
    ) {}

    async execute({ dto }: NewPasswordUserCommand): Promise<void> {
        const user = await this.usersRepository.findByUUID(dto.code);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User with passed confirmation code does not exist'
            });
        }

        if (Date.now() > user.emailConfirmation.expirationDate.getTime()) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'Recovery code has been expired'
            });
        }

        const passwordHash = await this.cryptoService.createPasswordHash(dto.newPassword);
        const passwordRecovery = { recoveryCode: '', expirationDate: new Date() };
        user.update({ passwordHash: passwordHash, passwordRecovery });

        await this.usersRepository.save(user);

        return;
    }
}
