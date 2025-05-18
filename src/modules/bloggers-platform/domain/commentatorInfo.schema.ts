import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false
})
export class commentatorInfo {
    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    userLogin: string;
}

export const commentatorInfoSchema = SchemaFactory.createForClass(commentatorInfo);
