import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { CommentsSortBy } from './comments-sort-by';
import { Allow } from '@nestjs/class-validator';

export class GetCommentsQueryParams extends BaseQueryParams {
    @Allow()
    sortBy: CommentsSortBy = CommentsSortBy.CreatedAt;
}
