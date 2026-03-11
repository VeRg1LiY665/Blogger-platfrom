import { IsOptional } from 'class-validator';
import { TopUsersSortBy } from './top-users-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { Transform } from 'class-transformer';
import { IsValidMappedType } from '../../../../core/decorators/validation/nested-mapped-type.validation';

export class GetTopUsersQueryParams extends BaseQueryParams {
    //Default value : ?sort=avgScores desc&sort=sumScore desc

    @Transform(
        ({ value }) => {
            if (Array.isArray(value)) {
                return value.reduce((obj, item) => {
                    const [key, val] = item.split(' ');
                    if (key && val) {
                        obj[key.trim()] = val.trim().toUpperCase();
                    }
                    return obj;
                }, {} as TopUsersSortBy);
            } else {
                const [key, val] = value.split(' ');

                return { [key.trim()]: val.trim().toUpperCase() };
            }
        },
        { toClassOnly: true }
    )
    @IsOptional()
    @IsValidMappedType()
    sort: TopUsersSortBy;
}
