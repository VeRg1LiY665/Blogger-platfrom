import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Types } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class UsersSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    async findById(id: string): Promise<User | null> {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);

        return result.rows[0];
    }

    async findByLoginOrEmail(searchData: string): Promise<UserDocument | null> {
        const filter = {};

        switch (true) {
            case searchData.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null:
                filter['email'] = searchData;
                break;
            default:
                filter['login'] = searchData;
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `${condition} LIKE $${i + 1}`;
                })
                .toString();
            whereClause = `WHERE ${conditions}`;
        }

        const user = await this.pool.query(`SELECT * FROM users ${whereClause}`, [...Object.values(filter)]);

        if (user.rows.length < 1) {
            return null;
        }
        return user.rows[0];
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

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `${condition} LIKE $${i + 1}`;
                })
                .join(' OR ');
            whereClause = `WHERE ${conditions}`;
        }

        const user = await this.pool.query(`SELECT "userId" FROM users ${whereClause}`, [...Object.values(filter)]);

        const result = await this.pool.query(`SELECT * FROM users WHERE id = ${user.rows[0].id}`);

        return result.rows[0].length > 0 ? result.rows[0] : null;
    }

    async save(user: User): Promise<number> {
        const res = await this.pool.query(
            'INSERT INTO users (login, "passwordHash", email, "createdAt") VALUES ($1, $2, $3, $4) RETURNING id',
            [user.login, user.passwordHash, user.email, user.createdAt.toLocaleString('en-US')]
        );
        const id = res.rows[0].id;

        return id;
    }

    async delete(userId: string): Promise<void> {
        await this.pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return;
    }
}
