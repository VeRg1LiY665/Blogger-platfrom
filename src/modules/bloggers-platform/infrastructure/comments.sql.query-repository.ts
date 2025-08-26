import { Comment } from '../domain/comment.entity';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class CommentsSqlQueryRepository {
    private comments: Repository<Comment>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.comments = this.dataSource.getRepository(Comment);
    }

    async findForPost(postId: string, query: GetCommentsQueryParams): Promise<PaginatedViewDto<CommentViewDto[]>> {
        const filter = {};
        filter['postId'] = postId;

        let whereClause = '';

        if (Object.keys(filter).length > 0) {
            const conditions = Object.keys(filter)
                .map((condition) => {
                    // Assuming condition is an object with key-value pairs
                    return `c."${condition}" = :${condition}`;
                })
                .toString();
            whereClause = conditions;
        }

        const queryBuilder = this.comments
            .createQueryBuilder('c')
            .select()
            .where(whereClause, { ...filter })
            .orderBy(`c."${query.sortBy}"`, query.sortDirection);

        const comments = await queryBuilder.take(query.pageSize).skip(query.calculateSkip()).getMany();

        const totalCount: number = +(await queryBuilder.getCount());

        const items = comments.map((x: Comment) => CommentViewDto.mapSqlToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findOne(id: string): Promise<CommentViewDto | null> {
        const comment = await this.comments.createQueryBuilder('c').select().where('c.id = :id', { id: id }).getOne();

        return comment ? CommentViewDto.mapSqlToView(comment) : null;
    }
}
