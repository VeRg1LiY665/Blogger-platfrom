import { Comment } from '../domain/comment.entity';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CommentDbEntity } from './dto/comment-db-entity';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

export class CommentsSqlQueryRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: Comment | null = null;

    private dataMapper(commentData: CommentDbEntity): Comment {
        const comment = new Comment();
        comment.id = commentData.id;
        comment.content = commentData.content;
        comment.commentatorInfo = {
            userId: commentData.userId.toString(),
            userLogin: commentData.userLogin
        };
        comment.createdAt = commentData.createdAt;
        comment.likesInfo = {
            likesCount: commentData.likesCount,
            dislikesCount: commentData.dislikesCount,
            myStatus: 'None'
        };

        this.entity = JSON.parse(JSON.stringify(comment)); //save the state of the data through deep copy

        return comment;
    }

    async findForPost(postId: string, query: GetCommentsQueryParams): Promise<PaginatedViewDto<CommentViewDto[]>> {
        const filter = {};
        filter['"postId"'] = postId;

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
            `SELECT * FROM comments ${whereClause} ORDER BY "${query.sortBy}"` +
            ` ${query.sortDirection} ` + //Because pool.query inserts substring with "" by default
            `OFFSET ${query.calculateSkip()} LIMIT ${query.pageSize}`;

        const comments = await this.pool.query(queryText, [...Object.values(filter)]);

        const totalCount: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM comments ${whereClause}`, [...Object.values(filter)])
        ).rows[0].count;

        const items = comments.rows
            .map((x: CommentDbEntity) => this.dataMapper(x))
            .map((x: Comment) => CommentViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findOne(id: string): Promise<CommentViewDto> {
        const comment = await this.pool.query(`SELECT * FROM comments WHERE id = $1`, [id]);

        if (comment.rows.length < 1) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'No comment found'
            });
        }

        return CommentViewDto.mapSqlToView(this.dataMapper(comment.rows[0] as CommentDbEntity));
    }
}
