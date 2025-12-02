import { GameStatus } from '../../domain/constants/game-status.constants';
import { PlayerProgressViewDto } from './player-progress.view-dto';
import { QuestionsForGameViewDto } from './questions-for-game.view-dto';

export class GameViewDto {
    //constructor(private readonly questionLimit: number) {}

    id: string;

    firstPlayerProgress: PlayerProgressViewDto;

    secondPlayerProgress: PlayerProgressViewDto | null;

    status: GameStatus;

    questions: QuestionsForGameViewDto[] | null;

    pairCreatedDate: string;

    startGameDate: string | null;

    finishGameDate: string | null;

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
        dto.questions = [];
        dto.status = game[0].g_status;
        dto.pairCreatedDate = game[0].g_pairCreatedDate.toISOString();
        dto.startGameDate = game[0].g_startGameDate ? game[0].g_startGameDate.toISOString() : null;
        dto.finishGameDate = game[0].g_finishGameDate ? game[0].g_finishGameDate.toISOString() : null;

        if (game[0].g_status == GameStatus.PendingSecondPlayer) {
            dto.secondPlayerProgress = null;
            dto.questions = null;
        } else {
            /*dto.secondPlayerProgress = {
                player: {
                    id: game[5].playerId as string,
                    login: game[5].playerLogin as string
                },
                score: game[5].playerScore as number,
                answers: []
            };*/

            for (let i = 0; i < 5; i++) {
                dto.questions.push({
                    id: game[i].q_id,
                    body: game[i].body
                });
            }
            for (let i = 0; i < game.length; i += 5) {
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
                //console.log(dto);
            }
            /*game.forEach((el, i) => {
                if (i < 5) {
                    /!*dto.questions!.push({
                        id: el.q_id,
                        body: el.body
                    });*!/

                    if (el.answerStatus) {
                        //Граничное условие - игра Active, но первый юзер еще не ответил ни на один вопрос
                        dto.firstPlayerProgress.answers.push({
                            questionId: el.questionId,
                            answerStatus: el.answerStatus,
                            addedAt: el.addedAt
                        });
                    }
                } else {
                    if (el.answerStatus) {
                        //Граничное условие - игра Active, но второй юзер еще не ответил ни на один вопрос
                        dto.secondPlayerProgress!.answers.push({
                            questionId: el.questionId,
                            answerStatus: el.answerStatus,
                            addedAt: el.addedAt
                        });
                    }
                }
            });*/
        }

        return dto;
    }
}
