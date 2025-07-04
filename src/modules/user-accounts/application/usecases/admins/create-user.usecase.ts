import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../../../domain/user.entity';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../factories/users.factory';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Types } from 'mongoose';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { Inject } from '@nestjs/common';

export class CreateUserCommand {
    constructor(public dto: CreateUserDto) {}
}

/**
 * Создание администратором пользователя через админскую панель
 */
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, Types.ObjectId> {
    constructor(
        private usersRepository: UsersRepository,
        private usersFactory: UsersFactory
    ) {}

    async execute({ dto }: CreateUserCommand): Promise<Types.ObjectId> {
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

        const user: UserDocument = await this.usersFactory.create(dto);
        //TODO make email confirmed by default for admin creation?
        await this.usersRepository.save(user);

        return user._id;
    }
}
