import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { HydratedDocument, Model } from 'mongoose';

@Schema()
export class Like {
    @Prop({ type: String, required: true })
    status: string;

    @Prop({ type: String, required: true, default: '' })
    userId: string;

    @Prop({ type: String, required: true })
    parentId: string;

    @Prop({ type: String, required: true, default: '' })
    commentId: string;

    @Prop({ type: String, required: true, default: '' })
    postId: string;

    @Prop({ type: String, required: true })
    addedAt: string;

    static createInstance(dto: CreateLikeDomainDto): LikeDocument {
        const like = new this();
        like.status = dto.status;
        like.userId = dto.userId;
        like.parentId = dto.parentId;
        like.commentId = dto.commentId;
        like.postId = dto.postId;
        like.addedAt = new Date().toISOString();
        return like as LikeDocument;
    }

    static update() {}
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
