import { GameQuestion } from '../game-questions.entity';

export class CreateGameDomainDto {
    userId: string;
    userLogin: string;
    questions: GameQuestion[];
}
