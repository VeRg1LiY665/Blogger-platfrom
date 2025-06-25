import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';

@Schema()
export class Like {
    @Prop({
        type: String,
        required: true,
        enum: {
            values: ['Like', 'Dislike', 'None'],
            message: 'likeStatus {VALUE} is not supported'
        }
    })
    likeStatus: string;

    @Prop({
        type: String,
        required: function isFieldRequired() {
            return typeof this.userId === 'string' ? false : true; //for passing empty string validation
        }
    })
    userId: string;

    @Prop({ type: String, required: true })
    parentId: string;

    @Prop({
        type: String,
        required: function isFieldRequired() {
            return typeof this.commentId === 'string' ? false : true;
        }
    })
    commentId: string;

    @Prop({
        type: String,
        required: function isFieldRequired() {
            return typeof this.postId === 'string' ? false : true;
        }
    })
    postId: string;

    @Prop({ type: String, required: true })
    addedAt: string;

    static createInstance(dto: CreateLikeDomainDto): LikeDocument {
        const like = new this();
        like.likeStatus = dto.status;
        like.userId = dto.userId;
        like.parentId = dto.parentId;
        like.commentId = dto.commentId;
        like.postId = dto.postId;
        like.addedAt = new Date().toISOString();
        return like as LikeDocument;
    }

    update(dto: UpdateLikeDomainDto) {
        this.likeStatus = dto.likeStatus;
    }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
