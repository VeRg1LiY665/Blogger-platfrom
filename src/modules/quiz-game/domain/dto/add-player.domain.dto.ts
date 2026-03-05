import { GameQuestion } from '../game-questions.entity';

export class AddPlayerDomainDto {
    userId: string;
    userLogin: string;
    questions: GameQuestion[];
}
