import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InputNewPasswordDto } from '../../../api/input-dto/input-new-password-dto';
import { CryptoService } from '../../crypto.service';
import { UsersSqlRepository } from '../../../infrastructure/users-sql.repository';

export class NewPasswordUserCommand {
    constructor(public dto: InputNewPasswordDto) {}
}

/**
 * Установка нового пароля пользователем через страницу сайта
 */
@CommandHandler(NewPasswordUserCommand)
export class NewPasswordUserUseCase implements ICommandHandler<NewPasswordUserCommand, void> {
    constructor(
        private usersSqlRepository: UsersSqlRepository,
        private cryptoService: CryptoService
    ) {}

    async execute({ dto }: NewPasswordUserCommand): Promise<void> {
        const user = await this.usersSqlRepository.findByUUID(dto.code);
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

        await this.usersSqlRepository.save(user);

        return;
    }
}
