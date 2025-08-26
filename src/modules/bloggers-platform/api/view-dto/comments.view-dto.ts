import { LikesInfo } from '../../domain/likesInfo.schema';
import { CommentatorInfo } from '../../domain/commentatorInfo.schema';
import { Comment } from '../../domain/comment.entity';

export class CommentViewDto {
    id: string;
    commentatorInfo: CommentatorInfo;
    content: string;
    createdAt: string;
    likesInfo: LikesInfo;

    static mapSqlToView(comment: Comment): CommentViewDto {
        const dto = new this();

        dto.id = comment.id.toString();
        dto.commentatorInfo = comment.commentatorInfo;
        dto.content = comment.content;
        dto.createdAt = comment.createdAt;
        dto.likesInfo = comment.likesInfo;

        return dto;
    }
}
