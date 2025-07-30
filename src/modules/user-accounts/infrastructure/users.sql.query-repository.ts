import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/users-view.dto';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';

export class UsersSqlQueryRepository {
    constructor(@Inject('PG_POOL') private pool: Pool) {}

    async findAll(query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
        const filter = {};
        if (query.searchLoginTerm !== null) {
            filter['login'] = '%' + query.searchLoginTerm + '%';
        }
        if (query.searchEmailTerm !== null) {
            filter['email'] = '%' + query.searchEmailTerm + '%';
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `${condition} ILIKE $${i + 1}`;
                })
                .join(' OR ');
            whereClause = `WHERE ${conditions}`;
        }
        const queryText =
            `SELECT * FROM users ${whereClause} ORDER BY $${Object.keys(filter).length + 1}` +
            ` ${query.sortDirection} ` + //Because pool.query inserts substring with "" by default
            `OFFSET ${query.calculateSkip()} LIMIT ${query.pageSize}`;

        const users = await this.pool.query(queryText, [...Object.values(filter), query.sortBy]);

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
