import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostForBlogCommand {
    constructor(
        public blogId: string,
        public postId: string
    ) {}
}

/**
 * Создание админом поста через админскую панель
 */

@CommandHandler(DeletePostForBlogCommand)
export class DeletePostForBlogUseCase implements ICommandHandler<DeletePostForBlogCommand, void> {
    constructor(
        private postsSqlRepository: PostsSqlRepository,
        private blogsSqlRepository: BlogsSqlRepository
    ) {}

    async execute({ blogId, postId }: DeletePostForBlogCommand): Promise<void> {
        const blog = await this.blogsSqlRepository.findById(blogId);
        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        return await this.postsSqlRepository.delete(postId);
    }
}
