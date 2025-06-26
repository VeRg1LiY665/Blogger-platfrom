import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment, CommentModeltype } from '../domain/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsQRepository } from '../infrastructure/comments.query-repository';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params';
import { UsersExtQRepository } from '../../user-accounts/infrastructure/external-query/users.external-query-repository';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { likesInfo } from '../domain/likesInfo.schema';
import { LikesRepo } from '../infrastructure/likes.repository';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name)
        private commentModel: CommentModeltype,
        private commentsRepository: CommentsRepository,
        private commentsQRepository: CommentsQRepository,
        private postsRepository: PostsRepository,
        private usersExtQRepository: UsersExtQRepository,
        private likesRepository: LikesRepo
    ) {}

    async create(createCommentDto: CreateCommentDto) {
        const foundPost = await this.postsRepository.findById(createCommentDto.postId);

        if (!foundPost) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        const foundUser = await this.usersExtQRepository.findById(createCommentDto.userId);

        if (!foundUser) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'User not found'
            });
        }

        const createCommentDomainDto = {
            commentatorInfo: {
                userId: foundUser.userId,
                userLogin: foundUser.login
            },
            content: createCommentDto.content,
            postId: createCommentDto.postId,
            likesInfo: new likesInfo()
        };

        const newComment = this.commentModel.createInstance(createCommentDomainDto);
        await this.commentsRepository.save(newComment);
        return newComment._id.toString();
    }

    async findForPost(dto: { id: string; query: GetCommentsQueryParams; userId?: string }) {
        const post = await this.postsRepository.findById(dto.id);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }
        const comments = await this.commentsQRepository.findForPost(dto.id, dto.query);

        if (dto.userId) {
            for (let i = 0; i < comments.totalCount; i++) {
                const reaction = await this.likesRepository.ShowReactionForComment(dto.userId, comments.items[i].id);
                if (reaction) {
                    comments.items[i].likesInfo.myStatus = reaction.likeStatus;
                }
            }
        }

        return comments;
    }

    async findOne(dto: { id: string; userId?: string }) {
        const comment = await this.commentsQRepository.findOne(dto.id);
        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Comment not found'
            });
        }
        if (dto.userId) {
            const reaction = await this.likesRepository.ShowReactionForComment(dto.userId, comment.id);
            if (reaction) {
                comment.likesInfo.myStatus = reaction.likeStatus;
            }
        }
        return comment;
    }

    async update(dto: { id: string; updateCommentDto: UpdateCommentDto; userId: string }) {
        const comment = await this.commentsRepository.findById(dto.id);
        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Comment not found'
            });
        }
        const user = await this.usersExtQRepository.findById(dto.userId);
        if (user.userId !== comment.commentatorInfo.userId) {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'Access denied'
            });
        }
        comment.update(dto.updateCommentDto);
        await this.commentsRepository.save(comment);
        return comment._id.toString();
    }

    async remove(dto: { id: string; userId: string }) {
        const comment = await this.commentsRepository.findById(dto.id);
        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Comment not found'
            });
        }

        const user = await this.usersExtQRepository.findById(dto.userId);
        if (user.userId !== comment.commentatorInfo.userId) {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'Access denied'
            });
        }

        return await this.commentsRepository.delete(dto.id);
    }
}
