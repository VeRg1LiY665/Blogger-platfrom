import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum SortDirection {
    Asc = 'ASC',
    Desc = 'DESC'
}
//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
    //для трансформации в number

    @Type(() => Number)
    @IsNumber()
    pageNumber: number = 1;

    @Type(() => Number)
    @IsNumber()
    pageSize: number = 10;

    @Transform(({ value }) => value.toUpperCase() ?? SortDirection.Desc)
    @IsEnum(SortDirection)
    sortDirection: SortDirection = SortDirection.Desc;

    calculateSkip(): number {
        return (this.pageNumber - 1) * this.pageSize;
    }

    /*calculateSkipMyGames(rowsCount: number): number {
        switch (this.sortDirection) {
            case SortDirection.Asc:
                return (this.pageNumber - 1) * this.pageSize * 50; //Пока так - потом подумаю, как здесь импортировать число ответных строк из бд на одну игру
            case SortDirection.Desc:
                return (this.pageNumber - 1) * (this.pageSize - 1) * 50 + (rowsCount % 50);
        }
    }*/
}
