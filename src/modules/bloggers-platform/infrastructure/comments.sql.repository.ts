import { Comment } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class CommentsSqlRepository {
    private comments: Repository<Comment>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.comments = this.dataSource.getRepository(Comment);
    }

    async findById(id: string): Promise<Comment | null> {
        const comment = await this.comments.findOne({ where: { id: id } });
        return comment;
    }

    async save(comment: Comment): Promise<string> {
        const res = await this.comments.save(comment);

        return res.id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.comments.delete({ id: id });

        return;
    }
}
