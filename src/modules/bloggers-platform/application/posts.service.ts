import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogPostDto, CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsQRepository } from '../infrastructure/posts.query-repository';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name)
        private postModel: PostModelType,
        private postsRepository: PostsRepository,
        private postsQRepository: PostsQRepository,
        private blogsRepository: BlogsRepository
    ) {}

    async create(createPostDto: CreatePostDto) {
        const foundBlog = await this.blogsRepository.findById(createPostDto.blogId); //check for blog existence
        if (!foundBlog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }
        const createPostDomainDto = { ...createPostDto, blogName: foundBlog.name };

        const newPost = this.postModel.createInstance(createPostDomainDto);
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
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        return post;
    }

    async update(id: string, updatePostDto: UpdatePostDto) {
        const post = await this.postsRepository.findById(id);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        const blog = await this.blogsRepository.findById(updatePostDto.blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }
        const updatePostDomainDto = { ...updatePostDto, blogName: blog.name };
        post.update(updatePostDomainDto);

        await this.postsRepository.save(post);

        return post._id.toString();
    }

    async remove(id: string) {
        const post = await this.postsRepository.findById(id);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        return await this.postsRepository.delete(id);
    }

    async findForBlog(blogId: string, query: GetPostsQueryParams) {
        const blog = await this.blogsRepository.findById(blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        return await this.postsQRepository.findForBlog(blogId, query);
    }

    async createForBlog(blogId: string, createPostDto: CreateBlogPostDto) {
        const foundBlog = await this.blogsRepository.findById(blogId);
        if (!foundBlog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }
        const createPostDomainDto = { ...createPostDto, blogName: foundBlog.name, blogId: foundBlog._id.toString() };

        const newPost = this.postModel.createInstance(createPostDomainDto);
        await this.postsRepository.save(newPost);
        return newPost._id.toString();
    }
}
