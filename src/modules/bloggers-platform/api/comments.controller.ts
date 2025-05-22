import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

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

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
        return await this.commentsService.update(id, updateCommentDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.commentsService.remove(id);
    }
}
