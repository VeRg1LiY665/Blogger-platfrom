import { CreateLikeForPostDto } from '../../../dto/create-like.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Like } from '../../../domain/like.entity';
import { NewestLike } from '../../../domain/extendedLikesInfo.schema';
import { LikesSqlRepository } from '../../../infrastructure/likes.sql.repository';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';
import { UsersExtSqlQRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class CreateReactionForPostCommand {
    constructor(public dto: CreateLikeForPostDto) {}
}

/**
 * Создание лайка/дизлайка поста пользователем
 */

@CommandHandler(CreateReactionForPostCommand)
export class CreateReactionForPostUseCase implements ICommandHandler<CreateReactionForPostCommand, void> {
    constructor(
        private likesSqlRepository: LikesSqlRepository,
        private postsSqlRepository: PostsSqlRepository
        //private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute({ dto }: CreateReactionForPostCommand): Promise<void> {
        const post = await this.postsSqlRepository.findById(dto.postId);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        const reaction = await this.likesSqlRepository.ShowReactionForPost(dto.parentId, dto.postId);
        if (!reaction) {
            const CreateLikeDto = {
                status: dto.likeStatus,
                userId: '',
                parentId: dto.parentId,
                commentId: '',
                postId: dto.postId,
                addedAt: new Date().toISOString()
            };

            const newReaction = Like.createInstance(CreateLikeDto);
            await this.likesSqlRepository.save(newReaction);
        } else {
            reaction.likeStatus = dto.likeStatus;
            await this.likesSqlRepository.save(reaction);
        }

        /* const lastLikes = await this.likesSqlRepository.ShowLastLikesForPost(dto.postId);

        if (lastLikes) {
            const newestLikes: NewestLike[] = [];
            for (let i = 0; i < lastLikes.length; i++) {
                const user = await this.usersExtSqlQRepository.findById(lastLikes[i].parentId);

                if (user !== null) {
                    newestLikes[i] = new NewestLike(lastLikes[i].addedAt, lastLikes[i].parentId, user.login);
                }
            }

            post.extendedLikesInfo.newestLikes = newestLikes;
        }*/

        const { likes, dislikes } = await this.likesSqlRepository.CountReactionsForPost(post.id.toString());

        post.extendedLikesInfo.likesCount = likes;
        post.extendedLikesInfo.dislikesCount = dislikes;

        await this.postsSqlRepository.save(post);

        return;
    }
}
