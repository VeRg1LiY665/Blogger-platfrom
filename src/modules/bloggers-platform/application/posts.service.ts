import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { Post, PostModelType } from '../domain/post.entity';
import { BlogsExtQRepository } from '../infrastructure/external-query/blogs.external-query-repository';
import { PostsQRepository } from '../infrastructure/posts.query-repository';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name)
        private postModel: PostModelType,
        private postsRepository: PostsRepository,
        private postsQRepository: PostsQRepository,
        private blogsExtQRepository: BlogsExtQRepository
    ) {}

    async create(createPostDto: CreatePostDto) {
        await this.blogsExtQRepository.findById(createPostDto.blogId); //check for blog existence
        const newPost = this.postModel.createInstance(createPostDto);
        await this.postsRepository.save(newPost);
        return newPost._id.toString();
    }

    async findAll(query: GetPostsQueryParams) {
        const posts = await this.postsQRepository.findAll(query);
        return posts;
    }

    async findOne(id: string) {
        const post = await this.postsQRepository.findById(id);
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        return post;
    }

    async update(id: string, updatePostDto: UpdatePostDto) {
        const post = await this.postsRepository.findById(id);
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        post.update(updatePostDto);

        return post._id.toString();
    }

    async remove(id: string) {
        const post = await this.postsRepository.findById(id);
        if (!post) {
            throw new NotFoundException(`Post with id ${id} not found`);
        }

        return await this.postsRepository.delete(id);
    }
}
