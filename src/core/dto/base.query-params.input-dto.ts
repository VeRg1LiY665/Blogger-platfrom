import { Transform, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

export enum SortDirection {
    Asc = 'ASC',
    Desc = 'DESC'
}
//базовый класс для query параметров с пагинацией
//значения по-умолчанию применятся автоматически при настройке глобального ValidationPipe в main.ts
export class BaseQueryParams {
    //для трансформации в number
    @Type(() => Number)
    pageNumber: number = 1;
    @Type(() => Number)
    pageSize: number = 10;

    @Transform(({ value }) => value.toUpperCase() ?? SortDirection.Desc)
    @IsEnum(SortDirection)
    sortDirection: SortDirection = SortDirection.Desc;

    calculateSkip(): number {
        return (this.pageNumber - 1) * this.pageSize;
    }
}
