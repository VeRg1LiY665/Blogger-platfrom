import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';
import { extendedLikesInfo, extendedLikesInfoSchema } from './extendedLikesInfo.schema';

@Schema()
export class Post {
    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    shortDescription: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: String, required: true })
    blogId: string;

    @Prop({ type: String, required: true })
    blogName: string;

    @Prop({ type: String, required: true })
    createdAt: string;

    @Prop({ type: extendedLikesInfoSchema })
    extendedLikesInfo: extendedLikesInfo;

    static createInstance(dto: CreatePostDomainDto): PostDocument {
        const post = new this();
        post.title = dto.title;
        post.shortDescription = dto.shortDescription;
        post.content = dto.content;
        post.createdAt = new Date().toISOString();
        post.blogId = dto.blogId;
        post.blogName = dto.blogName;
        return post as PostDocument;
    }

    update(dto: UpdatePostDomainDto) {
        this.title = dto.title;
        this.shortDescription = dto.shortDescription;
        this.content = dto.content;
        this.blogId = dto.blogId;
    }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
