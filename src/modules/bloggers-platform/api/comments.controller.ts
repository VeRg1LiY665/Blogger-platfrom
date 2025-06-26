import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    UseGuards,
    Put,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { LikeInputDto } from './input-dto/likes.input-dto';
import { LikesService } from '../application/likes.service';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';

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
    @UseGuards(JwtOptionalAuthGuard)
    async findOne(@Param('id') id: string, @ExtractUserIfExistsFromRequest() user: UserContextDto) {
        const dto = {
            id: id,
            userId: user ? user.id : undefined
        };
        return await this.commentsService.findOne(dto);
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @ExtractUserFromRequest() user: UserContextDto,
        @Body() updateCommentDto: UpdateCommentDto
    ) {
        const dto = {
            id: id,
            updateCommentDto: updateCommentDto,
            userId: user.id
        };
        return await this.commentsService.update(dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @ExtractUserFromRequest() user: UserContextDto) {
        const dto = { id: id, userId: user.id };
        return await this.commentsService.remove(dto);
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
            commentId: id,
            parentId: user.id //TODO Sessions
        };

        return await this.likesService.createForComment(dto);
    }
}
