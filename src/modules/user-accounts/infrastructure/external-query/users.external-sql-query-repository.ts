import { Inject, NotFoundException } from '@nestjs/common';
import { UserExternalDto } from './external-dto/users.external-dto';
import { Pool } from 'pg';

export class UsersExtSqlQRepository {
    constructor(@Inject('PG_POOL') private pool: Pool) {}

    async findById(userId: string): Promise<UserExternalDto> {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length < 1) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        const items = result.rows.map((x) => UserExternalDto.mapSqlToView(x));
        return items[0];
    }
}
