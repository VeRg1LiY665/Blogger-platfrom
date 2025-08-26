export abstract class CommentDbEntity {
    id: number;
    content: string;
    userId: number;
    userLogin: string;
    postId: number;
    createdAt: string;
    likesCount: number;
    dislikesCount: number;
}
