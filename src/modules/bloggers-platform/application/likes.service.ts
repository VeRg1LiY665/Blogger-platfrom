import { Injectable, NotFoundException } from '@nestjs/common';
import { LikesRepo } from '../infrastructure/likes.repository';
import { CreateLikeForCommentDto, CreateLikeForPostDto } from '../dto/create-like.dto';
import { Like, LikeModelType } from '../domain/like.entity';
import { NewestLike } from '../domain/extendedLikesInfo.schema';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { UsersExtQRepository } from '../../user-accounts/infrastructure/external-query/users.external-query-repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikesService {
    constructor(
        @InjectModel(Like.name)
        private likeModel: LikeModelType,
        private likesRepo: LikesRepo,
        //private commentsRepo: CommentsRepository,
        private postsRepo: PostsRepository,
        private UsersExtQRepository: UsersExtQRepository
    ) {}

    async createForPost(dto: CreateLikeForPostDto): Promise<void> {
        const post = await this.postsRepo.findById(dto.postId);
        if (!post) {
            throw new NotFoundException(`Post with postId ${dto.postId} not found`);
        }

        const reaction = await this.likesRepo.ShowReactionForPost(dto.parentId, dto.postId);
        if (!reaction) {
            const CreateLikeDto = {
                status: dto.likeStatus,
                userId: '',
                parentId: dto.parentId,
                commentId: '',
                postId: dto.postId,
                addedAt: new Date().toISOString()
            };

            const newReaction = this.likeModel.createInstance(CreateLikeDto);
            await this.likesRepo.save(newReaction);
        } else {
            reaction.status = dto.likeStatus;
            await this.likesRepo.save(reaction);
        }

        const lastLikes = await this.likesRepo.ShowLastReactionsForPost(dto.postId);

        if (lastLikes) {
            const newestLikes: NewestLike[] = [];
            for (let i = 0; i < lastLikes.length; i++) {
                const user = await this.UsersExtQRepository.findById(lastLikes[i].parentId);

                if (user !== null) {
                    newestLikes[i] = new NewestLike(lastLikes[i].addedAt, lastLikes[i].parentId, user.login);
                }
            }
            post.extendedLikesInfo.newestLikes = newestLikes;
        }

        const { likes, dislikes } = await this.likesRepo.CountReactionsForPost(post._id.toString());

        post.extendedLikesInfo.likesCount = likes;
        post.extendedLikesInfo.dislikesCount = dislikes;

        await this.postsRepo.save(post);

        return;
    }

    async createForComment(dto: CreateLikeForCommentDto): Promise<void> {}
}
