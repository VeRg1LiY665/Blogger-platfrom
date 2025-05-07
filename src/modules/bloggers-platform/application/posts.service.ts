import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { Post, PostModelType } from '../domain/post.entity';
import { BlogsExtQRepository } from '../infrastructure/external-query/blogs.external-query-repository';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name)
        private postModel: PostModelType,
        private postsRepository: PostsRepository,
        private blogsExtQRepository: BlogsExtQRepository
    ) {}

    async create(createPostDto: CreatePostDto) {
        await this.blogsExtQRepository.findById(createPostDto.blogId); //check for blog existence
        const newPost = this.postModel.createInstance(createPostDto);
        await this.postsRepository.save(newPost);
        return newPost._id.toString();
    }

    async findAll() {
        return `This action returns all posts`;
    }

    async findOne(id: string) {
        return `This action returns a #${id} post`;
    }

    async update(id: string, updatePostDto: UpdatePostDto) {
        return `This action updates a #${id} post`;
    }

    async remove(id: string) {
        return `This action removes a #${id} post`;
    }
}
