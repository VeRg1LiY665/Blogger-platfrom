import { likesInfo } from '../../domain/likesInfo.schema';
import { commentatorInfo } from '../../domain/commentatorInfo.schema';
import { CommentDocument } from '../../domain/comment.entity';

export class CommentViewDto {
    id: string;
    commentatorInfo: commentatorInfo;
    content: string;
    createdAt: string;
    likesInfo: likesInfo;

    static mapToView(comment: CommentDocument): CommentViewDto {
        const dto = new this();

        dto.id = comment._id.toString();
        dto.commentatorInfo = comment.commentatorInfo;
        dto.content = comment.content;
        dto.createdAt = comment.createdAt;
        dto.likesInfo = comment.likesInfo;

        return dto;
    }
}
