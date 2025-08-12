import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false
})
export class likesInfo {
    likesCount: number = 0;

    dislikesCount: number = 0;

    myStatus: string = 'None';
}

export const likesInfoSchema = SchemaFactory.createForClass(likesInfo);
