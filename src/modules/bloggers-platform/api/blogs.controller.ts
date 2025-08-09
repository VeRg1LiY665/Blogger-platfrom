import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params';
import { CreateBlogPostDto } from '../dto/create-post.dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { BlogsInputUpdateDto } from './input-dto/blogs.input-update-dto';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteBlogCommand } from '../application/usecases/blogs/delete-blog.usecase';
import { CreateBlogCommand } from '../application/usecases/blogs/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/blogs/update-blog.usecase';
import { GetBlogByIdQuery } from '../application/queries/blogs/get-blog-by-id.query';
import { GetAllBlogsQuery } from '../application/queries/blogs/get-all-blogs.query';
import { CreatePostForBlogCommand } from '../application/usecases/posts/create-post-for-blog.usecase';
import { GetPostByIdQuery } from '../application/queries/posts/get-post-by-id.query';
import { UpdateBlogPostCommand } from '../application/usecases/posts/update-post-for-blog.usecase';
import { GetPostsForBlogQuery } from '../application/queries/posts/get-posts-for-blog.query';
import { UpdateBlogPostDto } from '../dto/update-blog-post.dto';
import {
    DeletePostForBlogCommand,
    DeletePostForBlogUseCase
} from '../application/usecases/posts/delete-post-for-blog.usecase';

@Controller('blogs')
export class BlogsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @Get()
    async getBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
        return await this.queryBus.execute<GetAllBlogsQuery>(new GetAllBlogsQuery(query));
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Get(':id')
    async getBlogByID(@Param('id') id: string): Promise<BlogViewDto> {
        return await this.queryBus.execute<GetBlogByIdQuery>(new GetBlogByIdQuery(id));
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        return await this.commandBus.execute<DeleteBlogCommand, void>(new DeleteBlogCommand(id));
    }

    @Post()
    @UseGuards(BasicAuthGuard)
    async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
        const newBlogId = await this.commandBus.execute<CreateBlogCommand, number>(new CreateBlogCommand(body));
        return await this.queryBus.execute<GetBlogByIdQuery>(new GetBlogByIdQuery(newBlogId.toString()));
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async updateBlog(@Param('id') id: string, @Body() body: BlogsInputUpdateDto): Promise<void> {
        const dto = { id: id, ...body };
        await this.commandBus.execute<UpdateBlogCommand, string>(new UpdateBlogCommand(dto));
        return;
    }

    @Get(':id/posts')
    @UseGuards(JwtOptionalAuthGuard)
    async getBlogPosts(
        @Param('id') id: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
        @Query() query: GetPostsQueryParams
    ) {
        const dto = {
            blogId: id,
            query: query
            //userId: user ? user.id : undefined
        };
        return await this.queryBus.execute<GetPostsForBlogQuery>(new GetPostsForBlogQuery(id, query));
    }

    @Post(':id/posts')
    @UseGuards(BasicAuthGuard)
    async createPostForBlog(@Param('id') id: string, @Body() body: CreateBlogPostDto): Promise<PostViewDto> {
        const postId = await this.commandBus.execute<CreatePostForBlogCommand, string>(
            new CreatePostForBlogCommand(id, body)
        );
        return await this.queryBus.execute<GetPostByIdQuery>(new GetPostByIdQuery(postId));
    }

    @Put(':blogId/posts/:postId')
    @UseGuards(BasicAuthGuard)
    async updatePostForBlog(
        @Param('blogId') blogId: string,
        @Param('postId') postId: string,
        @Body() body: UpdateBlogPostDto
    ): Promise<void> {
        return await this.commandBus.execute<UpdateBlogPostCommand>(new UpdateBlogPostCommand(blogId, postId, body));
    }

    @Delete(':blogId/posts/:postId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async deletePostForBlog(@Param('blogId') blogId: string, @Param('postId') postId: string): Promise<void> {
        return await this.commandBus.execute<DeletePostForBlogCommand>(new DeletePostForBlogCommand(blogId, postId));
    }
}
