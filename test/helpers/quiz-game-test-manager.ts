import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuestionInputDto } from '../../src/modules/quiz-game/api/input-dto/question.input-dto';
import { QuestionViewDto } from '../../src/modules/quiz-game/api/view-dto/questions.view-dto';
import { PublishInputDto } from '../../src/modules/quiz-game/api/input-dto/publish.input-dto';
import { GameViewDto } from '../../src/modules/quiz-game/api/view-dto/game.view-dto';
import { AnswerViewDto } from '../../src/modules/quiz-game/api/view-dto/answer.view-dto';
import { UserStatisticsViewDto } from '../../src/modules/quiz-game/api/view-dto/player-statistics.view-dto';
import { TopUsersSortBy } from '../../src/modules/quiz-game/api/input-dto/top-users-sort-by';
import { SortDirection } from '../../src/core/dto/base.query-params.input-dto';

export class QuizGameTestManager {
    constructor(private app: INestApplication) {}

    async createQuestion(
        createModel: QuestionInputDto,
        statusCode: number = HttpStatus.CREATED
    ): Promise<QuestionViewDto> {
        const response = await request(this.app.getHttpServer())
            .post(`/sa/quiz/questions`)
            .send(createModel)
            .auth('admin', 'qwerty')
            .expect(statusCode);

        return response.body;
    }

    async updateQuestion(
        questionId: string,
        updateModel: QuestionInputDto,
        statusCode: number = HttpStatus.NO_CONTENT
    ): Promise<void> {
        const response = await request(this.app.getHttpServer())
            .put(`/sa/quiz/questions/${questionId}`)
            .send(updateModel)
            .auth('admin', 'qwerty')
            .expect(statusCode);

        return;
    }

    async publishQuestion(
        questionId: string,
        publishModel: PublishInputDto,
        statusCode: number = HttpStatus.NO_CONTENT
    ): Promise<void> {
        const response = await request(this.app.getHttpServer())
            .put(`/sa/quiz/questions/${questionId}/publish`)
            .send(publishModel)
            .auth('admin', 'qwerty')
            .expect(statusCode);

        return;
    }

    async createSeveralQuestions(count: number): Promise<QuestionViewDto[]> {
        const questionsPromises = [] as Promise<QuestionViewDto>[];

        for (let i = 0; i < count; ++i) {
            //await delay(50);
            const response = this.createQuestion({
                body: `test question` + i,
                correctAnswers: [`correct answer${i}`, `alternative correct answer`]
            });
            questionsPromises.push(response);
        }

        return Promise.all(questionsPromises);
    }

    async createAndPublishSeveralQuestions(count: number): Promise<void[]> {
        const questions = await this.createSeveralQuestions(count);
        const dto: PublishInputDto = { published: true };
        const publishPromises = questions.map((question: QuestionViewDto) => this.publishQuestion(question.id, dto));

        return await Promise.all(publishPromises);
    }

    async playSeveralGames(count: number, tokens: any[]): Promise<void> {
        for (let j = 0; j < count; j++) {
            const { body: responseBody } = (await request(this.app.getHttpServer())
                .post('/pair-game-quiz/pairs/connection')
                .auth(tokens[0].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: GameViewDto };

            expect(responseBody.status).toEqual('PendingSecondPlayer');

            const { body: responseBody2 } = (await request(this.app.getHttpServer())
                .post('/pair-game-quiz/pairs/connection')
                .auth(tokens[1].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: GameViewDto };

            expect(responseBody2.status).toEqual('Active');

            const gameId = responseBody2.id;

            for (let i = 0; i < 5; i++) {
                // Играем - используем псевдо рандомные ответы для чистоты эксперимента
                const { body: responseBodyg1 } = (await request(this.app.getHttpServer())
                    .post('/pair-game-quiz/pairs/my-current/answers')
                    .send({ answer: `correct answer${Math.floor(Math.random() * 5)}` })
                    .auth(tokens[0].accessToken, { type: 'bearer' })
                    .expect(HttpStatus.OK)) as { body: AnswerViewDto };

                expect(responseBodyg1.answerStatus).toBeDefined();
                expect(responseBodyg1.questionId).toBeDefined();

                const { body: currentGame } = (await request(this.app.getHttpServer())
                    .get('/pair-game-quiz/pairs/my-current')
                    .auth(tokens[0].accessToken, { type: 'bearer' })
                    .expect(HttpStatus.OK)) as { body: GameViewDto };

                expect(currentGame.questions).not.toBe(null);
                if (currentGame.questions) {
                    expect(currentGame.questions.some((x) => x.id == responseBodyg1.questionId)).toBeTruthy();
                }

                const { body: responseBodyg2 } = (await request(this.app.getHttpServer())
                    .post('/pair-game-quiz/pairs/my-current/answers')
                    .send({ answer: `alternative correct answer${Math.floor(Math.random() * 5)}` })
                    .auth(tokens[1].accessToken, { type: 'bearer' })
                    .expect(HttpStatus.OK)) as { body: AnswerViewDto };

                expect(responseBodyg2.answerStatus).toBeDefined();
                expect(responseBodyg2.questionId).toBeDefined();
            }

            const { body: finalResponse } = (await request(this.app.getHttpServer()) //Получаем игру по id, проверяем, что она закончена
                .get(`/pair-game-quiz/pairs/${gameId}`)
                .auth(tokens[0].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: GameViewDto };

            expect(finalResponse.status).toEqual('Finished');
            expect(finalResponse.finishGameDate !== 'null').toBeTruthy();
        }

        return;
    }

    async calculateStatistics(count: number, token: any): Promise<UserStatisticsViewDto> {
        const { body: result } = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my`)
            .auth(token.accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

        const dto: UserStatisticsViewDto = {
            sumScore: 0,
            avgScores: 0,
            gamesCount: 0,
            winsCount: 0,
            lossesCount: 0,
            drawsCount: 0
        };

        for (let i = 0; i < count; i++) {
            dto.sumScore += result.items[i].firstPlayerProgress.score;
            switch (true) {
                case result.items[i].firstPlayerProgress.score > result.items[i].secondPlayerProgress.score:
                    dto.winsCount++;
                    break;
                case result.items[i].firstPlayerProgress.score < result.items[i].secondPlayerProgress.score:
                    console.log(result.items[i].firstPlayerProgress.score, result.items[i].secondPlayerProgress.score);
                    dto.lossesCount++;
                    break;
                default:
                    dto.drawsCount++;
            }
            dto.gamesCount = result.items.length;
            dto.avgScores =
                (Math.round((dto.sumScore / dto.gamesCount + Number.EPSILON) * 100) / 100) %
                    Math.trunc(dto.sumScore / dto.gamesCount) ==
                0
                    ? Math.trunc(dto.sumScore / dto.gamesCount)
                    : Math.round((dto.sumScore / dto.gamesCount + Number.EPSILON) * 100) / 100;
        }

        return dto;
    }

    async playSeveralGamesBySeveralUsers(gamesCount: number, gamesPerPair: number, tokens: any[]): Promise<Set<any>> {
        //NOTE! tokens.length MUST BE EVEN
        const players = new Set();
        for (let i = 0; i < gamesCount; i++) {
            const playersPair: any[] = [
                tokens[Math.floor(Math.random() * ((tokens.length - 1) / 2))],
                tokens[tokens.length - 1 - Math.floor(Math.random() * ((tokens.length - 1) / 2))]
            ];
            players.add(playersPair[0]);
            players.add(playersPair[1]);
            try {
                await this.playSeveralGames(gamesPerPair, playersPair);
            } catch (e) {
                console.error(e);
            }
        }
        return players;
    }

    async getStatisticsForUser(token: any): Promise<UserStatisticsViewDto> {
        const { body: result } = await request(this.app.getHttpServer())
            .get(`/pair-game-quiz/users/my-statistic`)
            .auth(token, { type: 'bearer' })
            .expect(HttpStatus.OK);

        return result;
    }

    sortTopUsersStats(
        players: UserStatisticsViewDto[],
        sort: Partial<TopUsersSortBy>,
        skip: number = 0,
        limit: number = 10
    ): UserStatisticsViewDto[] {
        return [...players]
            .sort((a, b) => {
                for (const [key, value] of Object.entries(sort)) {
                    const tieDiff = b[key] - a[key];
                    if (tieDiff !== 0) {
                        return value === SortDirection.Desc ? tieDiff : -tieDiff;
                    }
                }

                return 0;
            })
            .slice(skip, limit);
    }
}
