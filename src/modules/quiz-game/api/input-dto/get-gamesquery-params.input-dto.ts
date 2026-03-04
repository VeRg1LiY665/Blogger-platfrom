//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
import { IsEnum } from 'class-validator';
import { GamesSortBy } from './games-sort-by';
import { BaseQueryParams, SortDirection } from '../../../../core/dto/base.query-params.input-dto';

export class GetGamesQueryParams extends BaseQueryParams {
    @IsEnum(GamesSortBy)
    sortBy: GamesSortBy = GamesSortBy.pairCreatedDate;

    calculateSkipMyGames(rowsCount: number): number {
        switch (this.sortDirection) {
            case SortDirection.Asc:
                return (this.pageNumber - 1) * this.pageSize * 50; //Пока так - потом подумаю, как здесь импортировать число ответных строк из бд на одну игру
            case SortDirection.Desc:
                return (this.pageNumber - 1) * (this.pageSize - 1) * 50 + (rowsCount % 50);
        }
    }

    calculateTakeMyGames(rowsCount: number): number {
        switch (this.sortDirection) {
            case SortDirection.Asc:
                return rowsCount / (50 * this.pageNumber) < 1
                    ? (this.pageSize - 1) * 50 + (rowsCount % 50)
                    : this.pageSize * 50;
            case SortDirection.Desc:
                return this.pageNumber == 1 ? (this.pageSize - 1) * 50 + (rowsCount % 50) : this.pageSize * 50;
        }
    }
}
