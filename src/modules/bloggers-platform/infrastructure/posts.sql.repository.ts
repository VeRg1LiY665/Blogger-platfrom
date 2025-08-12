import { Post } from '../domain/post.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Pool } from 'pg';
import { PostDbEntity } from './dto/post-db-entity';
import { NewestLike } from '../domain/extendedLikesInfo.schema';

@Injectable({ scope: Scope.REQUEST })
export class PostsSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: Post | null = null;

    private dataMapper(postData: PostDbEntity): Post {
        const post = new Post();
        post.id = postData.id;
        post.title = postData.title;
        post.shortDescription = postData.shortDescription;
        post.content = postData.content;
        post.blogId = postData.blogId.toString();
        post.blogName = postData.blogName;
        post.createdAt = postData.createdAt;
        post.extendedLikesInfo = {
            likesCount: postData.likesCount,
            dislikesCount: postData.dislikesCount,
            myStatus: 'None',
            newestLikes: []
        };

        this.entity = JSON.parse(JSON.stringify(post)); //save the state of the data through deep copy

        return post;
    }
    async findById(id: string): Promise<Post | null> {
        const post = await this.pool.query(`SELECT * FROM posts WHERE id = $1`, [id]);

        return post.rows.length > 0 ? this.dataMapper(post.rows[0] as PostDbEntity) : null;
    }

    async save(post: Post): Promise<string> {
        if (JSON.stringify(this.entity) === JSON.stringify(post) && this.entity !== null) {
            return this.entity.id.toString();
        }

        if (JSON.stringify(this.entity) !== JSON.stringify(post) && this.entity !== null) {
            const res = await this.pool.query(
                'UPDATE posts SET title = $1, "shortDescription" = $2, "content" = $3, "blogId" = $4, "blogName" = $5, "createdAt" = $6, "likesCount" = $7, "dislikesCount" = $8 WHERE id = $9 RETURNING id',
                [
                    post.title,
                    post.shortDescription,
                    post.content,
                    post.blogId,
                    post.blogName,
                    post.createdAt,
                    post.extendedLikesInfo.likesCount,
                    post.extendedLikesInfo.dislikesCount,
                    post.id
                ]
            );
            const id = res.rows[0].id;
            return id.toString();
        }

        const res = await this.pool.query(
            'INSERT INTO posts (title, "shortDescription", "content", "blogId", "blogName", "createdAt", "likesCount", "dislikesCount") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [
                post.title,
                post.shortDescription,
                post.content,
                post.blogId,
                post.blogName,
                post.createdAt,
                post.extendedLikesInfo.likesCount,
                post.extendedLikesInfo.dislikesCount
            ]
        );
        const id = res.rows[0].id;
        return id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.pool.query(`DELETE FROM posts WHERE id = $1`, [id]);

        return;
    }
}
