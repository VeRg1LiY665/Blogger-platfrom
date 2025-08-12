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
    likesCount: number = 0;

    dislikesCount: number = 0;

    myStatus: string = 'None';

    newestLikes: NewestLike[];
}

export const extendedLikesInfoSchema = SchemaFactory.createForClass(extendedLikesInfo);
