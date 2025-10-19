import { Injectable } from '@nestjs/common';
import { QuestionsSqlRepository } from '../../infrastructure/questions-sql.repository';
import { GameQuestion } from '../../domain/game-questions.entity';

@Injectable()
export class GameQuestionsFactory {
    constructor(
        private readonly questionsSqlRepository: QuestionsSqlRepository,
        private readonly questionLimit: number
    ) {}
    async create(): Promise<GameQuestion[]> {
        const questions = await this.questionsSqlRepository.findForGame(this.questionLimit);
        const result: GameQuestion[] = [];
        for (const question of questions) {
            result.push(GameQuestion.createInstance(question));
        }
        return result;
    }
}
