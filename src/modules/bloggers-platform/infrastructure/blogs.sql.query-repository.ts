import { Blog } from '../domain/blog.entity';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';

export class BlogsSqlQueryRepository {
    constructor(@Inject('PG_POOL') private pool: Pool) {}

    async findAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
        const filter = {};
        if (query.searchNameTerm) {
            filter['name'] = '%' + query.searchNameTerm + '%';
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
            `SELECT * FROM blogs ${whereClause} ORDER BY "${query.sortBy}"` +
            ` ${query.sortDirection} ` + //Because pool.query inserts substring with "" by default
            `OFFSET ${query.calculateSkip()} LIMIT ${query.pageSize}`;

        const blogs = await this.pool.query(queryText, [...Object.values(filter)]);

        const totalCount: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM blogs ${whereClause}`, [...Object.values(filter)])
        ).rows[0].count;

        const items = blogs.rows.map((x: Blog) => BlogViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<BlogViewDto> {
        const result = await this.pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
        const items = result.rows.map((x: Blog) => BlogViewDto.mapSqlToView(x));
        return items[0];
    }
}
