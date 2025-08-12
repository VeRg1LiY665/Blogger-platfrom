import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GetCommentsQueryParams } from '../../../api/input-dto/get-comments-query-params';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';
import { CommentsSqlQueryRepository } from '../../../infrastructure/comments.sql.query-repository';
import { LikesSqlRepository } from '../../../infrastructure/likes.sql.repository';

export class GetCommentsForPostQuery {
    constructor(
        public id: string,
        public query: GetCommentsQueryParams,
        public userId?: string
    ) {}
}

@QueryHandler(GetCommentsForPostQuery)
export class GetCommentsForPostQueryHandler implements IQueryHandler<GetCommentsForPostQuery> {
    constructor(
        private commentsSqlQRepository: CommentsSqlQueryRepository,
        private postsSqlRepository: PostsSqlRepository,
        private likesSqlRepository: LikesSqlRepository
    ) {}

    async execute(dto: GetCommentsForPostQuery) {
        const post = await this.postsSqlRepository.findById(dto.id);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }
        const comments = await this.commentsSqlQRepository.findForPost(dto.id, dto.query);

        if (dto.userId) {
            for (let i = 0; i < comments.items.length; i++) {
                const reaction = await this.likesSqlRepository.ShowReactionForComment(dto.userId, comments.items[i].id);
                if (reaction) {
                    comments.items[i].likesInfo.myStatus = reaction.likeStatus;
                }
            }
        }

        return comments;
    }
}
