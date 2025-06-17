import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { UsersRepository } from '../infrastructure/users.repository';
import { UsersQRepository } from '../infrastructure/users.query-repository';
import { DomainException, Extension } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { CryptoService } from './crypto.service';
import { randomUUID } from 'node:crypto';
import { EmailService } from '../../notifications/email.service';
import { InputConfirmEmailDto } from '../api/input-dto/input-registration-confirmation';
import { InputEmailResendingDto } from '../api/input-dto/input-email-resending';
import { InputPasswordRecoveryDto } from '../api/input-dto/input-password-recovery';
import { InputNewPasswordDto } from '../api/input-dto/input-new-password-dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType,
        private emailService: EmailService,
        private cryptoService: CryptoService,
        private usersRepository: UsersRepository,
        private usersQRepository: UsersQRepository
    ) {}

    async createUser(dto: CreateUserDto) {
        const userWithTheSameLogin = await this.usersRepository.findByLoginOrEmail(dto.login);
        if (!!userWithTheSameLogin) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'User with the same login already exists'
            });
        }

        const passwordHash = await this.cryptoService.createPasswordHash(dto.password);

        const user = this.userModel.createInstance({
            email: dto.email,
            login: dto.login,
            passwordHash: passwordHash
        });

        await this.usersRepository.save(user);

        return user._id;
    }

    async registerUser(dto: CreateUserDto) {
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

        const createdUserId = await this.createUser(dto);

        const confirmCode = randomUUID();

        const user = await this.usersRepository.findOrNotFoundFail(createdUserId);

        user.setConfirmationCode(confirmCode);
        await this.usersRepository.save(user);

        this.emailService.sendConfirmationEmail(user.email, confirmCode).catch(console.error);

        return;
    }

    async confirmRegistration(dto: InputConfirmEmailDto) {
        const user = await this.usersRepository.findByUUID(dto.code);
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
        await this.usersRepository.save(user);

        return;
    }

    async emailResending(dto: InputEmailResendingDto) {
        const user = await this.usersRepository.findByLoginOrEmail(dto.email);
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
        await this.usersRepository.save(user);

        this.emailService.sendConfirmationEmail(user.email, confirmCode).catch(console.error);
        return;
    }

    async passwordRecovery(dto: InputPasswordRecoveryDto) {
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

    async newPassword(dto: InputNewPasswordDto) {
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

    async removeUser(id: string): Promise<void> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        return await this.usersRepository.delete(id);
    }

    async getAllUsers(query: GetUsersQueryParams) {
        return await this.usersQRepository.findAll(query);
    }

    async findById(id: string) {
        const user = await this.usersQRepository.findById(id);
        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }
        return user;
    }
}
