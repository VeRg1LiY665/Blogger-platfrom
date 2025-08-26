import { CommentatorInfo } from '../commentatorInfo.schema';
import { LikesInfo } from '../likesInfo.schema';
import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';

export class CreateCommentDomainDto extends CreateCommentInputDto {
    commentatorInfo: CommentatorInfo;
    postId: string;
    likesInfo: LikesInfo;
}
