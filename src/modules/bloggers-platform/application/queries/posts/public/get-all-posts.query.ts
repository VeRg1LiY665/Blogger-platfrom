import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsSqlQueryRepository } from '../../../../infrastructure/posts.sql.query-repository';
import { GetPostsQueryParams } from '../../../../api/input-dto/get-posts-query-params';

export class GetAllPostsQuery {
    constructor(public query: GetPostsQueryParams) {}
}

@QueryHandler(GetAllPostsQuery)
export class GetAllPostsQueryHandler implements IQueryHandler<GetAllPostsQuery> {
    constructor(private postsSqlQRepository: PostsSqlQueryRepository) {}

    async execute(query: GetAllPostsQuery) {
        return await this.postsSqlQRepository.findAll(query.query);
    }
}
