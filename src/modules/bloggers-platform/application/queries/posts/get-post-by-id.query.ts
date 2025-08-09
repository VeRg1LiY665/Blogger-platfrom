import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostsSqlQueryRepository } from '../../../infrastructure/posts.sql.query-repository';

export class GetPostByIdQuery {
    constructor(public postId: string) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
    constructor(private postsSqlQRepository: PostsSqlQueryRepository) {}

    async execute(query: GetPostByIdQuery) {
        const post = await this.postsSqlQRepository.findById(query.postId);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found',
                extensions: [new Extension('Post not found', 'name')]
            });
        }
        return post;
    }
}
