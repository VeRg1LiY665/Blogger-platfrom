import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { PostsSqlQueryRepository } from '../../../../infrastructure/posts.sql.query-repository';
import { LikesSqlRepository } from '../../../../infrastructure/likes.sql.repository';
import { NewestLike } from '../../../../domain/extendedLikesInfo.schema';
import { UsersExtSqlQRepository } from '../../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class GetPostByIdQuery {
    constructor(
        public postId: string,
        public userId: string | null
    ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
    constructor(
        private postsSqlQRepository: PostsSqlQueryRepository,
        private likesSqlRepository: LikesSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute(query: GetPostByIdQuery) {
        const post = await this.postsSqlQRepository.findById(query.postId);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found',
                extensions: [new Extension('Post not found', 'name')]
            });
        }

        if (query.userId) {
            const reaction = await this.likesSqlRepository.ShowReactionForPost(query.userId, query.postId);
            if (reaction) {
                post.extendedLikesInfo.myStatus = reaction.likeStatus;
            }
        }

        const lastLikes = await this.likesSqlRepository.ShowLastLikesForPost(query.postId);

        if (lastLikes) {
            const newestLikes: NewestLike[] = [];
            for (let i = 0; i < lastLikes.length; i++) {
                const user = await this.usersExtSqlQRepository.findById(lastLikes[i].parentId);

                if (user !== null) {
                    newestLikes[i] = new NewestLike(lastLikes[i].addedAt, lastLikes[i].parentId, user.login);
                }
            }

            post.extendedLikesInfo.newestLikes = newestLikes;
        }

        return post;
    }
}
