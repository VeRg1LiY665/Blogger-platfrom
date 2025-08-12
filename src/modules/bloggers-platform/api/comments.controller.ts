import { Controller, Get, Body, Param, Delete, UseGuards, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { LikeInputDto } from './input-dto/likes.input-dto';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/extract-user-if-exists-from-request.decorator';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdQuery } from '../application/queries/comments/get-comment-by-id.query';
import { UpdateCommentCommand } from '../application/usecases/comments/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/comments/delete-comment-by-id.usecase';
import { CreateReactionForCommentCommand } from '../application/usecases/comments/create-reaction-for-comment.usecase';

@Controller('comments')
export class CommentsController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus
    ) {}

    @Get(':id')
    @UseGuards(JwtOptionalAuthGuard)
    async findOne(@Param('id') id: string, @ExtractUserIfExistsFromRequest() user: UserContextDto) {
        return await this.queryBus.execute<GetCommentByIdQuery>(
            new GetCommentByIdQuery(id, user ? user.id : undefined)
        );
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @ExtractUserFromRequest() user: UserContextDto,
        @Body() updateCommentDto: UpdateCommentDto
    ) {
        return await this.commandBus.execute<UpdateCommentCommand>(
            new UpdateCommentCommand(updateCommentDto, user.id, id)
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @ExtractUserFromRequest() user: UserContextDto) {
        return await this.commandBus.execute<DeleteCommentCommand>(new DeleteCommentCommand(user.id, id));
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
            parentId: user.id
        };

        return await this.commandBus.execute<CreateReactionForCommentCommand>(new CreateReactionForCommentCommand(dto));
    }
}
