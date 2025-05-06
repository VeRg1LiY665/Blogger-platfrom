export class NewestLike {
    addedAt: string;
    userId: string;
    login: string;
}

export class PostViewDto {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    createdAt: string;
    extendedLikesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
        newestLikes: NewestLike[];
    };
}
