import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { NotFoundException } from '@nestjs/common';
import { BlogExternalDto } from './external-dto/blogs.external-dto';

export class BlogsExtQRepository {
    constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

    async findById(id: string): Promise<BlogExternalDto> {
        const blog = await this.blogModel.findOne({
            _id: id
        });

        if (!blog) {
            throw new NotFoundException('No blog found');
        }

        return BlogExternalDto.mapToView(blog);
    }
}
