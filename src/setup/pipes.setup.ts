import { INestApplication, ValidationPipe } from '@nestjs/common';

export function pipesSetup(app: INestApplication) {
    //Глобальный пайп для валидации и трансформации входящих данных.
    //На следующем занятии рассмотрим подробнее
    app.useGlobalPipes(
        new ValidationPipe({
            //class-transformer создает экземпляр input-dto
            //соответственно применятся значения по-умолчанию
            //и методы классов input-dto
            transform: true
        })
    );
}
