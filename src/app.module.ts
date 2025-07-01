import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { UsersAccountsModule } from './modules/user-accounts/user-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from './core/exceptions/domain-exception.filter';
import { AllHttpExceptionsFilter } from './core/exceptions/base-exception.filter';
import { MongooseErrorExceptionFilter } from './core/exceptions/mongoose-error-exception.filter';
import { CoreModule } from './core/core.module';

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
        CoreModule,
        BloggersPlatformModule,
        UsersAccountsModule,
        TestingModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: AllHttpExceptionsFilter
        },
        {
            provide: APP_FILTER,
            useClass: MongooseErrorExceptionFilter
        },
        {
            provide: APP_FILTER,
            useClass: DomainHttpExceptionsFilter
        }
    ]
})
export class AppModule {}
