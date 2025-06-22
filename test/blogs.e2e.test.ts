import * as request from 'supertest';
import { InputBlogType } from '../src/IO Types/InputBlogType';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DB } from '../src/db/mongoDB';
import { SETTINGS } from '../src/settings';
import { ObjectId } from 'mongodb';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';

describe('/blogs', () => {
    let app: INestApplication<App>;
    let db: any;

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();
        db = new DB(mongoServer.getUri());
        await db.runDB();
    });

    beforeEach(async () => {
        await db.drop();
    });

    afterAll(async () => {
        await db.stop();
    });

    afterAll((done) => {
        done();
    });

    it('should get empty array', async () => {
        const res = await request.get('/blogs').expect(200);

        expect(res.body.items.length).toBe(0);
    });

    it('no auth', async () => {
        const newBlog: InputBlogType = {
            name: 'string',
            description: 'string',
            websiteUrl: 'https://www.validurl.com'
        };

        const res = await request
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog) // отправка данных
            .expect(401);
    });

    it('should create', async () => {
        const newBlog: InputBlogType = {
            name: 'string',
            description: 'string',
            websiteUrl: 'https://www.validurl.com'
        };

        const res = await request
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(newBlog) // отправка данных
            .expect(201);

        expect(res.body.description).toEqual(newBlog.description);
    });

    it('should delete', async () => {
        const newBlog: InputBlogType = {
            name: 'string',
            description: 'string',
            websiteUrl: 'https://www.validurl.com'
        };

        const resp = await request
            .post(SETTINGS.PATH.BLOGS)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .send(newBlog) // отправка данных
            .expect(201);

        const res = await request
            .delete(SETTINGS.PATH.BLOGS + '/' + resp.body.id)
            .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
            .expect(204);
    });

    it("shouldn't find", async () => {
        const res = await request.get(SETTINGS.PATH.BLOGS + '/' + new ObjectId()).expect(404);
    });
});
