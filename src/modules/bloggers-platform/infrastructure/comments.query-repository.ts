import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModeltype } from '../domain/comment.entity';
import { NotFoundException } from '@nestjs/common';
import { CommentViewDto } from '../api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';

export class CommentsQRepository {
    constructor(@InjectModel(Comment.name) private commentModel: CommentModeltype) {}

    async findForPost(postId: string, query: GetCommentsQueryParams): Promise<PaginatedViewDto<CommentViewDto[]>> {
        const comments = await this.commentModel
            .find({ postId: postId })
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);

        const totalCount = await this.commentModel.countDocuments({ postId: postId });

        const items = comments.map((x) => CommentViewDto.mapToView(x));

        return PaginatedViewDto.mapToView({
            items,
            totalCount,
            page: query.pageNumber,
            size: query.pageSize
        });
    }

    async findOne(id: string): Promise<CommentViewDto> {
        const comment = await this.commentModel.findOne({
            _id: id
        });

        if (!comment) {
            throw new NotFoundException('No post found');
        }

        return CommentViewDto.mapToView(comment);
    }
}
