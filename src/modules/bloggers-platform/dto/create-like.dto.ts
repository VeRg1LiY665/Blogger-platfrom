export class CreateLikeForPostDto {
    likeStatus: string;
    postId: string;
    parentId: string;
}
export class CreateLikeForCommentDto {
    likeStatus: string;
    commentId: string;
    parentId: string;
}
