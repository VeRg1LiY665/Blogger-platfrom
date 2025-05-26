import { UpdatePostDto } from '../../dto/update-post.dto';

export class UpdatePostDomainDto extends UpdatePostDto {
    blogName: string;
}
