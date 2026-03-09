import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { JwtService } from '@nestjs/jwt';
import { QuizGameTestManager } from './helpers/quiz-game-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { QuestionInputDto } from '../src/modules/quiz-game/api/input-dto/question.input-dto';
import { QuestionViewDto } from '../src/modules/quiz-game/api/view-dto/questions.view-dto';
import { GameViewDto } from '../src/modules/quiz-game/api/view-dto/game.view-dto';
import { AnswerViewDto } from '../src/modules/quiz-game/api/view-dto/answer.view-dto';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user-accounts/constants/auth-tokens.inject-constants';
import { UserAccountsConfig } from '../src/modules/user-accounts/config/user-accounts.config';

describe('quiz-game', () => {
    let app: INestApplication;
    let httpServer: any;
    let quizGameTestManager: QuizGameTestManager;
    let userTestManager: UsersTestManager;

    beforeAll(async () => {
        const result = await initSettings((moduleBuilder) =>
            moduleBuilder.overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN).useFactory({
                factory: (userAccountsConfig: UserAccountsConfig) => {
                    return new JwtService({
                        secret: userAccountsConfig.accessTokenSecret,
                        signOptions: { expiresIn: '20s' }
                    });
                },
                inject: [UserAccountsConfig]
            })
        );
        app = result.app;
        quizGameTestManager = result.quizTestManager;
        userTestManager = result.userTestManger;
        httpServer = result.httpServer;

        await deleteAllData(app);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await deleteAllData(app);
    });

    it('should create question', async () => {
        const inputDto: QuestionInputDto = {
            body: 'test question',
            correctAnswers: ['correctAnswer1', 'correctAnswer2']
        };

        const response = await quizGameTestManager.createQuestion(inputDto);
        //  console.log(response);
        expect(response).toEqual({
            body: inputDto.body,
            correctAnswers: inputDto.correctAnswers,
            id: expect.any(String),
            published: false,
            createdAt: expect.any(String),
            updatedAt: null
        });
    });

    it('should update question', async () => {
        const inputDto: QuestionInputDto = {
            body: 'test question',
            correctAnswers: ['correctAnswer1', 'correctAnswer2']
        };

        const response = await quizGameTestManager.createQuestion(inputDto);

        expect(response).toEqual({
            body: inputDto.body,
            correctAnswers: inputDto.correctAnswers,
            id: expect.any(String),
            published: false,
            createdAt: expect.any(String),
            updatedAt: null
        });

        inputDto.body = 'updated test question';
        await quizGameTestManager.updateQuestion(response.id, inputDto);

        const { body: updResponse } = (await request(httpServer)
            .get(`/sa/quiz/questions`)
            .auth('admin', 'qwerty')
            .expect(HttpStatus.OK)) as { body: PaginatedViewDto<QuestionViewDto[]> };

        expect(updResponse.items[0]).toEqual({
            body: inputDto.body,
            correctAnswers: inputDto.correctAnswers,
            id: expect.any(String),
            published: false,
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });
    });

    it('should create several questions and publish them', async () => {
        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .get(`/sa/quiz/questions?pageNumber=2&sortDirection=asc`)
            .auth('admin', 'qwerty')
            .expect(HttpStatus.OK)) as { body: PaginatedViewDto<QuestionViewDto[]> };

        expect(responseBody.totalCount).toBe(15);
        expect(responseBody.items).toHaveLength(5);
        expect(responseBody.pagesCount).toBe(2);

        expect(responseBody.items[0].published).toBe(true);
    });

    it('should delete question', async () => {
        const inputDto: QuestionInputDto = {
            body: 'test question',
            correctAnswers: ['correctAnswer1', 'correctAnswer2']
        };

        const response = await quizGameTestManager.createQuestion(inputDto);

        await request(app.getHttpServer())
            .delete(`/sa/quiz/questions/${response.id}`)
            .auth('admin', 'qwerty')
            .expect(HttpStatus.NO_CONTENT);

        await request(app.getHttpServer())
            .delete(`/sa/quiz/questions/${response.id}`)
            .auth('admin', 'qwerty')
            .expect(HttpStatus.NOT_FOUND);
    });

    it('should create new game', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');
        expect(responseBody.secondPlayerProgress).toEqual(null);
        expect(responseBody.questions).toEqual(null);
    });

    it('should connect user to existing game', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');

        const { body: responseBody2 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[1].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody2.status).toEqual('Active');
        expect(responseBody.id).toEqual(responseBody2.id);
    });

    it('should return active game for current user', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');

        const { body: responseBody2 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[1].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody2.status).toEqual('Active');

        const { body: responseBody3 } = (await request(app.getHttpServer())
            .get('/pair-game-quiz/pairs/my-current')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody3).toEqual(responseBody2);
    });

    it('should reject connection if an active game exists', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');

        const { body: responseBody2 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[1].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody2.status).toEqual('Active');

        await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);
    });

    it('should play game with 2 players', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');

        const { body: responseBody2 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[1].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody2.status).toEqual('Active'); //Игру создали и убедились, что она активна

        const gameId = responseBody2.id;

        for (let i = 0; i < 5; i++) {
            // Играем - используем псевдо рандомные ответы для чистоты эксперимента
            const { body: responseBodyg1 } = (await request(app.getHttpServer())
                .post('/pair-game-quiz/pairs/my-current/answers')
                .send({ answer: `correct answer${Math.floor(Math.random() * 15)}` })
                .auth(tokens[0].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: AnswerViewDto };

            expect(responseBodyg1.answerStatus).toBeDefined();
            expect(responseBodyg1.questionId).toBeDefined();

            const { body: currentGame } = (await request(app.getHttpServer())
                .get('/pair-game-quiz/pairs/my-current')
                .auth(tokens[0].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: GameViewDto };

            expect(currentGame.questions).not.toBe(null);
            if (currentGame.questions) {
                expect(currentGame.questions.some((x) => x.id == responseBodyg1.questionId)).toBeTruthy();
            }

            const { body: responseBodyg2 } = (await request(app.getHttpServer())
                .post('/pair-game-quiz/pairs/my-current/answers')
                .send({ answer: `alternative correct answer${Math.floor(Math.random() * 15)}` })
                .auth(tokens[1].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: AnswerViewDto };

            expect(responseBodyg2.answerStatus).toBeDefined();
            expect(responseBodyg2.questionId).toBeDefined();
        }

        const { body: finalResponse } = (await request(app.getHttpServer()) //Получаем игру по id, проверяем, что она закончена
            .get(`/pair-game-quiz/pairs/${gameId}`)
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(finalResponse.status).toEqual('Finished');
        expect(finalResponse.finishGameDate !== 'null').toBeTruthy();
    });

    it('should send 2 correct and 2 incorrect answer for the game', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(15);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');
        expect(responseBody.questions).toBe(null);

        const { body: responseBody2 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[1].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody2.status).toEqual('Active'); //Игру создали и убедились, что она активна
        expect(responseBody2.questions).not.toBe(null);
        const gameId = responseBody2.id;
        //const gameQuestions = responseBody2.questions;

        for (let i = 0; i < 2; i++) {
            const { body: responseBodyg1 } = (await request(app.getHttpServer())
                .post('/pair-game-quiz/pairs/my-current/answers')
                .send({ answer: `alternative correct answer` })
                .auth(tokens[0].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: AnswerViewDto };

            expect(responseBodyg1.answerStatus).toBeDefined();
            expect(responseBodyg1.questionId).toBeDefined();

            const { body: currentGame } = (await request(app.getHttpServer())
                .get('/pair-game-quiz/pairs/my-current')
                .auth(tokens[0].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: GameViewDto };

            expect(currentGame.questions).not.toBe(null);

            const { body: responseBodyg2 } = (await request(app.getHttpServer())
                .post('/pair-game-quiz/pairs/my-current/answers')
                .send({ answer: `incorrect answer` })
                .auth(tokens[1].accessToken, { type: 'bearer' })
                .expect(HttpStatus.OK)) as { body: AnswerViewDto };

            expect(responseBodyg2.answerStatus).toBeDefined();
            expect(responseBodyg2.questionId).toBeDefined();
        }

        const { body: finalResponse } = (await request(app.getHttpServer()) //Получаем игру по id
            .get(`/pair-game-quiz/pairs/${gameId}`)
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(finalResponse.firstPlayerProgress.score).toEqual(2);
        // @ts-ignore
        expect(finalResponse.secondPlayerProgress.score).toEqual(0);
    });

    it('should play 1 game for player, then create 1 pending game, then call /my', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(5);

        await quizGameTestManager.playSeveralGames(3, tokens);

        const { body: responseBody3 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody3.status).toEqual('PendingSecondPlayer');

        const { body: result } = await request(app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my`)
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK);
    });

    it('should play 2 games for player, then create 1 pending game, then call /my (pageNumber = 2, pageSize = 2)', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(5);

        await quizGameTestManager.playSeveralGames(2, tokens);

        const { body: responseBody } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody.status).toEqual('PendingSecondPlayer');

        const { body: result } = await request(app.getHttpServer())
            .get(`/pair-game-quiz/pairs/my?pageNumber=2&pageSize=2`)
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

        expect(result.items.length).toBe(1);
        expect(result.items[0].status).toEqual('Finished');
    });

    it('should play 3 games for player, then call /my-statistic', async () => {
        const gamesAmount = 3; //Set up how many games we play

        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(5);

        await quizGameTestManager.playSeveralGames(gamesAmount, tokens);

        const stats = await quizGameTestManager.calculateStatistics(gamesAmount, {
            accessToken: tokens[0].accessToken
        });

        const { body: result } = await request(app.getHttpServer())
            .get('/pair-game-quiz/users/my-statistic')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

        expect(result.sumScore).toEqual(stats.sumScore);
        expect(result.avgScores).toEqual(stats.avgScores);
        expect(result.gamesCount).toEqual(stats.gamesCount);
        expect(result.winsCount).toEqual(stats.winsCount);
        expect(result.lossesCount).toEqual(stats.lossesCount);
        expect(result.drawsCount).toEqual(stats.drawsCount);
    });

    it('should call /my-statistic with 0 played games', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        const { body: result } = await request(app.getHttpServer())
            .get('/pair-game-quiz/users/my-statistic')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

        expect(result.sumScore).toEqual(0);
        expect(result.avgScores).toEqual(0);
        expect(result.gamesCount).toEqual(0);
        expect(result.winsCount).toEqual(0);
        expect(result.lossesCount).toEqual(0);
        expect(result.drawsCount).toEqual(0);
    });

    it('should call /my-statistic with 0 finished games, 1 pending', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(2);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();

        await quizGameTestManager.createAndPublishSeveralQuestions(5);

        const { body: responseBody3 } = (await request(app.getHttpServer())
            .post('/pair-game-quiz/pairs/connection')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)) as { body: GameViewDto };

        expect(responseBody3.status).toEqual('PendingSecondPlayer');

        const { body: result } = await request(app.getHttpServer())
            .get('/pair-game-quiz/users/my-statistic')
            .auth(tokens[0].accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

        expect(result.sumScore).toEqual(0);
        expect(result.avgScores).toEqual(0);
        expect(result.gamesCount).toEqual(0);
        expect(result.winsCount).toEqual(0);
        expect(result.lossesCount).toEqual(0);
        expect(result.drawsCount).toEqual(0);
    });
});
