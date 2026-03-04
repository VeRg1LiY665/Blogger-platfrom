import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuestionInputDto } from '../../src/modules/quiz-game/api/input-dto/question.input-dto';
import { QuestionViewDto } from '../../src/modules/quiz-game/api/view-dto/questions.view-dto';
import { PublishInputDto } from '../../src/modules/quiz-game/api/input-dto/publish.input-dto';

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

    async playSeveralGames(count: number): Promise<void[]> {}
}
