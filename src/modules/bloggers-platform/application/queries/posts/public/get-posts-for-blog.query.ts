import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsSqlQueryRepository } from '../../../../infrastructure/blogs.sql.query-repository';
import { DomainException, Extension } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { PostsSqlQueryRepository } from '../../../../infrastructure/posts.sql.query-repository';
import { GetPostsQueryParams } from '../../../../api/input-dto/get-posts-query-params';
import { NewestLike } from '../../../../domain/extendedLikesInfo.schema';
import { LikesSqlRepository } from '../../../../infrastructure/likes.sql.repository';
import { UsersExtSqlQRepository } from '../../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class GetPostsForBlogQuery {
    constructor(
        public blogId: string,
        public query: GetPostsQueryParams,
        public userId?: string
    ) {}
}

@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler implements IQueryHandler<GetPostsForBlogQuery> {
    constructor(
        private blogsSqlQRepository: BlogsSqlQueryRepository,
        private postsSqlQRepository: PostsSqlQueryRepository,
        private likesSqlRepository: LikesSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute(dto: GetPostsForBlogQuery) {
        const blog = await this.blogsSqlQRepository.findById(dto.blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found',
                extensions: [new Extension('Blog not found', 'name')]
            });
        }

        const posts = await this.postsSqlQRepository.findForBlog(dto.blogId, dto.query);

        /*if (!posts) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Posts not found'
            });
        }*/

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
                        newestLikes[i] = new NewestLike(
                            lastLikes[i].addedAt.toISOString(),
                            lastLikes[i].parentId,
                            user.login
                        );
                    }
                }

                posts.items[i].extendedLikesInfo.newestLikes = newestLikes;
            }
        }

        return posts;
    }
}
