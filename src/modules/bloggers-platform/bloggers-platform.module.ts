import { Module } from '@nestjs/common';
import { BlogsSaController } from './api/blogs.sa.controller';
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
import { BlogsExtQRepository } from './infrastructure/external-query/blogs.external-query-repository';
import { UsersExtQRepository } from '../user-accounts/infrastructure/external-query/users.external-query-repository';
import { User, UserSchema } from '../user-accounts/domain/user.entity';
import { LikesService } from './application/likes.service';
import { LikesRepo } from './infrastructure/likes.repository';
import { Like, LikeSchema } from './domain/like.entity';
import { CreateBlogUseCase } from './application/usecases/blogs/create-blog.usecase';
import { UpdateBlogUseCase } from './application/usecases/blogs/update-blog.usecase';
import { DeleteBlogUseCase } from './application/usecases/blogs/delete-blog.usecase';
import { DatabaseModule } from '../../database/database.modules';
import { BlogsSqlRepository } from './infrastructure/blogs-sql.repository';
import { BlogsSqlQueryRepository } from './infrastructure/blogs.sql.query-repository';
import { GetBlogByIdQueryHandler } from './application/queries/blogs/public/get-blog-by-id.query';
import { GetAllBlogsQueryHandler } from './application/queries/blogs/public/get-all-blogs.query';
import { DeletePostForBlogUseCase } from './application/usecases/posts/delete-post-for-blog.usecase';
import { CreatePostUseCase } from './application/usecases/posts/create-post.usecase';
import { CreateBlogPostUseCase } from './application/usecases/posts/create-post-for-blog.usecase';
import { UpdateBlogPostUseCase } from './application/usecases/posts/update-post-for-blog.usecase';
import { GetPostByIdQueryHandler } from './application/queries/posts/public/get-post-by-id.query';
import { PostsSqlRepository } from './infrastructure/posts.sql.repository';
import { PostsSqlQueryRepository } from './infrastructure/posts.sql.query-repository';
import { GetPostsForBlogQueryHandler } from './application/queries/posts/public/get-posts-for-blog.query';
import { BlogsController } from './api/blogs.controller';
import { GetAllPostsQueryHandler } from './application/queries/posts/public/get-all-posts.query';

const commandHandlers = [
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostUseCase,
    CreateBlogPostUseCase,
    UpdateBlogPostUseCase,
    DeletePostForBlogUseCase
];
const queryHandlers = [
    GetBlogByIdQueryHandler,
    GetAllBlogsQueryHandler,
    GetPostByIdQueryHandler,
    GetPostsForBlogQueryHandler,
    GetAllPostsQueryHandler
];
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Blog.name, schema: BlogSchema },
            { name: Post.name, schema: PostSchema },
            { name: Comment.name, schema: CommentSchema },
            { name: User.name, schema: UserSchema },
            { name: Like.name, schema: LikeSchema }
        ]),
        DatabaseModule
    ],
    controllers: [BlogsSaController, BlogsController, PostsController, CommentsController],
    providers: [
        BlogsService,
        BlogsRepository,
        BlogsSqlRepository,
        BlogsQRepository,
        BlogsSqlQueryRepository,
        BlogsExtQRepository,
        PostsService,
        PostsRepository,
        PostsSqlRepository,
        PostsQRepository,
        PostsSqlQueryRepository,
        CommentsService,
        CommentsRepository,
        CommentsQRepository,
        LikesService,
        LikesRepo,
        UsersExtQRepository,
        ...commandHandlers,
        ...queryHandlers
    ]
})
export class BloggersPlatformModule {}
