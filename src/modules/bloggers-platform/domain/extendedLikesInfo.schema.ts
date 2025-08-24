import { Entity } from 'typeorm';

export class NewestLike {
    constructor(
        public addedAt: string,
        public userId: string,
        public login: string
    ) {}
}

export class ExtendedLikesInfo {
    likesCount: number = 0;

    dislikesCount: number = 0;

    myStatus: string = 'None';

    newestLikes: NewestLike[] = [new NewestLike('', '', '')];
}
