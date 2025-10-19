import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuestionsQueryParams } from '../../../api/input-dto/get-questions-query-params.input-dto';
import { QuestionsSqlQRepository } from '../../../infrastructure/questions-sql.query.repository';

export class GetAllQuestionsAdminsQuery {
    constructor(public query: GetQuestionsQueryParams) {}
}

@QueryHandler(GetAllQuestionsAdminsQuery)
export class GetAllQuestionsAdminsQueryHandler implements IQueryHandler<GetAllQuestionsAdminsQuery> {
    constructor(private questionsSqlQRepository: QuestionsSqlQRepository) {}

    async execute(query: GetAllQuestionsAdminsQuery) {
        return await this.questionsSqlQRepository.findAll(query.query);
    }
}
