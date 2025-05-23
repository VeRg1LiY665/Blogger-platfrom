import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { UsersRepository } from '../infrastructure/users.repository';
import { UsersQRepository } from '../infrastructure/users.query-repository';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: UserModelType,
        private usersRepository: UsersRepository,
        private usersQRepository: UsersQRepository
    ) {}

    async createUser(dto: CreateUserDto): Promise<UserViewDto> {
        const newUser = this.userModel.createInstance(dto);

        await this.usersRepository.save(newUser);

        return UserViewDto.mapToView(newUser);
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
