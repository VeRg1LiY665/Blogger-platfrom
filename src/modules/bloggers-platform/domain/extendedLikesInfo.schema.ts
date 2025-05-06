import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class NewestLike {
    constructor(
        public addedAt: string,
        public userId: string,
        public login: string
    ) {}
}

@Schema({
    _id: false
})
export class extendedLikesInfo {
    @Prop({ required: true, default: 0 })
    likesCount: number;

    @Prop({ required: true, default: 0 })
    dislikesCount: number;

    @Prop({ required: true, default: 'None' })
    myStatus: string;

    @Prop({
        required: true,
        default: [
            {
                addedAt: '', //Заглушка для последних лайков при создании поста
                userId: '',
                login: ''
            }
        ]
    })
    newestLikes: NewestLike[];
}

export const extendedLikesInfoSchema = SchemaFactory.createForClass(extendedLikesInfo);
