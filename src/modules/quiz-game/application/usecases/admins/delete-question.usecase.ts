import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsSqlRepository } from '../../../infrastructure/questions-sql.repository';
import { Question } from '../../../domain/question.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteQuestionCommand {
    constructor(public id: string) {}
}
/**
 * Удаление админом вопроса через админскую панель
 */

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase implements ICommandHandler<DeleteQuestionCommand, void> {
    constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

    async execute({ id }: DeleteQuestionCommand): Promise<void> {
        const question = await this.questionsSqlRepository.findById(id);

        if (!question) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Question not found'
            });
        }

        return await this.questionsSqlRepository.delete(id);
    }
}
