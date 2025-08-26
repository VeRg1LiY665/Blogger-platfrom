export class CreateLikeDomainDto {
    status: string;
    parentId: string;
    commentId: string | null;
    postId: string | null; //для лайков на посты
    addedAt: string; //для лайков на посты
}
