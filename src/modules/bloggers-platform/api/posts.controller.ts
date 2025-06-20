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

@Controller('posts')
export class PostsController {
    constructor(
        private postsService: PostsService,
        private likesService: LikesService
    ) {}

    @Post()
    @UseGuards(BasicAuthGuard)
    async create(@Body() createPostDto: CreatePostDto) {
        const postId = await this.postsService.create(createPostDto);
        return await this.postsService.findOne(postId);
    }

    @Get()
    async findAll(@Query() query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        return await this.postsService.findAll(query);
    }

    @Get(':id')
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
}
