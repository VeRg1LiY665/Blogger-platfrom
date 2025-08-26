import { Like } from '../domain/like.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class LikesSqlRepository {
    private likes: Repository<Like>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.likes = this.dataSource.getRepository(Like);
    }

    async ShowReactionForComment(parentId: string, commentId: string): Promise<Like | null> {
        const res = await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."commentId" = :commentId', { commentId: commentId })
            .andWhere('l."parentId" = :parentId', { parentId: parentId })
            .getOne();

        return res;
    }

    async save(like: Like) {
        await this.likes.save(like);
        return;
    }

    async CountReactionsForComment(commentId: string) {
        const likes: number = +(await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."commentId" = :commentId', { commentId: commentId })
            .andWhere('l."likeStatus" = :likeStatus', { likeStatus: 'Like' })
            .getCount());

        const dislikes: number = +(await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."commentId" = :commentId', { commentId: commentId })
            .andWhere('l."likeStatus" = :likeStatus', { likeStatus: 'Dislike' })
            .getCount());

        return { likes, dislikes };
    }

    async ShowReactionForPost(parentId: string, postId: string) {
        const res = await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."postId" = :postId', { postId: postId })
            .andWhere('l."parentId" = :parentId', { parentId: parentId })
            .getOne();

        return res;
    }

    async CountReactionsForPost(postId: string) {
        const likes: number = +(await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."postId" = :postId', { postId: postId })
            .andWhere('l."likeStatus" = :likeStatus', { likeStatus: 'Like' })
            .getCount());

        const dislikes: number = +(await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."postId" = :postId', { postId: postId })
            .andWhere('l."likeStatus" = :likeStatus', { likeStatus: 'Dislike' })
            .getCount());

        return { likes, dislikes };
    }

    async ShowLastLikesForPost(postId: string): Promise<Like[] | null> {
        const likes = await this.likes
            .createQueryBuilder('l')
            .select()
            .where('l."postId" = :postId', { postId: postId })
            .andWhere('l."likeStatus" = :likeStatus', { likeStatus: 'Like' })
            .orderBy('l."addedAt"', 'DESC')
            .take(3)
            .getMany();

        return likes.length > 0 ? likes : null;
    }
}
