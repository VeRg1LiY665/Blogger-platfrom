import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsSqlRepository } from '../../../infrastructure/questions-sql.repository';
import { UpdateQuestionDto } from '../../../dto/update-question.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateQuestionCommand {
    constructor(public dto: UpdateQuestionDto) {}
}
/**
 * Обновление админом вопроса через админскую панель
 */

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase implements ICommandHandler<UpdateQuestionCommand, void> {
    constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

    async execute({ dto }: UpdateQuestionCommand): Promise<void> {
        const question = await this.questionsSqlRepository.findById(dto.id);

        if (!question) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Question not found'
            });
        }

        question.update(dto);

        await this.questionsSqlRepository.save(question);

        return;
    }
}
