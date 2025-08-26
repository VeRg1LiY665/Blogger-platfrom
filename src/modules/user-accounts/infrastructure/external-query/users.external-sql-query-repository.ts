import { Injectable, NotFoundException } from '@nestjs/common';
import { UserExternalDto } from './external-dto/users.external-dto';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersExtSqlQRepository {
    private users: Repository<User>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.users = this.dataSource.getRepository(User);
    }
    async findById(userId: string): Promise<UserExternalDto> {
        const user = await this.users
            .createQueryBuilder('u')
            .select(['u.id as "id"', 'u.login as "login"', 'u.email as "email"', 'u.createdAt as "createdAt"'])
            .where('u.id = :id', { id: userId })
            .getRawOne();
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        return UserExternalDto.mapSqlToView(user as User);
    }
}
