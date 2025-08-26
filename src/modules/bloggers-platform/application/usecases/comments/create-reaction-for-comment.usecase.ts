import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CreateLikeForCommentDto } from '../../../dto/create-like.dto';
import { Like } from '../../../domain/like.entity';
import { LikesSqlRepository } from '../../../infrastructure/likes.sql.repository';
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql.repository';

export class CreateReactionForCommentCommand {
    constructor(public dto: CreateLikeForCommentDto) {}
}

/**
 * Создание лайка/дизлайка комментария пользователем
 */

@CommandHandler(CreateReactionForCommentCommand)
export class CreateReactionForCommentUseCase implements ICommandHandler<CreateReactionForCommentCommand, void> {
    constructor(
        private likesSqlRepository: LikesSqlRepository,
        private commentsSqlRepository: CommentsSqlRepository
    ) {}

    async execute({ dto }: CreateReactionForCommentCommand): Promise<void> {
        const comment = await this.commentsSqlRepository.findById(dto.commentId);
        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Comment not found'
            });
        }

        const reaction = await this.likesSqlRepository.ShowReactionForComment(dto.parentId, dto.commentId);
        if (!reaction) {
            const CreateLikeDto = {
                status: dto.likeStatus,
                parentId: dto.parentId,
                commentId: dto.commentId,
                postId: null,
                addedAt: new Date().toISOString()
            };

            const newReaction = Like.createInstance(CreateLikeDto);
            await this.likesSqlRepository.save(newReaction);
        } else {
            reaction.likeStatus = dto.likeStatus;
            await this.likesSqlRepository.save(reaction);
        }

        const { likes, dislikes } = await this.likesSqlRepository.CountReactionsForComment(comment.id.toString());

        comment.likesInfo.likesCount = likes;
        comment.likesInfo.dislikesCount = dislikes;

        await this.commentsSqlRepository.save(comment);

        return;
    }
}
