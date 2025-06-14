import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { UsersRepository } from '../infrastructure/users.repository';
import { UsersQRepository } from '../infrastructure/users.query-repository';
import { Types } from 'mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { CryptoService } from './crypto.service';

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
        const userWithTheSameLogin = await this.usersRepository.findByLogin(dto.login);
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
        const createdUserId = await this.createUser(dto);

        const confirmCode = 'uuid';

        const user = await this.usersRepository.findOrNotFoundFail(new Types.ObjectId(createdUserId));

        user.setConfirmationCode(confirmCode);
        await this.usersRepository.save(user);

        this.emailService.sendConfirmationEmail(user.email, confirmCode).catch(console.error);
    }
    async removeUser(id: string): Promise<void> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return await this.usersRepository.delete(id);
    }

    async getAllUsers(query: GetUsersQueryParams) {
        return await this.usersQRepository.findAll(query);
    }

    async findById(id: string) {
        const user = await this.usersQRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
