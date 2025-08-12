export abstract class LikeDbEntity {
    id: number;
    likeStatus: string;
    userId: number;
    parentId: number;
    commentId: number;
    postId: number;
    addedAt: string;
}
