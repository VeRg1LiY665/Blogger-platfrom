import { Blog } from '../domain/blog.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Pool } from 'pg';
import { BlogDbEntity } from './dto/blog-db-entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogsSqlRepository {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    private entity: Blog | null = null;

    private dataMapper(blogData: BlogDbEntity): Blog {
        const blog = new Blog();
        blog.id = blogData.id;
        blog.name = blogData.name;
        blog.description = blogData.description;
        blog.websiteUrl = blogData.websiteUrl;
        blog.createdAt = blogData.createdAt;
        blog.isMembership = blogData.isMembership;

        this.entity = JSON.parse(JSON.stringify(blog)); //save the state of the data through deep copy

        return blog;
    }

    async findById(id: string): Promise<Blog | null> {
        const blog = await this.pool.query(`SELECT * FROM blogs WHERE id = $1`, [id]);

        return blog.rows.length > 0 ? this.dataMapper(blog.rows[0] as BlogDbEntity) : null;
    }

    async findByName(name: string): Promise<Blog | null> {
        const blog = await this.pool.query(`SELECT * FROM blogs WHERE name = $1`, [name]);

        return blog.rows.length > 0 ? this.dataMapper(blog.rows[0] as BlogDbEntity) : null;
    }

    async save(blog: Blog): Promise<string> {
        if (JSON.stringify(this.entity) === JSON.stringify(blog) && this.entity !== null) {
            return this.entity.id.toString();
        }

        if (JSON.stringify(this.entity) !== JSON.stringify(blog) && this.entity !== null) {
            const res = await this.pool.query(
                'UPDATE blogs SET name = $1, description = $2, "websiteUrl" = $3, "createdAt" = $4, "isMembership" = $5 WHERE id = $6 RETURNING id',
                [blog.name, blog.description, blog.websiteUrl, blog.createdAt, blog.isMembership, blog.id]
            );
            const id = res.rows[0].id;
            return id.toString();
        }

        const res = await this.pool.query(
            'INSERT INTO blogs (name, description, "websiteUrl", "createdAt", "isMembership") VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [blog.name, blog.description, blog.websiteUrl, blog.createdAt, blog.isMembership]
        );
        const id = res.rows[0].id;
        return id.toString();
    }

    async delete(id: string): Promise<void> {
        await this.pool.query(`DELETE FROM blogs WHERE id = $1`, [id]);

        return;
    }
}
