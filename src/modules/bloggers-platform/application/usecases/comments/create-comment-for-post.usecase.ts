import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CreateCommentDto } from '../../../dto/create-comment.dto';
import { LikesInfo } from '../../../domain/likesInfo.schema';
import { Comment } from '../../../domain/comment.entity';
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql.repository';
import { UsersExtSqlQRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class CreateCommentForPostCommand {
    constructor(public dto: CreateCommentDto) {}
}

/**
 * Создание коммента для поста пользователем
 */

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand, string> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private commentsSqlRepository: CommentsSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute({ dto }: CreateCommentForPostCommand): Promise<string> {
        const post = await this.postsSqlRepository.findById(dto.postId);
        if (!post) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Post not found'
            });
        }

        const foundUser = await this.usersExtSqlQRepository.findById(dto.userId);

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
            content: dto.content,
            postId: dto.postId,
            likesInfo: new LikesInfo()
        };

        const newComment = Comment.createInstance(createCommentDomainDto);
        const id = await this.commentsSqlRepository.save(newComment);

        return id.toString();
    }
}
