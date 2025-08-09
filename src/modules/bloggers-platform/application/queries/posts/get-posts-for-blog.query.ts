import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogsSqlQueryRepository } from '../../../infrastructure/blogs.sql.query-repository';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostsSqlQueryRepository } from '../../../infrastructure/posts.sql.query-repository';
import { GetPostsQueryParams } from '../../../api/input-dto/get-posts-query-params';

export class GetPostsForBlogQuery {
    constructor(
        public blogId: string,
        public query: GetPostsQueryParams
    ) {}
}

@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler implements IQueryHandler<GetPostsForBlogQuery> {
    constructor(
        private blogsSqlQRepository: BlogsSqlQueryRepository,
        private postsSqlQRepository: PostsSqlQueryRepository
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

        if (!posts) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Posts not found'
            });
        }

        return posts;
    }
}
