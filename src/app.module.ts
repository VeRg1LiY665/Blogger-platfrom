import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { UsersAccountsModule } from './modules/user-accounts/user-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';

//import { DatabaseModule } from './database/database.modules';  //кастомный модуль подключения к монго

@Module({
    imports: [
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 10000,
                    limit: 5
                }
            ]
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/blogs-platform'),
        BloggersPlatformModule,
        UsersAccountsModule,
        TestingModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
