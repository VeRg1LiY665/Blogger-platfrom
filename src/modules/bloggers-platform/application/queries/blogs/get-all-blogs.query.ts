import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogsSqlQueryRepository } from '../../../infrastructure/blogs.sql.query-repository';

export class GetAllBlogsQuery {
    constructor(public query: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsQuery)
export class GetAllBlogsQueryHandler implements IQueryHandler<GetAllBlogsQuery> {
    constructor(private blogsSqlQRepository: BlogsSqlQueryRepository) {}

    async execute(query: GetAllBlogsQuery) {
        return await this.blogsSqlQRepository.findAll(query.query);
    }
}
