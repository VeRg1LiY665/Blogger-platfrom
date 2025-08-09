import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsSqlQueryRepository } from '../../../infrastructure/blogs.sql.query-repository';

export class GetBlogByIdQuery {
    constructor(public blogId: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
    constructor(private blogsSqlQRepository: BlogsSqlQueryRepository) {}

    async execute(query: GetBlogByIdQuery) {
        //const user = await this.usersQRepository.findById(query.userId);
        const blog = await this.blogsSqlQRepository.findById(query.blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found',
                extensions: [new Extension('Blog not found', 'name')]
            });
        }
        return blog;
    }
}
