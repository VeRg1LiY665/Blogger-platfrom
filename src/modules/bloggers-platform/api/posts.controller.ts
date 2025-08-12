import { Controller, Get, Post, Body, Param, Query, Put, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { LikeInputDto } from './input-dto/likes.input-dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { CreateCommentInputDto } from './input-dto/comment.input-dto';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllPostsQuery } from '../application/queries/posts/public/get-all-posts.query';
import { GetPostByIdQuery } from '../application/queries/posts/public/get-post-by-id.query';
import { CreateReactionForPostCommand } from '../application/usecases/posts/create-reaction-for-post.usecase';
import { GetCommentsForPostQuery } from '../application/queries/comments/get-comments-for-post.query';
import { CreateCommentForPostCommand } from '../application/usecases/comments/create-comment-for-post.usecase';
import { GetCommentByIdQuery } from '../application/queries/comments/get-comment-by-id.query';

@Controller('posts')
export class PostsController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus
    ) {}

    /*@Post()
    @UseGuards(BasicAuthGuard)
    async create(@Body() postInputDto: PostInputDto) {
        const postId = await this.postsService.create(postInputDto);
        return await this.postsService.findOne({ id: postId });
    }*/

    @Get()
    @UseGuards(JwtOptionalAuthGuard)
    async findAll(
        @Query() query: GetPostsQueryParams,
        @ExtractUserIfExistsFromRequest() user: UserContextDto
    ): Promise<PaginatedViewDto<PostViewDto[]>> {
        return await this.queryBus.execute<GetAllPostsQuery>(new GetAllPostsQuery(query, user ? user.id : undefined));
    }

    @Get(':id')
    @UseGuards(JwtOptionalAuthGuard)
    async findOne(@Param('id') id: string, @ExtractUserIfExistsFromRequest() user: UserContextDto) {
        let userId: string | null;
        if (user) {
            userId = user.id;
        } else {
            userId = null;
        }

        return await this.queryBus.execute<GetPostByIdQuery>(new GetPostByIdQuery(id, userId));
    }

    /*@Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        await this.postsService.update(id, updatePostDto);
        return;
    }*/

    /*@Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async remove(@Param('id', ObjectIdValidationPipe) id: string) {
        return await this.postsService.remove(id);
    }*/

    @Put(':id/like-status')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async like(
        @Param('id') id: string,
        @ExtractUserFromRequest() user: UserContextDto,
        @Body() inputLikeDto: LikeInputDto
    ) {
        const dto = {
            likeStatus: inputLikeDto.likeStatus,
            postId: id,
            parentId: user.id
        };

        return await this.commandBus.execute<CreateReactionForPostCommand>(new CreateReactionForPostCommand(dto));
    }

    @Get(':id/comments')
    @UseGuards(JwtOptionalAuthGuard)
    async getCommentsForPost(
        @Param('id') id: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
        @Query() query: GetCommentsQueryParams
    ) {
        return await this.queryBus.execute<GetCommentsForPostQuery>(
            new GetCommentsForPostQuery(id, query, user ? user.id : undefined)
        );
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    async createCommentForPost(
        @Param('id') id: string,
        @ExtractUserFromRequest() user: UserContextDto,
        @Body() createCommentInputDto: CreateCommentInputDto
    ) {
        const dto = {
            postId: id,
            userId: user.id,
            content: createCommentInputDto.content
        };

        const commentId: string = await this.commandBus.execute<CreateCommentForPostCommand>(
            new CreateCommentForPostCommand(dto)
        );

        return await this.queryBus.execute<GetCommentByIdQuery>(new GetCommentByIdQuery(commentId, user.id));
    }
}
