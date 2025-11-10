import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';
import { Allow } from '@nestjs/class-validator';

export class GetPostsQueryParams extends BaseQueryParams {
    @Allow()
    sortBy: PostsSortBy = PostsSortBy.CreatedAt;
    @Allow()
    searchNameTerm: string | null = null;
}
