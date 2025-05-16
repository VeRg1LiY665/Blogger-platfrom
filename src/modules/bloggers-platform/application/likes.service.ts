import { Injectable, NotFoundException } from '@nestjs/common';
import { LikesRepo } from '../infrastructure/likes.repository';
import { PostsExtRepository } from '../infrastructure/external/posts.external-repository';
import { CreateLikeForCommentDto, CreateLikeForPostDto } from '../dto/create-like.dto';
import { LikeDocument, LikeModelType } from '../domain/like.entity';
import { NewestLike } from '../domain/extendedLikesInfo.schema';

@Injectable()
export class LikesService {
    constructor(
        private likeModel: LikeModelType,
        protected likesRepo: LikesRepo,
        protected commentsRepo: CommentsRepo,
        protected postsExtRepo: PostsExtRepository,
        protected usersRepo: UsersRepo
    ) {}

    async createForPost(dto: CreateLikeForPostDto): Promise<void> {
        const post = await this.postsExtRepo.findById(dto.postId);
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
            const newestLikes = [];
            for (let i = 0; i < lastLikes.length; i++) {
                const user = await this.usersRepo.ShowUser(lastLikes[i].parentId);

                if (user !== null) {
                    newestLikes[i] = new NewestLike(lastLikes[i].addedAt, lastLikes[i].parentId, user.login);
                }
            }
            post.extendedLikesInfo.newestLikes = newestLikes;
        }

        const { likes, dislikes } = await this.likesRepo.CountReactionsForPost(post._id.toString());

        post.extendedLikesInfo.likesCount = likes;
        post.extendedLikesInfo.dislikesCount = dislikes;

        await this.postsExtRepo.save(post);

        return;
    }

    async createForComment(dto: CreateLikeForCommentDto): Promise<void> {}
}
