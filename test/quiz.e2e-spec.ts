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

describe('quiz-game', () => {
    let app: INestApplication;
    let httpServer: any;
    let quizGameTestManager: QuizGameTestManager;
    let userTestManager: UsersTestManager;

    beforeAll(async () => {
        const result = await initSettings((moduleBuilder) =>
            moduleBuilder.overrideProvider(JwtService).useValue(
                //Оно не работает если переопределять пропсы в момент вызова методов провайдера
                new JwtService({
                    signOptions: { expiresIn: '5m' }
                })
            )
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
            updatedAt: expect.any(String)
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
            updatedAt: expect.any(String)
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
});
