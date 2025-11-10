//input-dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BlogsSortBy } from './blogs-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { Allow } from '@nestjs/class-validator';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetBlogsQueryParams extends BaseQueryParams {
    @Allow()
    sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;
    @Allow()
    searchNameTerm: string | null = null;
}
