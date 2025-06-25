import { Injectable } from '@nestjs/common';
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
import { LikesRepo } from '../infrastructure/likes.repository';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name)
        private postModel: PostModelType,
        private postsRepository: PostsRepository,
        private postsQRepository: PostsQRepository,
        private blogsRepository: BlogsRepository,
        private likesRepository: LikesRepo
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

    async findOne(dto: { userId?: string | undefined; id: string }) {
        const post = await this.postsQRepository.findById(dto.id);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        if (dto.userId) {
            const reaction = await this.likesRepository.ShowReactionForPost(dto.userId, dto.id);
            if (reaction) {
                post.extendedLikesInfo.myStatus = reaction.likeStatus;
            }
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

    async findForBlog(dto: { blogId: string; query: GetPostsQueryParams; userId?: string }) {
        const blog = await this.blogsRepository.findById(dto.blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        const items = await this.postsQRepository.findForBlog(dto.blogId, dto.query);

        if (!items) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        if (dto.userId) {
            for (let i = 0; i < items.totalCount; i++) {
                const reaction = await this.likesRepository.ShowReactionForPost(dto.userId, items[i].id);
                if (reaction) {
                    items[i].extendedLikesInfo.myStatus = reaction.likeStatus;
                }
            }
        }
        return items;
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
