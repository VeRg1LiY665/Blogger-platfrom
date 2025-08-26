import { Blog } from '../domain/blog.entity';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export class BlogsSqlQueryRepository {
    private blogs: Repository<Blog>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.blogs = this.dataSource.getRepository(Blog);
    }
    async findAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
        const filter = {};
        if (query.searchNameTerm) {
            filter['name'] = '%' + query.searchNameTerm + '%';
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    return `b.${condition} ILIKE :${condition}`;
                })
                .toString();
            whereClause = conditions;
        }
        const queryBuilder = this.blogs
            .createQueryBuilder('b')
            .select('b.*')
            .where(whereClause, { ...filter })
            .orderBy(`b."${query.sortBy}"`, query.sortDirection);

        const blogs = await queryBuilder.take(query.pageSize).skip(query.calculateSkip()).getRawMany();

        const totalCount: number = +(await queryBuilder.getCount());

        const items = blogs.map((x: Blog) => BlogViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<BlogViewDto | null> {
        const blog = await this.blogs.createQueryBuilder('b').select('b.*').where('b.id = :id', { id: id }).getRawOne();

        return blog ? BlogViewDto.mapSqlToView(blog) : null;
    }
}
