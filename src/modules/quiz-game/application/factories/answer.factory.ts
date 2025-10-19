import { Injectable } from '@nestjs/common';
import { Answer } from '../../domain/answers.entity';
import { AnswerStatus } from '../../domain/constants/answer-status.constants';

@Injectable()
export class AnswersFactory {
    constructor() {}
    create(qId: string, flag: boolean): Answer {
        const dto = {
            questionId: qId,
            answerStatus: flag ? AnswerStatus.Correct : AnswerStatus.Incorrect
        };

        const result: Answer = Answer.createInstance(dto);

        return result;
    }
}
