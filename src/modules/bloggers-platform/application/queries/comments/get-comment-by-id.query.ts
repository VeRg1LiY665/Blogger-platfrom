import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlQueryRepository } from '../../../infrastructure/comments.sql.query-repository';
import { LikesSqlRepository } from '../../../infrastructure/likes.sql.repository';

export class GetCommentByIdQuery {
    constructor(
        public id: string,
        public userId: string | undefined
    ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
    constructor(
        private commentsSqlQRepository: CommentsSqlQueryRepository,
        private likesSqlRepository: LikesSqlRepository
    ) {}

    async execute(query: GetCommentByIdQuery) {
        const comment = await this.commentsSqlQRepository.findOne(query.id);
        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Comment not found'
            });
        }
        if (query.userId) {
            const reaction = await this.likesSqlRepository.ShowReactionForComment(query.userId, comment.id);
            if (reaction) {
                comment.likesInfo.myStatus = reaction.likeStatus;
            }
        }
        return comment;
    }
}
