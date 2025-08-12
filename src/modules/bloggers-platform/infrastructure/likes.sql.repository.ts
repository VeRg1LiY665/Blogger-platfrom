import { Like } from '../domain/like.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Pool } from 'pg';
import { LikeDbEntity } from './dto/like-db-entity';

@Injectable({ scope: Scope.REQUEST })
export class LikesSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: Like | null = null;

    private dataMapper(likeData: LikeDbEntity): Like {
        const like = new Like();

        like.id = likeData.id;
        like.likeStatus = likeData.likeStatus;
        like.userId = likeData.userId.toString();
        like.parentId = likeData.parentId.toString();
        like.commentId = likeData.commentId.toString();
        like.postId = likeData.postId.toString();
        like.addedAt = likeData.addedAt;

        this.entity = JSON.parse(JSON.stringify(like)); //save the state of the data through deep copy

        return like;
    }

    async ShowReactionForComment(parentId: string, commentId: string) {
        const res = await this.pool.query(`SELECT * FROM likes WHERE "commentId" = $1 AND "parentId" = $2`, [
            commentId,
            parentId
        ]);

        return res.rows.length > 0 ? this.dataMapper(res.rows[0] as LikeDbEntity) : null;
    }

    async save(like: Like) {
        if (JSON.stringify(this.entity) === JSON.stringify(like) && this.entity !== null) {
            return;
        }

        if (JSON.stringify(this.entity) !== JSON.stringify(like) && this.entity !== null) {
            await this.pool.query(
                'UPDATE likes SET "likeStatus" = $1, "userId" = $2, "parentId" = $3, "commentId" = $4, "postId" = $5, "addedAt" = $6 WHERE id = $7',
                [like.likeStatus, +like.userId, +like.parentId, +like.commentId, +like.postId, like.addedAt, like.id]
            );
            return;
        }

        await this.pool.query(
            'INSERT INTO likes ("likeStatus", "userId", "parentId", "commentId", "postId", "addedAt") VALUES ($1, $2, $3, $4, $5, $6)',
            [like.likeStatus, +like.userId, +like.parentId, +like.commentId, +like.postId, like.addedAt]
        );
        return;
    }

    async CountReactionsForComment(commentId: string) {
        const likes: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM likes WHERE "commentId" = $1 AND "likeStatus" LIKE 'Like'`, [
                commentId
            ])
        ).rows[0].count;

        const dislikes: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM likes WHERE "commentId" = $1 AND "likeStatus" LIKE 'Dislike'`, [
                commentId
            ])
        ).rows[0].count;

        return { likes, dislikes };
    }

    async ShowReactionForPost(parentId: string, postId: string) {
        const res = await this.pool.query(`SELECT * FROM likes WHERE "postId" = $1 AND "parentId" = $2`, [
            postId,
            parentId
        ]);

        return res.rows.length > 0 ? this.dataMapper(res.rows[0] as LikeDbEntity) : null;
    }

    async CountReactionsForPost(postId: string) {
        const likes: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM likes WHERE "postId" = $1 AND "likeStatus" = 'Like'`, [postId])
        ).rows[0].count;

        const dislikes: number = +(
            await this.pool.query(`SELECT COUNT(*) FROM likes WHERE "postId" = $1 AND "likeStatus" = 'Dislike'`, [
                postId
            ])
        ).rows[0].count;

        return { likes, dislikes };
    }

    async ShowLastLikesForPost(postId: string): Promise<Like[] | null> {
        const res = await this.pool.query(
            `SELECT * FROM likes WHERE "postId" = $1 AND "likeStatus" LIKE 'Like' ORDER BY "addedAt" DESC LIMIT 3`,
            [postId]
        );

        if (res.rows.length < 1) {
            return null;
        }

        const likes = res.rows.map((x: LikeDbEntity) => this.dataMapper(x));
        return likes;
    }
}
