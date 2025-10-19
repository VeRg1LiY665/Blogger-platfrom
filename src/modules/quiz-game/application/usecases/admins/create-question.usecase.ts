import { CreateQuestionDto } from '../../../dto/create-question.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Question } from '../../../domain/question.entity';
import { QuestionsSqlRepository } from '../../../infrastructure/questions-sql.repository';

export class CreateQuestionCommand {
    constructor(public dto: CreateQuestionDto) {}
}
/**
 * Создание админом вопроса через админскую панель
 */

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionCommand, string> {
    constructor(private questionsSqlRepository: QuestionsSqlRepository) {}

    async execute({ dto }: CreateQuestionCommand): Promise<string> {
        const newQuestion = Question.createInstance(dto);

        const id: string = await this.questionsSqlRepository.save(newQuestion);

        return id;
    }
}
