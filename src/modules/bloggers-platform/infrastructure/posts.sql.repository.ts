import { Post } from '../domain/post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsSqlRepository {
    private posts: Repository<Post>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.posts = this.dataSource.getRepository(Post);
    }

    async findById(id: string): Promise<Post | null> {
        const post = await this.posts.findOne({ where: { id: id } });
        return post;
    }

    async save(post: Post): Promise<string> {
        const res = await this.posts.save(post);

        return res.id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.posts.delete({ id: id });
        return;
    }
}
