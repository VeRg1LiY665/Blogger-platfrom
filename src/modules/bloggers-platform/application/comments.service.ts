import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment, CommentModeltype } from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsQRepository } from '../infrastructure/comments.query-repository';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name)
        private commentModel: CommentModeltype,
        private commentsRepository: CommentsRepository,
        private commentsQRepository: CommentsQRepository,
        private postsRepository: PostsRepository,
        private usersExtQRepository: UsersExtQRepository
    ) {}

    async create(createCommentDto: CreateCommentDto) {
        const foundPost = await this.postsRepository.findById(createCommentDto.postId);

        if (!foundPost) {
            throw new NotFoundException(`Post with ${createCommentDto.postId} not found`);
        }

        const foundUser = await this.usersExtQRepository.findById(createCommentDto.userId);

        if (!foundUser) {
            throw new NotFoundException(`User with ${createCommentDto.postId} not found`);
        }

        const createCommentDomainDto = {
            commentatorInfo: {
                userId: foundUser.userId,
                userLogin: foundUser.login
            },
            content: createCommentDto.content,
            postId: createCommentDto.postId
        };

        const newComment = this.commentModel.createInstance(createCommentDomainDto);
        await this.commentsRepository.save(newComment);
        return newComment._id.toString();
    }

    async findForPost(id: string, query: GetCommentsQueryParams) {
        const post = await this.postsRepository.findById(id);
        if (!post) {
            throw new NotFoundException(`Post with ${id} not found`);
        }
        const comments = await this.commentsQRepository.findForPost(id, query);

        return comments;
    }

    async findOne(id: string) {
        const comment = await this.commentsQRepository.findOne(id);
        if (!comment) {
            throw new NotFoundException(`Comment with ${id} not found`);
        }
        return comment;
    }

    async update(id: string, updateCommentDto: UpdateCommentDto) {
        const comment = await this.commentsRepository.findById(id);
        if (!comment) {
            throw new NotFoundException(`Comment with ${id} not found`);
        }
        comment.update(updateCommentDto);
        return comment._id.toString();
    }

    async remove(id: string) {
        const comment = await this.commentsRepository.findById(id);
        if (!comment) {
            throw new NotFoundException(`Comment with ${id} not found`);
        }
        return await this.commentsRepository.delete(id);
    }
}
