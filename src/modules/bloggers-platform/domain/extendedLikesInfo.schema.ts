import { LikeInput } from '../api/input-dto/likes.input-dto';
import { Column } from 'typeorm';

export class NewestLike {
    constructor(
        public addedAt: string,
        public userId: string,
        public login: string
    ) {}
}

export class ExtendedLikesInfo {
    @Column({ default: 0 })
    likesCount: number = 0;

    @Column({ default: 0 })
    dislikesCount: number = 0;

    myStatus: string = LikeInput.None;

    newestLikes: NewestLike[] = [];
}
