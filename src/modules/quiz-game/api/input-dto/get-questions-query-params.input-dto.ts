//input-dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами;
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { QuestionsSortBy } from './questions-sort-by';
import { QuestionsPublishedStatus } from './questions-published-status';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetQuestionsQueryParams extends BaseQueryParams {
    sortBy: QuestionsSortBy = QuestionsSortBy.CreatedAt;
    bodySearchTerm: string | null = null;
    publishedStatus: QuestionsPublishedStatus = QuestionsPublishedStatus.All;
}
