//input-dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BlogsSortBy } from './blogs-sort-by';
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetBlogsQueryParams extends BaseQueryParams {
    sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;
    searchNameTerm: string | null = null;
}
