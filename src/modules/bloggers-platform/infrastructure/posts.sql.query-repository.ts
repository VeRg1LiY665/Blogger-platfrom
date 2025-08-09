import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { Post } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Pool } from 'pg';
import { PostDbEntity } from './dto/post-db-entity';
import { NewestLike } from '../domain/extendedLikesInfo.schema';

@Injectable({ scope: Scope.REQUEST })
export class PostsSqlQueryRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private dataMapper(postData: PostDbEntity): Post {
        //temporary until likes done or not - create instance here, add extLikesInfo in BLL later
        const post = new Post();
        post.id = postData.id;
        post.title = postData.title;
        post.shortDescription = postData.shortDescription;
        post.content = postData.content;
        post.blogId = postData.blogId.toString();
        post.blogName = postData.blogName;
        post.createdAt = postData.createdAt;
        post.extendedLikesInfo = {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [new NewestLike('', '', '')]
        };

        return post;
    }

    async findAll(query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        const filter = {}; //This actually is not included in use case
        if (query.searchNameTerm) {
            filter['title'] = '%' + query.searchNameTerm + '%';
        }

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `${condition} ILIKE $${i + 1}`;
                })
                .toString();
            whereClause = `WHERE ${conditions}`;
        }

        const queryText =
            `SELECT * FROM posts ${whereClause} ORDER BY "${query.sortBy}"` +
            ` ${query.sortDirection} ` + //Because pool.query inserts substring with "" by default
            `OFFSET ${query.calculateSkip()} LIMIT ${query.pageSize}`;

        const posts = await this.pool.query(queryText, [...Object.values(filter)]);

        const totalCount: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM posts ${whereClause}`, [...Object.values(filter)])
        ).rows[0].count;

        const items = posts.rows
            .map((x: PostDbEntity) => this.dataMapper(x))
            .map((x: Post) => PostViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<PostViewDto> {
        const post = await this.pool.query(`SELECT * FROM posts WHERE id = $1`, [id]);

        if (post.rows.length < 1) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        return PostViewDto.mapSqlToView(this.dataMapper(post.rows[0] as PostDbEntity));
    }

    async findForBlog(blogId: string, query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        const filter: FilterQuery<Post> = {};
        filter['"blogId"'] = blogId;

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition, i) => {
                    // Assuming condition is an object with key-value pairs
                    return `${condition} = $${i + 1}`;
                })
                .toString();
            whereClause = `WHERE ${conditions}`;
        }

        const queryText =
            `SELECT * FROM posts ${whereClause} ORDER BY "${query.sortBy}"` +
            ` ${query.sortDirection} ` + //Because pool.query inserts substring with "" by default
            `OFFSET ${query.calculateSkip()} LIMIT ${query.pageSize}`;

        const posts = await this.pool.query(queryText, [...Object.values(filter)]);

        const totalCount: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM posts ${whereClause}`, [...Object.values(filter)])
        ).rows[0].count;

        const items = posts.rows
            .map((x: PostDbEntity) => this.dataMapper(x))
            .map((x: Post) => PostViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }
}
