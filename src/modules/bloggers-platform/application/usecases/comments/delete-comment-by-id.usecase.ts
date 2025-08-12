import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlRepository } from '../../../infrastructure/comments.sql.repository';
import { UsersExtSqlQRepository } from '../../../../user-accounts/infrastructure/external-query/users.external-sql-query-repository';

export class DeleteCommentCommand {
    constructor(
        public userId: string,
        public id: string
    ) {}
}

/**
 * Удаление коммента пользователем
 */

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand, void> {
    constructor(
        private commentsSqlRepository: CommentsSqlRepository,
        private usersExtSqlQRepository: UsersExtSqlQRepository
    ) {}

    async execute({ userId, id }: DeleteCommentCommand): Promise<void> {
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

        return await this.commentsSqlRepository.delete(id);
    }
}
