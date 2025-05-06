import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQRepository } from './infrastructure/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
    controllers: [BlogsController, PostsController],
    providers: [BlogsService, BlogsRepository, BlogsQRepository, PostsService]
})
export class BloggersPlatformModule {}
