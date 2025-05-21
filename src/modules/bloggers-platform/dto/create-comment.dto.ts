import { CreateCommentInputDto } from '../api/input-dto/comment.input-dto';

export class CreateCommentDto extends CreateCommentInputDto {
    postId: string;
    userId: string;
}
