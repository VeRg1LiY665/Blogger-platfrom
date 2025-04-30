import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    appSetup(app);

    const PORT = process.env.PORT || 3003;

    await app.listen(PORT, () => {
        console.log('Server is running on port ' + PORT);
    });
}
bootstrap();
