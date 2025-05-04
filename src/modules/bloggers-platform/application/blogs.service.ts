import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
    constructor(
        @InjectModel(Blog.name)
        private blogModel: BlogModelType,
        private blogsRepository: BlogsRepository
    ) {}

    async createBlog(dto: CreateBlogDto): Promise<string> {
        const newBlog = this.blogModel.createInstance({
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl
        });

        await this.blogsRepository.save(newBlog);

        return newBlog._id.toString();
    }

    async updateBlog(id: string, dto: UpdateBlogDto): Promise<string> {
        const blog = await this.blogsRepository.findById(id);
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        blog.update(dto);

        await this.blogsRepository.save(blog);

        return blog._id.toString();
    }

    async deleteBlog(id: string): Promise<void> {
        const blog = await this.blogsRepository.findById(id);
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        await this.blogsRepository.delete(id);
    }
}
