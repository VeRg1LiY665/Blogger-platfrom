import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { Post } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Injectable } from '@nestjs/common';
import { PostDbEntity } from './dto/post-db-entity';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsSqlQueryRepository {
    private posts: Repository<Post>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.posts = this.dataSource.getRepository(Post);
    }

    async findAll(query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        const filter = {}; //This actually is not included in use case
        if (query.searchNameTerm) {
            filter['title'] = '%' + query.searchNameTerm + '%';
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    return `p.${condition} ILIKE :${condition}`;
                })
                .toString();
            whereClause = conditions;
        }

        const queryBuilder = this.posts
            .createQueryBuilder('p')
            .select()
            .where(whereClause, { ...filter })
            .orderBy(`p."${query.sortBy}"`, query.sortDirection);

        const posts = await queryBuilder.take(query.pageSize).skip(query.calculateSkip()).getMany();

        const totalCount: number = +(await queryBuilder.getCount());

        const items = posts.map((x: Post) => PostViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<PostViewDto | null> {
        const post = await this.posts.createQueryBuilder('p').select().where('p.id = :id', { id: id }).getOne();

        return post ? PostViewDto.mapSqlToView(post) : null;
    }

    async findForBlog(blogId: string, query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        const filter = {};
        filter['blogId'] = blogId;

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    return `p."${condition}" = :${condition}`;
                })
                .toString();
            whereClause = conditions;
        }

        const queryBuilder = this.posts
            .createQueryBuilder('p')
            .select()
            .where(whereClause, { ...filter })
            .orderBy(`p."${query.sortBy}"`, query.sortDirection);

        const posts = await queryBuilder.take(query.pageSize).skip(query.calculateSkip()).getMany();

        const totalCount: number = +(await queryBuilder.getCount());

        const items = posts.map((x: Post) => PostViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }
}
