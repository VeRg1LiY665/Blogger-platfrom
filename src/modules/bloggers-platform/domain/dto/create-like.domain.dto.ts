export class CreateLikeDomainDto {
    status: string;
    userId: string;
    parentId: string;
    commentId: string;
    postId: string; //для лайков на посты
    addedAt: string; //для лайков на посты
}
