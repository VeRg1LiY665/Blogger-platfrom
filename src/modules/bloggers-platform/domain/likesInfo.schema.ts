import { Column } from 'typeorm';

export class LikesInfo {
    @Column({ name: 'likesCount' })
    likesCount: number = 0;

    @Column({ name: 'dislikesCount' })
    dislikesCount: number = 0;

    myStatus: string = 'None';
}
