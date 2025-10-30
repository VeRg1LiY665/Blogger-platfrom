import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import { CreateUserDto } from '../src/modules/user-accounts/dto/create-user.dto';
import { deleteAllData } from './helpers/delete-all-data';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { MeViewDto, UserViewDto } from '../src/modules/user-accounts/api/view-dto/users-view.dto';
import { delay } from './helpers/delay';
import { EmailService } from '../src/modules/notifications/email.service';
import { JwtService } from '@nestjs/jwt';
import { QuizGameTestManager } from './helpers/quiz-game-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { QuestionInputDto } from '../src/modules/quiz-game/api/input-dto/question.input-dto';
import { QuestionViewDto } from '../src/modules/quiz-game/api/view-dto/questions.view-dto';
import { GameViewDto } from '../src/modules/quiz-game/api/view-dto/game.view-dto';

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

    /* it('should return users info while "me" request with correct accessTokens', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        const response = await userTestManager.me(tokens[0].accessToken);

        expect(response).toEqual({
            login: expect.anything(),
            userId: expect.anything(),
            email: expect.anything()
        } as MeViewDto);
    });*/

    /* it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        await delay(2000);

        await userTestManager.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
    });*/

    /*it(`should register user without really send email`, async () => {
        await request(app.getHttpServer())
            .post(`/auth/registration`)
            .send({
                email: 'email@email.em',
                password: '123123123',
                login: 'login123'
            } as CreateUserDto)
            .expect(HttpStatus.NO_CONTENT);
    });*/

    /*it(`should call email sending method while registration`, async () => {
        const sendEmailMethod = (app.get(EmailService).sendConfirmationEmail = jest
            .fn()
            .mockImplementation(() => Promise.resolve()));

        await request(app.getHttpServer())
            .post(`/auth/registration`)
            .send({
                email: 'email@email.em',
                password: '123123123',
                login: 'login123'
            } as CreateUserDto)
            .expect(HttpStatus.NO_CONTENT);

        expect(sendEmailMethod).toHaveBeenCalled();
    });*/
});
