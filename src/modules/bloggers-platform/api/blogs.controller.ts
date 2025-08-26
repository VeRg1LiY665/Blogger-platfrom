import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdQuery } from '../application/queries/blogs/public/get-blog-by-id.query';
import { GetAllBlogsQuery } from '../application/queries/blogs/public/get-all-blogs.query';
import { GetPostsForBlogQuery } from '../application/queries/posts/public/get-posts-for-blog.query';
import { UUIDValidationPipe } from '../../../core/pipes/uuid-validation-pipe.service';

@Controller('blogs') //TODO SWAGGER
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
    async getBlogByID(@Param('id', UUIDValidationPipe) id: string): Promise<BlogViewDto> {
        return await this.queryBus.execute<GetBlogByIdQuery>(new GetBlogByIdQuery(id));
    }

    @Get(':id/posts')
    @UseGuards(JwtOptionalAuthGuard)
    async getBlogPosts(
        @Param('id', UUIDValidationPipe) id: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
        @Query() query: GetPostsQueryParams
    ) {
        return await this.queryBus.execute<GetPostsForBlogQuery>(
            new GetPostsForBlogQuery(id, query, user ? user.id : undefined)
        );
    }
}
