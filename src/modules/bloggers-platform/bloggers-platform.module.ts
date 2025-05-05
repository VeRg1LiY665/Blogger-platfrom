import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQRepository } from './infrastructure/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';

@Module({
    imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
    controllers: [BlogsController],
    providers: [BlogsService, BlogsRepository, BlogsQRepository]
})
export class BloggersPlatformModule {}
