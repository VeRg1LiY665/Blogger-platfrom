import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';

export class UsersSqlQueryRepository {
    constructor(@Inject('PG_POOL') private pool: Pool) {}

    async findAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        const filter: any = [];
        if (query.searchLoginTerm !== null) {
            filter.push({ login: '%' + query.searchLoginTerm + '%' });
        }
        if (query.searchEmailTerm !== null) {
            filter.push({ email: '%' + query.searchEmailTerm + '%' });
        }
        console.log(filter);
        let whereClause = '';
        let i = 0;
        if (filter.length > 0) {
            const conditions = filter
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    i++;
                    return `${condition.keys()} = ${i}`; // Adjust based on your actual condition structure
                })
                .join(' OR ');
            whereClause = `WHERE ${conditions}`;
        }
        console.log('WHERE_CLAUSE= ' + whereClause);
        const users = await this.pool.query('SELECT * FROM users $(whereClause) ORDER BY $1 $2 OFFSET $3 LIMIT $4', [
            ...filter.map((cond) => cond.value),
            query.sortBy,
            query.sortDirection,
            query.calculateSkip(),
            query.pageSize
        ]);

        const totalCount = users.rows.length;

        const items = users.rows.map((x) => UserViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<UserViewDto> {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const items = result.rows.map((x) => UserViewDto.mapSqlToView(x));
        return items[0];
    }
}
