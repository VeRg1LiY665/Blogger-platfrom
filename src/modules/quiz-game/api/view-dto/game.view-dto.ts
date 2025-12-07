import { GameStatus } from '../../domain/constants/game-status.constants';
import { PlayerProgressViewDto } from './player-progress.view-dto';
import { QuestionsForGameViewDto } from './questions-for-game.view-dto';
import { GameEntity } from '../../domain/game.entity';

export class GameViewDto {
    id: string;

    firstPlayerProgress: PlayerProgressViewDto;

    secondPlayerProgress: PlayerProgressViewDto | null;

    status: GameStatus;

    questions: QuestionsForGameViewDto[] | null;

    pairCreatedDate: string;

    startGameDate: string | null;

    finishGameDate: string | null;

    static mapSqlToView(game: any[], questionLimit: number): GameViewDto {
        const dto = new GameViewDto();

        dto.id = game[0].g_id;
        dto.firstPlayerProgress = {
            player: {
                id: game[0].playerId as string,
                login: game[0].playerLogin as string
            },
            score: game[0].playerScore as number,
            answers: []
        };
        dto.questions = [];
        dto.status = game[0].g_status;
        dto.pairCreatedDate = game[0].g_pairCreatedDate.toISOString();
        dto.startGameDate = game[0].g_startGameDate ? game[0].g_startGameDate.toISOString() : null;
        dto.finishGameDate = game[0].g_finishGameDate ? game[0].g_finishGameDate.toISOString() : null;

        if (game[0].g_status == GameStatus.PendingSecondPlayer) {
            dto.secondPlayerProgress = null;
            dto.questions = null;
        } else {
            for (let i = 0; i < questionLimit; i++) {
                dto.questions.push({
                    id: game[i].q_id,
                    body: game[i].body
                });
            }
            for (let i = 0; i < game.length; i += questionLimit) {
                if (game[i].answerStatus && game[i].playerId == dto.firstPlayerProgress.player.id) {
                    dto.firstPlayerProgress.answers.push({
                        questionId: game[i].questionId,
                        answerStatus: game[i].answerStatus,
                        addedAt: game[i].addedAt
                    });
                }

                if (game[i].playerId !== dto.firstPlayerProgress.player.id && !dto.secondPlayerProgress) {
                    dto.secondPlayerProgress = {
                        player: {
                            id: game[i].playerId as string,
                            login: game[i].playerLogin as string
                        },
                        score: game[i].playerScore as number,
                        answers: []
                    };
                }

                if (game[i].answerStatus && game[i].playerId !== dto.firstPlayerProgress.player.id) {
                    dto.secondPlayerProgress!.answers.push({
                        questionId: game[i].questionId,
                        answerStatus: game[i].answerStatus,
                        addedAt: game[i].addedAt
                    });
                }
            }
        }

        return dto;
    }

    // static mapManyToView(dto: GameEntity): GameViewDto {}
}
