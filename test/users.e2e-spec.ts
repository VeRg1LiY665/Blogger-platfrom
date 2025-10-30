import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { CreateUserDto } from '../src/modules/user-accounts/dto/create-user.dto';
import { deleteAllData } from './helpers/delete-all-data';
import { PaginatedViewDto } from '../src/core/dto/base.paginated.view-dto';
import { MeViewDto, UserViewDto } from '../src/modules/user-accounts/api/view-dto/users-view.dto';
import { delay } from './helpers/delay';
import { EmailService } from '../src/modules/notifications/email.service';
import { JwtService } from '@nestjs/jwt';

describe('users', () => {
    let app: INestApplication;
    let userTestManager: UsersTestManager;

    beforeAll(async () => {
        const result = await initSettings((moduleBuilder) =>
            moduleBuilder.overrideProvider(JwtService).useValue(
                //Оно не работает если переопределять пропсы в момент вызова методов провайдера
                new JwtService({
                    signOptions: { expiresIn: '2s' }
                })
            )
        );
        app = result.app;
        userTestManager = result.userTestManger;
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await deleteAllData(app);
    });

    it('should create user', async () => {
        const body: CreateUserDto = {
            login: 'name1',
            password: 'qwerty',
            email: 'email@email.com'
        };

        const response = await userTestManager.createUser(body);

        expect(response).toEqual({
            login: body.login,
            email: body.email,
            id: expect.any(String),
            createdAt: expect.any(String)
        });
    });

    it('should get users with paging', async () => {
        const users = await userTestManager.createSeveralUsers(12);
        const { body: responseBody } = (await request(app.getHttpServer())
            .get(`/sa/users?pageNumber=2&sortDirection=asc`)
            .auth('admin', 'qwerty')
            .expect(HttpStatus.OK)) as { body: PaginatedViewDto<UserViewDto> };

        expect(responseBody.totalCount).toBe(12);
        expect(responseBody.items).toHaveLength(2);
        expect(responseBody.pagesCount).toBe(2);
        //asc sorting
        expect(responseBody.items[1]).toEqual(users[users.length - 1]);
        //etc...
    });

    it('should login user and get refresh and access token', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        expect(tokens[0].accessToken).toBeDefined();
        expect(tokens[0].refreshToken).toBeDefined();
    });

    it('should return users info while "me" request with correct accessTokens', async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        const response = await userTestManager.me(tokens[0].accessToken);

        expect(response).toEqual({
            login: expect.anything(),
            userId: expect.anything(),
            email: expect.anything()
        } as MeViewDto);
    });

    it(`shouldn't return users info while "me" request if accessTokens expired`, async () => {
        const tokens = await userTestManager.createAndLoginSeveralUsers(1);

        await delay(2000);

        await userTestManager.me(tokens[0].accessToken, HttpStatus.UNAUTHORIZED);
    });

    it(`should register user without really send email`, async () => {
        await request(app.getHttpServer())
            .post(`/auth/registration`)
            .send({
                email: 'email@email.em',
                password: '123123123',
                login: 'login123'
            } as CreateUserDto)
            .expect(HttpStatus.NO_CONTENT);
    });

    it(`should call email sending method while registration`, async () => {
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
    });
});
