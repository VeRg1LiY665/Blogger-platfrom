import { Comment } from '../domain/comment.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Pool } from 'pg';
import { CommentDbEntity } from './dto/comment-db-entity';

@Injectable({ scope: Scope.REQUEST })
export class CommentsSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: Comment | null = null;

    private dataMapper(commentData: CommentDbEntity): Comment {
        const comment = new Comment();
        comment.id = commentData.id;
        comment.content = commentData.content;
        comment.commentatorInfo = {
            userId: commentData.userId.toString(),
            userLogin: commentData.userLogin
        };
        comment.postId = commentData.postId.toString();
        comment.createdAt = commentData.createdAt;
        comment.likesInfo = {
            likesCount: commentData.likesCount,
            dislikesCount: commentData.dislikesCount,
            myStatus: 'None'
        };

        this.entity = JSON.parse(JSON.stringify(comment)); //save the state of the data through deep copy

        return comment;
    }

    async findById(id: string): Promise<Comment | null> {
        const result = await this.pool.query('SELECT * FROM comments WHERE id = $1', [id]);

        return result.rows.length > 0 ? this.dataMapper(result.rows[0] as CommentDbEntity) : null;
    }

    async save(comment: Comment): Promise<string> {
        if (JSON.stringify(this.entity) === JSON.stringify(comment) && this.entity !== null) {
            return this.entity.id.toString();
        }

        if (JSON.stringify(this.entity) !== JSON.stringify(comment) && this.entity !== null) {
            await this.pool.query(
                'UPDATE comments SET content = $1, "postId" = $2, "userId" = $3, "userLogin" = $4, "createdAt" = $5, "likesCount" = $6, "dislikesCount" = $7 WHERE id = $8 RETURNING id',
                [
                    comment.content,
                    comment.postId,
                    comment.commentatorInfo.userId,
                    comment.commentatorInfo.userLogin,
                    comment.createdAt,
                    comment.likesInfo.likesCount,
                    comment.likesInfo.dislikesCount,
                    comment.id
                ]
            );
            return this.entity.id.toString();
        }

        const res = await this.pool.query(
            'INSERT INTO comments (content, "postId", "userId", "userLogin", "createdAt", "likesCount", "dislikesCount") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [
                comment.content,
                comment.postId,
                comment.commentatorInfo.userId,
                comment.commentatorInfo.userLogin,
                comment.createdAt,
                comment.likesInfo.likesCount,
                comment.likesInfo.dislikesCount
            ]
        );
        return res.rows[0].id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.pool.query(`DELETE FROM comments WHERE id = $1`, [id]);

        return;
    }
}
