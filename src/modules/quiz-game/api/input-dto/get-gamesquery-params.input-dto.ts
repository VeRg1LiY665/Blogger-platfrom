//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
import { IsEnum } from 'class-validator';
import { GamesSortBy } from './games-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

export class GetGamesQueryParams extends BaseQueryParams {
    @IsEnum(GamesSortBy)
    sortBy: GamesSortBy = GamesSortBy.pairCreatedDate;
}
