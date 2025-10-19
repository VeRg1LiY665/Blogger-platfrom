import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsSqlRepository } from '../../../infrastructure/questions-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PublishQuestionDto } from '../../../dto/publish-question.dto';

export class PublishQuestionCommand {
    constructor(public dto: PublishQuestionDto) {}
}
/**
 * Publish/unpublish админом вопроса через админскую панель
 */

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase implements ICommandHandler<PublishQuestionCommand, void> {
    constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

    async execute({ dto }: PublishQuestionCommand): Promise<void> {
        const question = await this.questionsSqlRepository.findById(dto.id);

        if (!question) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Question not found'
            });
        }

        question.publish(dto.published);

        await this.questionsSqlRepository.save(question);

        return;
    }
}
