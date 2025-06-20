import { commentatorInfo } from '../commentatorInfo.schema';
import { likesInfo } from '../likesInfo.schema';
import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';

export class CreateCommentDomainDto extends CreateCommentInputDto {
    commentatorInfo: commentatorInfo;
    postId: string;
    likesInfo: likesInfo;
}
