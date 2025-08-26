import { Column } from 'typeorm';

export class CommentatorInfo {
    @Column({ name: 'userId' })
    userId: string;

    @Column({ name: 'userLogin' })
    userLogin: string;
}
