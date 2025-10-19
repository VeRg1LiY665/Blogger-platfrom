import { AnswerStatus } from '../constants/answer-status.constants';

export class CreateAnswerDomainDto {
    questionId: string;
    answerStatus: AnswerStatus;
}
