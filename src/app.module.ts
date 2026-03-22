import { configModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { UsersAccountsModule } from './modules/user-accounts/user-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER } from '@nestjs/core';
import { DomainHttpExceptionsFilter } from './core/exceptions/domain-exception.filter';
import { AllHttpExceptionsFilter } from './core/exceptions/base-exception.filter';
import { MongooseErrorExceptionFilter } from './core/exceptions/mongoose-error-exception.filter';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { DatabaseModule } from './database/database.modules';
import { QuizGameModule } from './modules/quiz-game/quiz-game.module';
import { BullModule } from '@nestjs/bullmq';
import { BullmqModule } from './modules/bullmq/bullmq.module'; //кастомный модуль подключения к монго или postgres

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
        DatabaseModule,
        BullmqModule,
        CoreModule,
        BloggersPlatformModule,
        UsersAccountsModule,
        QuizGameModule,
        TestingModule,
        configModule
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
export class AppModule {
    static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
        // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
        // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
        // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

        return {
            module: AppModule,
            imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])] // Add dynamic modules here
        };
    }
}
