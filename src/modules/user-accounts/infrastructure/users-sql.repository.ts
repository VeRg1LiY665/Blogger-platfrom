import { User } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersSqlRepository {
    private users: Repository<User>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.users = this.dataSource.getRepository(User);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.users.findOne({
            where: { id: +id },
            relations: ['emailConfirmation', 'passwordRecovery']
        });

        return user;
    }

    async findByLoginOrEmail(searchData: string): Promise<User | null> {
        const filter = {};

        switch (true) {
            case searchData.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null:
                filter['email'] = searchData;
                break;
            default:
                filter['login'] = searchData;
        }

        const user = await this.users.findOne({
            where: filter,
            relations: ['emailConfirmation', 'passwordRecovery']
        });

        return user;
    }

    async findOrNotFoundFail(id: string): Promise<User> {
        const user = await this.findById(id);

        if (!user) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        return user;
    }

    async findByUUID(uuid: string): Promise<User | null> {
        const filter = {};

        switch (true) {
            case uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null:
                filter['confirmationCode'] = uuid; //emailConfirmation
                break;
            case uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-rq$/) !== null:
                filter['recoveryCode'] = uuid; //passwordRecovery
                break;
        }

        let result: User | null = null;
        switch (true) {
            case Object.keys(filter)[0] == 'confirmationCode':
                result = await this.users.findOne({
                    where: {
                        emailConfirmation: filter
                    },
                    relations: ['emailConfirmation', 'passwordRecovery']
                });
                break;
            case Object.keys(filter)[0] == 'recoveryCode':
                result = await this.users.findOne({
                    where: {
                        passwordRecovery: filter
                    },
                    relations: ['emailConfirmation', 'passwordRecovery']
                });
                break;
        }

        return result;
    }

    async save(user: User): Promise<number> {
        const res = await this.users.save(user);

        return res.id;
    }

    async delete(userId: string): Promise<void> {
        await this.users.delete({ id: +userId });
        return;
    }
}
