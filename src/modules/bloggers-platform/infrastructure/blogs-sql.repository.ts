import { Blog } from '../domain/blog.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BlogsSqlRepository {
    private blogs: Repository<Blog>;

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {
        this.blogs = this.dataSource.getRepository(Blog);
    }

    async findById(id: string): Promise<Blog | null> {
        const blog = await this.blogs.findOne({ where: { id: +id } });
        return blog;
    }

    async findByName(name: string): Promise<Blog | null> {
        const blog = await this.blogs.findOne({ where: { name: name } });
        return blog;
    }

    async save(blog: Blog): Promise<string> {
        const res = await this.blogs.save(blog);

        return res.id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.blogs.delete({ id: +id });

        return;
    }
}
