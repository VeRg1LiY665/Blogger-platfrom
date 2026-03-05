import { GameStatus } from '../../domain/constants/game-status.constants';
import { PlayerProgressViewDto } from './player-progress.view-dto';
import { QuestionsForGameViewDto } from './questions-for-game.view-dto';

export class GameViewDto {
    id: string;

    firstPlayerProgress: PlayerProgressViewDto;

    secondPlayerProgress: PlayerProgressViewDto | null;

    status: GameStatus;

    questions: QuestionsForGameViewDto[] | null;

    pairCreatedDate: string;

    startGameDate: string | null;

    finishGameDate: string | null;

    static mapSqlToView(game: any[], questionLimit: number): GameViewDto | GameViewDto[] {
        const result: GameViewDto[] = [];
        let k: number = 1;

        for (let j = 0; j < game.length; j = k) {
            //j - starting index for each iteration

            const dto = new GameViewDto();

            dto.id = game[j].g_id;
            dto.firstPlayerProgress = {
                player: {
                    id: game[j].playerId as string,
                    login: game[j].playerLogin as string
                },
                score: game[j].playerScore as number,
                answers: []
            };
            dto.questions = [];
            dto.status = game[j].g_status;
            dto.pairCreatedDate = game[j].g_pairCreatedDate.toISOString();
            dto.startGameDate = game[j].g_startGameDate ? game[j].g_startGameDate.toISOString() : null;
            dto.finishGameDate = game[j].g_finishGameDate ? game[j].g_finishGameDate.toISOString() : null;

            if (game[j].g_status == GameStatus.PendingSecondPlayer) {
                dto.secondPlayerProgress = null;
                dto.questions = null;
                k += questionLimit;
            } else {
                for (let q = j; q < j + questionLimit; q++) {
                    dto.questions.push({
                        id: game[q].q_id,
                        body: game[q].body
                    });
                }
                for (let i = j; i < game.length; i += questionLimit) {
                    if (game[i].g_id !== dto.id) {
                        k = i;

                        break; //Проверили, что вывалились за текущую игру -> переназначили начало для следующей итерации и прервали цикл
                    }

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
                    k = i + questionLimit; //потому что итератор увеличивается за телом цикла
                }
            }

            result.push(dto);
        }

        return result.length > 1 ? result : result[0];
    }

    //NOTE! !Backup for single game in case anything breaks!
    //         dto.id = game[0].g_id;
    //         dto.firstPlayerProgress = {
    //             player: {
    //                 id: game[0].playerId as string,
    //                 login: game[0].playerLogin as string
    //             },
    //             score: game[0].playerScore as number,
    //             answers: []
    //         };
    //         dto.questions = [];
    //         dto.status = game[0].g_status;
    //         dto.pairCreatedDate = game[0].g_pairCreatedDate.toISOString();
    //         dto.startGameDate = game[0].g_startGameDate ? game[0].g_startGameDate.toISOString() : null;
    //         dto.finishGameDate = game[0].g_finishGameDate ? game[0].g_finishGameDate.toISOString() : null;
    //
    //         if (game[0].g_status == GameStatus.PendingSecondPlayer) {
    //             dto.secondPlayerProgress = null;
    //             dto.questions = null;
    //         } else {
    //             for (let i = 0; i < questionLimit; i++) {
    //                 dto.questions.push({
    //                     id: game[i].q_id,
    //                     body: game[i].body
    //                 });
    //             }
    //             for (let i = 0; i < game.length; i += questionLimit) {
    //                 if (game[i].answerStatus && game[i].playerId == dto.firstPlayerProgress.player.id) {
    //                     dto.firstPlayerProgress.answers.push({
    //                         questionId: game[i].questionId,
    //                         answerStatus: game[i].answerStatus,
    //                         addedAt: game[i].addedAt
    //                     });
    //                 }
    //
    //                 if (game[i].playerId !== dto.firstPlayerProgress.player.id && !dto.secondPlayerProgress) {
    //                     dto.secondPlayerProgress = {
    //                         player: {
    //                             id: game[i].playerId as string,
    //                             login: game[i].playerLogin as string
    //                         },
    //                         score: game[i].playerScore as number,
    //                         answers: []
    //                     };
    //                 }
    //
    //                 if (game[i].answerStatus && game[i].playerId !== dto.firstPlayerProgress.player.id) {
    //                     dto.secondPlayerProgress!.answers.push({
    //                         questionId: game[i].questionId,
    //                         answerStatus: game[i].answerStatus,
    //                         addedAt: game[i].addedAt
    //                     });
    //                 }
    //             }
    //         }
    //
    //         return dto;
}
