import { GameQuestion } from '../game-questions.entity';

export class CreateGameDomainDto {
    gameId: string;
    userId: string;
    userLogin: string;
    questions: GameQuestion[];
}
