import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { LikeInputDto } from './input-dto/likes.input-dto';
import { LikesService } from '../application/likes.service';

@Controller('comments')
export class CommentsController {
    constructor(
        private commentsService: CommentsService,
        private likesService: LikesService
    ) {}

    @Post()
    async create(@Body() createCommentDto: CreateCommentDto) {
        return await this.commentsService.create(createCommentDto);
    }

    @Get(':id')
    async findAll(@Param('id') id: string, @Query() query: GetCommentsQueryParams) {
        return await this.commentsService.findForPost(id, query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.commentsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
        return await this.commentsService.update(id, updateCommentDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string) {
        return await this.commentsService.remove(id);
    }

    @Put(':id/like-status')
    @UseGuards(JwtAuthGuard)
    async like(@Param('id') id: string, @Body() inputLikeDto: LikeInputDto) {
        const dto = {
            likeStatus: inputLikeDto.likeStatus,
            commentId: id,
            parentId: '' //TODO Sessions
        };

        return await this.likesService.createForComment(dto);
    }
}
