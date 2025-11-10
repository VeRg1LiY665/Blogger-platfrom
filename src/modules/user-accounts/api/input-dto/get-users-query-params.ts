import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { UsersSortBy } from './users-sort-by';
import { Allow } from '@nestjs/class-validator';
import { IsEnum } from 'class-validator';

export class GetUsersQueryParams extends BaseQueryParams {
    @IsEnum(UsersSortBy)
    sortBy: UsersSortBy = UsersSortBy.CreatedAt;
    @Allow()
    searchLoginTerm: string | null = null;
    @Allow()
    searchEmailTerm: string | null = null;
}
