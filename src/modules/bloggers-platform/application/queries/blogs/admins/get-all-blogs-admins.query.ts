import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogsSqlQueryRepository } from '../../../../infrastructure/blogs.sql.query-repository';

export class GetAllBlogsAdminsQuery {
    constructor(public query: GetBlogsQueryParams) {}
}

@QueryHandler(GetAllBlogsAdminsQuery)
export class GetAllBlogsAdminsQueryHandler implements IQueryHandler<GetAllBlogsAdminsQuery> {
    constructor(private blogsSqlQRepository: BlogsSqlQueryRepository) {}

    async execute(query: GetAllBlogsAdminsQuery) {
        return await this.blogsSqlQRepository.findAll(query.query);
    }
}
