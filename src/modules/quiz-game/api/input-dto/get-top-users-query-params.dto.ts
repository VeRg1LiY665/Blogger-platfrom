import { IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { TopUsersSortBy } from './top-users-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { Transform } from 'class-transformer';

export class GetTopUsersQueryParams extends BaseQueryParams {
    //Default value : ?sort=avgScores desc&sort=sumScore desc

    @Transform(({ value }) => {
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
    })
    @IsObject()
    @IsOptional()
    sort: TopUsersSortBy;
}
