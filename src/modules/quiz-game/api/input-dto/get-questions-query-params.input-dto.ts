//input-dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами;
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { QuestionsSortBy } from './questions-sort-by';
import { QuestionsPublishedStatus } from './questions-published-status';
import { Allow } from '@nestjs/class-validator';
import { IsEnum } from 'class-validator';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetQuestionsQueryParams extends BaseQueryParams {
    @IsEnum(QuestionsSortBy)
    sortBy: QuestionsSortBy = QuestionsSortBy.CreatedAt;
    @Allow()
    bodySearchTerm: string | null = null;
    @IsEnum(QuestionsPublishedStatus)
    publishedStatus: QuestionsPublishedStatus = QuestionsPublishedStatus.All;
}
