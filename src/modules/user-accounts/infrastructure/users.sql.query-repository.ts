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
                    return `${condition} ILIKE $${i + 1}`; // Adjust based on your actual condition structure
                })
                .join(' OR ');
            whereClause = `WHERE ${conditions}`;
        }
        const queryText = `SELECT * FROM users ${whereClause} ORDER BY $${Object.keys(filter).length + 1} $${Object.keys(filter).length + 2} OFFSET $${Object.keys(filter).length + 3} LIMIT $${Object.keys(filter).length + 4}`;

        const users = await this.pool.query(queryText, [
            ...Object.values(filter),
            query.sortBy,
            query.sortDirection.toUpperCase(),
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
