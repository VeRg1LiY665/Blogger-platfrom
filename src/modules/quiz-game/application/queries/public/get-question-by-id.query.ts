import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DomainException, Extension } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { QuestionsSqlQRepository } from '../../../infrastructure/questions-sql.query.repository';

export class GetQuestionByIdQuery {
    constructor(public blogId: string) {}
}

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdQueryHandler implements IQueryHandler<GetQuestionByIdQuery> {
    constructor(private questionsSqlQRepository: QuestionsSqlQRepository) {}

    async execute(query: GetQuestionByIdQuery) {
        const question = await this.questionsSqlQRepository.findById(query.blogId);
        if (!question) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Question not found',
                extensions: [new Extension('Question not found', 'id')]
            });
        }
        return question;
    }
}
