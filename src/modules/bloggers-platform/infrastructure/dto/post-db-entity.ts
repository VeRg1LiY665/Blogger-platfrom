import { extendedLikesInfo } from '../../domain/extendedLikesInfo.schema';

export abstract class PostDbEntity {
    id: number;
    title: string;
    shortDescription: string;
    content: string;
    blogId: number;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: extendedLikesInfo;
}
