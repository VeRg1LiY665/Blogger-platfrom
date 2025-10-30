import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { UsersTestManager } from './users-test-manager';
import { deleteAllData } from './delete-all-data';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { initAppModule } from '../../init-app-module';
import { CoreConfig } from '../../src/core/core.config';
import { DataSource } from 'typeorm';
import { QuizGameTestManager } from './quiz-game-test-manager';

export const initSettings = async (
    //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
    addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void
) => {
    const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
        imports: [AppModule]
    })
        .overrideProvider(EmailService)
        .useClass(EmailServiceMock);

    if (addSettingsToModuleBuilder) {
        addSettingsToModuleBuilder(testingModuleBuilder);
    }

    const testingAppModule = await testingModuleBuilder.compile();

    const app = testingAppModule.createNestApplication();
    const coreConfig = app.get<CoreConfig>(CoreConfig);

    appSetup(app, coreConfig.isSwaggerEnabled);

    await app.init();

    const databaseConnection = app.get<DataSource>(DataSource);
    const httpServer = app.getHttpServer();
    const userTestManger = new UsersTestManager(app);
    const quizTestManager = new QuizGameTestManager(app);

    await deleteAllData(app);

    return {
        app,
        databaseConnection,
        httpServer,
        userTestManger,
        quizTestManager
    };
};
