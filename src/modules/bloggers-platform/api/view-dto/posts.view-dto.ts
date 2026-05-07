import { Post } from '../../domain/post.entity';
import { ApiProperty } from '@nestjs/swagger';

export class NewestLike {
    @ApiProperty()
    addedAt: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    login: string;
}

export class ExtendedLikesInfo {
    @ApiProperty()
    likesCount: number;
    @ApiProperty()
    dislikesCount: number;
    @ApiProperty()
    myStatus: string;
    @ApiProperty({ type: [NewestLike] })
    newestLikes: NewestLike[];
}

export class PostViewDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    title: string;
    @ApiProperty()
    shortDescription: string;
    @ApiProperty()
    content: string;
    @ApiProperty()
    blogId: string;
    @ApiProperty()
    blogName: string;
    @ApiProperty()
    createdAt: string;
    @ApiProperty({ type: ExtendedLikesInfo })
    extendedLikesInfo: ExtendedLikesInfo;
    /*{
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
        newestLikes: NewestLike[];
    }*/

    static mapSqlToView(post: Post): PostViewDto {
        const dto = new PostViewDto();
        dto.id = post.id.toString();
        dto.title = post.title;
        dto.shortDescription = post.shortDescription;
        dto.content = post.content;
        dto.blogId = post.blogId;
        dto.blogName = post.blogName;
        dto.createdAt = post.createdAt;
        dto.extendedLikesInfo = post.extendedLikesInfo;

        return dto;
    }
}
