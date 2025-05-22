import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
//import { DatabaseModule } from './database/database.modules';  //кастомный модуль подключения к монго

@Module({
    imports: [MongooseModule.forRoot('mongodb://localhost:27017/blogs-platform'), BloggersPlatformModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
