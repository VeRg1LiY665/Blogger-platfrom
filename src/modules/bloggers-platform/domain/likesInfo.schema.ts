import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false
})
export class likesInfo {
    @Prop({ type: Number, required: true, default: 0 })
    likesCount: number;

    @Prop({ type: Number, required: true, default: 0 })
    dislikesCount: number;

    @Prop({ required: true, default: 'None' })
    myStatus: string;
}

export const likesInfoSchema = SchemaFactory.createForClass(likesInfo);
