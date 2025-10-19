import { GameStatus } from '../../domain/constants/game-status.constants';
import { PlayerProgressViewDto } from './player-progress.view-dto';
import { QuestionsForGameViewDto } from './questions-for-game.view-dto';

export class GameViewDto {
    id: string;

    firstPlayerProgress: PlayerProgressViewDto;

    secondPlayerProgress: PlayerProgressViewDto;

    status: GameStatus;

    questions: QuestionsForGameViewDto[];

    pairCreatedDate: string;

    startGameDate: string;

    finishGameDate: string;

    static mapSqlToView(game: any): GameViewDto {
        const dto = new GameViewDto();

        dto.id = game.id;
        dto.firstPlayerProgress = {
            answers: game.playerProgress[0].answers,
            player: {
                id: game.playerProgress[0].playerId,
                login: game.playerProgress[0].playerLogin
            },
            score: game.playerProgress[0].playerScore
        };
        dto.secondPlayerProgress = {
            answers: game.playerProgress[1].answers,
            player: {
                id: game.playerProgress[1].playerId,
                login: game.playerProgress[1].playerLogin
            },
            score: game.playerProgress[1].playerScore
        };
        dto.status = game.status;
        dto.questions = game.questions;
        dto.pairCreatedDate = game.pairCreatedDate.toISOString();
        dto.startGameDate = game.startGameDate ? game.startGameDate.toISOString() : 'null';
        dto.finishGameDate = game.finishGameDate ? game.finishGameDate.toISOString() : 'null';

        return dto;
    }
}
