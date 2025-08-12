import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UpdateCommentDto } from '../../../dto/update-comment.dto';
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql.repository';
import { UsersExtSqlQRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class UpdateCommentCommand {
    constructor(
        public dto: UpdateCommentDto,
        public userId: string,
        public id: string
    ) {}
}

/**
 * Обновление коммента пользователем
 */

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand, string> {
    constructor(
        private commentsSqlRepository: CommentsSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute({ dto, userId, id }: UpdateCommentCommand): Promise<string> {
        const comment = await this.commentsSqlRepository.findById(id);
        if (!comment) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Comment not found'
            });
        }
        const user = await this.usersExtSqlQRepository.findById(userId);
        if (user.userId !== comment.commentatorInfo.userId) {
            throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: 'Access denied'
            });
        }
        comment.update(dto);
        await this.commentsSqlRepository.save(comment);
        return comment.id.toString();
    }
}
