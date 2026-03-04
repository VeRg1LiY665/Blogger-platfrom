import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuestionInputDto } from '../../src/modules/quiz-game/api/input-dto/question.input-dto';
import { QuestionViewDto } from '../../src/modules/quiz-game/api/view-dto/questions.view-dto';
import { PublishInputDto } from '../../src/modules/quiz-game/api/input-dto/publish.input-dto';
import { GameViewDto } from '../../src/modules/quiz-game/api/view-dto/game.view-dto';
import { AnswerViewDto } from '../../src/modules/quiz-game/api/view-dto/answer.view-dto';

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
}
