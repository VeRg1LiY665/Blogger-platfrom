import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';

export class DeleteBlogCommand {
    constructor(public id: string) {}
}

/**
 * Создание админом блога через админскую панель
 */

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand, void> {
    constructor(private blogsSqlRepository: BlogsSqlRepository) {}

    async execute({ id }: DeleteBlogCommand): Promise<void> {
        const blog = await this.blogsSqlRepository.findById(id);

        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        return await this.blogsSqlRepository.delete(id);
    }
}
