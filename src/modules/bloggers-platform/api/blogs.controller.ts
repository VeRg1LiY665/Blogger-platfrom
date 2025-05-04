import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { BlogsService } from '../application/blogs.service';

@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsServices: BlogsService,
        protected blogsQRepo: BlogsQRepo
    ) {}

    /*    @Get()
    async getBlogs(req: Request, res: Response) {
        const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = paginationQueries(req);
        const blogs = await this.blogsQRepo.ShowAllBlogs({
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            searchNameTerm
        });
        const blogsCount = await this.blogsQRepo.BlogsCounter(searchNameTerm);
        const result = this.blogsQRepo.PaginationMap({ pageNumber, pageSize, blogsCount, blogs });
        res.status(200).json(result);
    }

    @ApiParam({ name: 'id' }) //для сваггера
    @Get(':id')
    async getBlogByID(@Param('id') id: string): Promise<BlogViewDto> {
        return await this.blogsQRepo.ShowBlogByID(req.params.id);
    }*/

    @ApiParam({ name: 'id' }) //для сваггера
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(@Param('id') id: string): Promise<void> {
        return this.blogsServices.deleteBlog(id);
    }

    @Post()
    async createBlog(req: Request, res: Response, next: NextFunction) {
        try {
            const id = await this.blogsServices.SetUpNewBlog(req.body);
            if (!id) {
                throw new CustomError('Unexpected exception', HttpStatuses.BadRequest, [
                    {
                        message: 'No update happened in repo',
                        field: 'null'
                    }
                ]);
            }
            const result = await this.blogsQRepo.ShowBlogByID(id);
            if (!result) {
                throw new CustomError('Unexpected exception', HttpStatuses.BadRequest, [
                    {
                        message: 'No update happened in repo',
                        field: 'null'
                    }
                ]);
            }
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }

    @Put(':id')
    async updateBlog(req: Request, res: Response, next: NextFunction) {
        try {
            const AlterFlag = await this.blogsServices.UpdateBlog(req.params.id, req.body);
            if (!AlterFlag) {
                throw new NotFoundError('Blog Not Found');
            }
            res.status(204).json('Successful update');
        } catch (err) {
            next(err);
        }
    }
}
