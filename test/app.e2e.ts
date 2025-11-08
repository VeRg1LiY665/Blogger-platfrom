import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import * as http from 'node:http';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;

    beforeEach(async () => {
        const result = await initSettings();
        app = result.app;
        httpServer = result.httpServer;
    });

    it('/ (GET)', () => {
        return request(httpServer).get('/').expect(200).expect('Hello World!');
    });
});
