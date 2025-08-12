import { Controller, Delete, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Pool } from 'pg';

@Controller('testing')
export class TestingController {
    constructor(
        @InjectConnection() private readonly databaseConnection: Connection,
        @Inject('PG_POOL') private readonly pool: Pool
    ) {}

    @Delete('all-data')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAll() {
        const collections = await this.databaseConnection.listCollections();

        const mongoPromises = collections.map((collection) =>
            this.databaseConnection.collection(collection.name).deleteMany({})
        );
        await Promise.all(mongoPromises);

        await this.pool.query('TRUNCATE TABLE "users" CASCADE'); //TODO add auto aggregation for tables
        await this.pool.query('TRUNCATE TABLE "blogs" CASCADE');
        await this.pool.query('TRUNCATE TABLE "posts" CASCADE');
        await this.pool.query('TRUNCATE TABLE "comments" CASCADE');
        await this.pool.query('TRUNCATE TABLE "likes" CASCADE');

        return {
            status: 'succeeded'
        };
    }
}
