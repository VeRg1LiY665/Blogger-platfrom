import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({})
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
        //@ts-ignore
        return this._id.toString();
    }

    static createInstance(dto: any): BlogDocument {
        const blog = new this();
        blog.name = dto.name;
        blog.description = dto.description;
        blog.websiteUrl = dto.websiteUrl;
        blog.createdAt = new Date().toISOString();
        return blog as BlogDocument;
    }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;
