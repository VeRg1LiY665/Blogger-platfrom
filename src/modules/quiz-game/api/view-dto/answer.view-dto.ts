import { Answer } from '../../domain/answers.entity';

export class AnswerViewDto {
    questionId: string;
    answerStatus: string;
    addedAt: string;

    static mapSqlToView(answer: Answer): AnswerViewDto {
        const dto = new AnswerViewDto();

        dto.questionId = answer.questionId;
        dto.answerStatus = answer.answerStatus;
        dto.addedAt = answer.addedAt.toISOString();

        return dto;
    }
}
