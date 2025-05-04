import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';

export class BlogsRepository {
    constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

    async findById(id: string): Promise<BlogDocument | null> {
        const result = await this.blogModel.findOne({
            _id: id
        });

        return result;
    }

    async save(blog: BlogDocument): Promise<void> {
        await blog.save();
    }

    async delete(id: string): Promise<void> {
        //TODO Soft delete?
        await this.blogModel.deleteOne({
            _id: id
        });

        return;
    }
}
