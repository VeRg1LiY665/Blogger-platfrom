import { Module } from '@nestjs/common';
import { BlogsSaController } from './api/blogs.sa.controller';
import { PostsController } from './api/posts.controller';
import { CommentsController } from './api/comments.controller';
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
import { CommentsSqlRepository } from './infrastructure/comments.sql.repository';
import { CommentsSqlQueryRepository } from './infrastructure/comments.sql.query-repository';
import { LikesSqlRepository } from './infrastructure/likes.sql.repository';
import { CreateReactionForPostUseCase } from './application/usecases/posts/create-reaction-for-post.usecase';
import { CreateReactionForCommentUseCase } from './application/usecases/comments/create-reaction-for-comment.usecase';
import { DeleteCommentUseCase } from './application/usecases/comments/delete-comment-by-id.usecase';
import { UpdateCommentUseCase } from './application/usecases/comments/update-comment.usecase';
import { GetCommentByIdQueryHandler } from './application/queries/comments/get-comment-by-id.query';
import { GetCommentsForPostQueryHandler } from './application/queries/comments/get-comments-for-post.query';
import { CreateCommentForPostUseCase } from './application/usecases/comments/create-comment-for-post.usecase';
import { UsersExtSqlQRepository } from '../user-accounts/infrastructure/external-query/users.external-sql-query-repository';
import { UserAccountsConfig } from '../user-accounts/config/user-accounts.config';

const commandHandlers = [
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostUseCase,
    CreateBlogPostUseCase,
    UpdateBlogPostUseCase,
    DeletePostForBlogUseCase,
    CreateReactionForPostUseCase,
    CreateCommentForPostUseCase,
    CreateReactionForCommentUseCase,
    DeleteCommentUseCase,
    UpdateCommentUseCase
];
const queryHandlers = [
    GetBlogByIdQueryHandler,
    GetAllBlogsQueryHandler,
    GetPostByIdQueryHandler,
    GetPostsForBlogQueryHandler,
    GetAllPostsQueryHandler,
    GetCommentByIdQueryHandler,
    GetCommentsForPostQueryHandler
];
@Module({
    imports: [DatabaseModule],
    controllers: [BlogsSaController, BlogsController, PostsController, CommentsController],
    providers: [
        BlogsSqlRepository,
        BlogsSqlQueryRepository,
        PostsSqlRepository,
        PostsSqlQueryRepository,
        CommentsSqlRepository,
        CommentsSqlQueryRepository,
        LikesSqlRepository,
        UsersExtSqlQRepository,
        ...commandHandlers,
        ...queryHandlers,
        UserAccountsConfig //For basic auth credentials
    ]
})
export class BloggersPlatformModule {}
