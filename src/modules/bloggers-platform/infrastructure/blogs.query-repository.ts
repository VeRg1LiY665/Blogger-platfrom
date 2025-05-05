import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BlogViewDTO } from '../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

export class BlogsQRepository {
    constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

    async findAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDTO[]>> {
        let filter: FilterQuery<Blog> = {};
        if(query.searchNameTerm) {
            filter = {
                name: { $regex: query.searchNameTerm, $options: 'i' }
            };
        }

        const blogs = await this.blogModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.blogModel.countDocuments(filter);

        const items = blogs.map((x) => BlogViewDTO.mapToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<BlogViewDTO> {
        const blog = await this.blogModel.findOne({
            _id: id
        });

        if (!blog) {
            throw new NotFoundException('No blog found');
        }

        return BlogViewDTO.mapToView(blog);
    }
}
