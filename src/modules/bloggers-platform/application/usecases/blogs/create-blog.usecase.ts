import { CreateBlogDto } from '../../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog } from '../../../domain/blog.entity';
import { BlogsSqlRepository } from '../../../infrastructure/blogs-sql.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class CreateBlogCommand {
    constructor(public dto: CreateBlogDto) {}
}

/**
 * Создание админом блога через админскую панель
 */

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand, string> {
    constructor(private blogsSqlRepository: BlogsSqlRepository) {}

    async execute({ dto }: CreateBlogCommand): Promise<string> {
        /*const blog = await this.blogsSqlRepository.findByName(dto.name);
        if (blog) {
            throw new DomainException({
                code: DomainExceptionCode.BadRequest,
                message: 'Blog already exists'
            });
        }*/ //TODO ask for uniqueness check

        const newBlog = Blog.createInstance({
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl
        });
        const id: string = await this.blogsSqlRepository.save(newBlog);

        return id;
    }
}
