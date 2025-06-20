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
        return await this.postsService.findOne(postId);
    }

    @Get()
    async findAll(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        return await this.postsService.findAll(query);
    }

    @Get(':id') //TODO add jwt check to show reaction of a user or None
    async findOne(@Param('id') id: string) {
        return await this.postsService.findOne(id);
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
    @UseGuards(JwtAuthGuard)
    async like(@Param('id') id: string, @Body() inputLikeDto: LikeInputDto) {
        const dto = {
            likeStatus: inputLikeDto.likeStatus,
            postId: id,
            parentId: '' //TODO Sessions
        };

        return await this.likesService.createForPost(dto);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    async createCommentForPost(
        @Param('id') id: string,
        @ExtractUserIfExistsFromRequest() user: UserContextDto,
        @Body() createCommentInputDto: CreateCommentInputDto
    ) {
        const dto = {
            postId: id,
            userId: user.id,
            content: createCommentInputDto.content
        };

        const commentId = await this.commentsService.create(dto);

        return await this.commentsService.findOne(commentId);
    }
}
