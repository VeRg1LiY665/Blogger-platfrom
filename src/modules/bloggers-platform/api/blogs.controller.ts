import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { BlogsService } from '../application/blogs.service';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { BlogsQRepository } from '../infrastructure/blogs.query-repository';
import { UpdateBlogDto } from '../dto/create-blog.dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';

@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsServices: BlogsService,
        protected blogsQRepo: BlogsQRepository
    ) {}

    @Get()
    async getBlogs(@Query() query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>> {
        return await this.blogsQRepo.findAll(query);
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Get(':id')
    async getBlogByID(@Param('id') id: string): Promise<BlogViewDto> {
        return await this.blogsQRepo.findById(id);
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        return this.blogsServices.deleteBlog(id);
    }

    @Post()
    async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
        const newBlogId = await this.blogsServices.createBlog(body);
        return this.blogsQRepo.findById(newBlogId);
    }

    @Put(':id')
    async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto): Promise<void> {
        await this.blogsServices.updateBlog(id, body);
        return;
    }
}
