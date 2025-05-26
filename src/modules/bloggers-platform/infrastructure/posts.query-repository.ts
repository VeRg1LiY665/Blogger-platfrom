import { InjectModel } from '@nestjs/mongoose';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { Post, PostModelType } from '../domain/post.entity';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params';

export class PostsQRepository {
    constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

    async findAll(query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        let filter: FilterQuery<Post> = {};
        if (query.searchNameTerm) {
            filter = {
                title: { $regex: query.searchNameTerm, $options: 'i' }
            };
        }

        const posts = await this.postModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);

        const items = posts.map((x) => PostViewDto.mapToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findById(id: string): Promise<PostViewDto> {
        const post = await this.postModel.findOne({
            _id: id
        });

        if (!post) {
            throw new NotFoundException('No post found');
        }

        return PostViewDto.mapToView(post);
    }

    async findForBlog(blogId: string, query: GetPostsQueryParams): Promise<PaginatedViewDto<PostViewDto[]>> {
        let filter: FilterQuery<Post> = {};
        filter = {
            blogId: blogId
        };

        const posts = await this.postModel
            .find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);

        const items = posts.map((x) => PostViewDto.mapToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }
}
