import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import cookieParser from 'cookie-parser';
import { initAppModule } from '../init-app-module';
import { CoreConfig } from './core/core.config';

async function bootstrap(): Promise<void> {
    const DynamicAppModule = await initAppModule();
    // создаём на основе донастроенного модуля наше приложение
    const app = await NestFactory.create(DynamicAppModule);

    const coreConfig = app.get<CoreConfig>(CoreConfig);

    appSetup(app, coreConfig.isSwaggerEnabled); //глобальные настройки приложения

    const port = coreConfig.port;

    app.use(cookieParser());

    //appSetup(app);

    await app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
}
bootstrap();
