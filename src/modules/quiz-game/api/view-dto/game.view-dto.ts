import { GameStatus } from '../../domain/constants/game-status.constants';
import { PlayerProgressViewDto } from './player-progress.view-dto';
import { QuestionsForGameViewDto } from './questions-for-game.view-dto';

export class GameViewDto {
    //constructor(private readonly questionLimit: number) {}

    id: string;

    firstPlayerProgress: PlayerProgressViewDto;

    secondPlayerProgress: PlayerProgressViewDto;

    status: GameStatus;

    questions: QuestionsForGameViewDto[] = [];

    pairCreatedDate: string;

    startGameDate: string;

    finishGameDate: string;

    static mapSqlToView(game: any[]): GameViewDto {
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

        dto.secondPlayerProgress = {
            player: {
                id: 'null',
                login: 'null'
            },
            score: 0,
            answers: []
        };

        dto.status = game[0].g_status;
        dto.pairCreatedDate = game[0].g_pairCreatedDate.toISOString();
        dto.startGameDate = game[0].g_startGameDate ? game[0].g_startGameDate.toISOString() : 'null';
        dto.finishGameDate = game[0].g_finishGameDate ? game[0].g_finishGameDate.toISOString() : 'null';

        if (game[0].g_status == GameStatus.PendingSecondPlayer) {
            dto.firstPlayerProgress.answers.push({
                questionId: 'null',
                answerStatus: 'null',
                addedAt: 'null'
            });

            dto.secondPlayerProgress.answers.push({
                questionId: 'null',
                answerStatus: 'null',
                addedAt: 'null'
            });
            game.forEach((el) => {
                dto.questions.push({
                    id: el.q_id,
                    body: el.body
                });
            });
        } else {
            game.forEach((el, i) => {
                if (i < 5) {
                    dto.questions.push({
                        id: el.q_id,
                        body: el.body
                    });

                    dto.firstPlayerProgress.answers.push({
                        questionId: el.questionId,
                        answerStatus: el.answerStatus,
                        addedAt: el.addedAt
                    });
                } else {
                    dto.secondPlayerProgress.answers.push({
                        questionId: el.questionId,
                        answerStatus: el.answerStatus,
                        addedAt: el.addedAt
                    });
                }
            });
        }

        //console.log(dto);

        return dto;
    }
}
