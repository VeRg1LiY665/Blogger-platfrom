import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsSqlQueryRepository } from '../../../../infrastructure/posts.sql.query-repository';
import { GetPostsQueryParams } from '../../../../api/input-dto/get-posts-query-params';
import { LikesSqlRepository } from '../../../../infrastructure/likes.sql.repository';
import { NewestLike } from '../../../../domain/extendedLikesInfo.schema';
import { UsersExtSqlQRepository } from '../../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class GetAllPostsQuery {
    constructor(
        public query: GetPostsQueryParams,
        public userId?: string
    ) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
    constructor(
        private postsSqlQRepository: PostsSqlQueryRepository,
        private likesSqlRepository: LikesSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute(dto: GetAllPostsQuery) {
        const posts = await this.postsSqlQRepository.findAll(dto.query);

        for (let i = 0; i < posts.items.length; i++) {
            if (dto.userId) {
                const reaction = await this.likesSqlRepository.ShowReactionForPost(dto.userId, posts.items[i].id);
                if (reaction) {
                    posts.items[i].extendedLikesInfo.myStatus = reaction.likeStatus;
                }
            }

            const lastLikes = await this.likesSqlRepository.ShowLastLikesForPost(posts.items[i].id);

            if (lastLikes) {
                const newestLikes: NewestLike[] = [];
                for (let i = 0; i < lastLikes.length; i++) {
                    const user = await this.usersExtSqlQRepository.findById(lastLikes[i].parentId);

                    if (user !== null) {
                        newestLikes[i] = new NewestLike(lastLikes[i].addedAt, lastLikes[i].parentId, user.login);
                    }
                }

                posts.items[i].extendedLikesInfo.newestLikes = newestLikes;
            }
        }

        return posts;
    }
}
