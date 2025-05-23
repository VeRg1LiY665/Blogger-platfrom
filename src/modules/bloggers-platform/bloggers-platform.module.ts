import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQRepository } from './infrastructure/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './domain/blog.entity';
import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { Post, PostSchema } from './domain/post.entity';
import { Comment, CommentSchema } from './domain/comment.entity';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQRepository } from './infrastructure/posts.query-repository';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsQRepository } from './infrastructure/comments.query-repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Blog.name, schema: BlogSchema },
            { name: Post.name, schema: PostSchema },
            { name: Comment.name, schema: CommentSchema }
        ])
    ],
    controllers: [BlogsController, PostsController, CommentsController],
    providers: [
        BlogsService,
        BlogsRepository,
        BlogsQRepository,
        PostsService,
        PostsRepository,
        PostsQRepository,
        CommentsService,
        CommentsRepository,
        CommentsQRepository
    ]
})
export class BloggersPlatformModule {}
