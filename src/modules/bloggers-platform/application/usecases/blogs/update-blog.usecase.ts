import { UpdateBlogDto } from '../../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';

export class UpdateBlogCommand {
    constructor(public dto: UpdateBlogDto) {}
}

/**
 * Создание админом блога через админскую панель
 */

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand, void> {
    constructor(private blogsSqlRepository: BlogsSqlRepository) {}

    async execute({ dto }: UpdateBlogCommand): Promise<void> {
        const blog = await this.blogsSqlRepository.findById(dto.id);

        if (!blog) {
            throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: 'Blog not found'
            });
        }

        blog.update(dto);

        await this.blogsSqlRepository.save(blog);

        return;
    }
}
