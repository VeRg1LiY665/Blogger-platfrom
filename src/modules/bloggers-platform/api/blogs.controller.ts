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
    UseGuards,
    UsePipes
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { BlogsService } from '../application/blogs.service';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQRepository } from '../infrastructure/blogs.query-repository';
import { UpdateBlogDto } from '../dto/create-blog.dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { PostsService } from '../application/posts.service';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params';
import { CreateBlogPostDto, CreatePostDto } from '../dto/create-post.dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { BlogsInputUpdateDto } from './input-dto/blogs.input-update-dto';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';

@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsServices: BlogsService,
        protected postsService: PostsService,
        protected blogsQRepo: BlogsQRepository
    ) {}

    @Get()
    async getBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
        return await this.blogsQRepo.findAll(query);
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Get(':id')
    @UsePipes(new ObjectIdValidationPipe())
    async getBlogByID(@Param('id') id: string): Promise<BlogViewDto> {
        return await this.blogsQRepo.findById(id);
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Delete(':id')
    @UsePipes(new ObjectIdValidationPipe())
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        return await this.blogsServices.deleteBlog(id);
    }

    @Post()
    @UseGuards(BasicAuthGuard)
    async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
        const newBlogId = await this.blogsServices.createBlog(body);
        return await this.blogsQRepo.findById(newBlogId);
    }

    @Put(':id')
    @UsePipes(new ObjectIdValidationPipe())
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async updateBlog(@Param('id') id: string, @Body() body: BlogsInputUpdateDto): Promise<void> {
        await this.blogsServices.updateBlog(id, body);
        return;
    }

    @Get(':id/posts')
    //@UsePipes(new ObjectIdValidationPipe()) //TODO check if it works
    @UseGuards(JwtOptionalAuthGuard)
    async getBlogPosts(
        @Param('id') id: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
        @Query() query: GetPostsQueryParams
    ) {
        const dto = {
            blogId: id,
            query: query,
            userId: user ? user.id : undefined
        };
        return await this.postsService.findForBlog(dto);
    }

    @Post(':id/posts')
    @UseGuards(BasicAuthGuard)
    async createPostForBlog(@Param('id') id: string, @Body() body: CreateBlogPostDto): Promise<PostViewDto> {
        const postId = await this.postsService.createForBlog(id, body);
        return await this.postsService.findOne({ id: postId });
    }
}
