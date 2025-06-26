import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpCode,
    HttpStatus,
    UseGuards
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { LikesService } from '../application/likes.service';
import { LikeInputDto } from './input-dto/likes.input-dto';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { CommentsService } from '../application/comments.service';
import { CreateCommentInputDto } from './input-dto/comment.input-dto';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';
import { PostInputDto } from './input-dto/post.input-dto';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params';

@Controller('posts')
export class PostsController {
    constructor(
        private postsService: PostsService,
        private likesService: LikesService,
        private commentsService: CommentsService
    ) {}

    @Post()
    @UseGuards(BasicAuthGuard)
    async create(@Body() postInputDto: PostInputDto) {
        const postId = await this.postsService.create(postInputDto);
        return await this.postsService.findOne({ id: postId });
    }

    @Get()
    async findAll(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        return await this.postsService.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtOptionalAuthGuard)
    async findOne(@Param('id') id: string, @ExtractUserIfExistsFromRequest() user: UserContextDto) {
        let userId;
        if (user) {
            userId = user.id;
        } else {
            userId = null;
        }

        const dto = {
            id: id,
            userId: userId
        };

        return await this.postsService.findOne(dto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        await this.postsService.update(id, updatePostDto);
        return;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(BasicAuthGuard)
    async remove(@Param('id') id: string) {
        return await this.postsService.remove(id);
    }

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
            parentId: user.id //TODO Sessions
        };

        return await this.likesService.createForPost(dto);
    }

    @Get(':id/comments')
    @UseGuards(JwtOptionalAuthGuard)
    async getCommentsForPost(
        @Param('id') id: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
        @Query() query: GetCommentsQueryParams
    ) {
        const dto = {
            id: id,
            query: query,
            userId: user ? user.id : undefined
        };
        return await this.commentsService.findForPost(dto);
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

        const commentId = await this.commentsService.create(dto);
        const findDto = {
            id: commentId,
            userId: user.id
        };
        return await this.commentsService.findOne(findDto);
    }
}
