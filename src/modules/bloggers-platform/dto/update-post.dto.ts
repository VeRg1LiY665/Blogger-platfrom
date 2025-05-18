import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends CreatePostDto {
    blogName: string;
}
