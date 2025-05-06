import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { PostsSortBy } from './posts-sort-by';

export class GetPostsQueryParams extends BaseQueryParams {
    sortBy: PostsSortBy = PostsSortBy.CreatedAt;
    searchNameTerm: string | null = null;
}
