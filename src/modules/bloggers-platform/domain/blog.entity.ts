import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDto } from '../dto/create-blog.dto';

@Schema()
export class Blog {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true })
    websiteUrl: string;

    @Prop({ type: String, required: true })
    createdAt: string;

    @Prop({ type: Boolean, required: true, default: false })
    isMembership: boolean;

    get id() {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
        return this._id.toString();
    }

    static createInstance(dto: CreateBlogDomainDto): BlogDocument {
        const blog = new this();
        blog.name = dto.name;
        blog.description = dto.description;
        blog.websiteUrl = dto.websiteUrl;
        blog.createdAt = new Date().toISOString();
        return blog as BlogDocument;
    }

    update(dto: UpdateBlogDto) {
        this.name = dto.name;
        this.description = dto.description;
        this.websiteUrl = dto.websiteUrl;
    }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
