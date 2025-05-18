import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from '../../../comments/dto/create-comment.dto';
import { UpdateCommentDto } from '../../../comments/dto/update-comment.dto';

@Injectable()
export class CommentsService {
    create(createCommentDto: CreateCommentDto) {
        return 'This action adds a new comment';
    }

    findAll() {
        return `This action returns all comments`;
    }

    findOne(id: string) {
        return `This action returns a #${id} comment`;
    }

    update(id: string, updateCommentDto: UpdateCommentDto) {
        return `This action updates a #${id} comment`;
    }

    remove(id: string) {
        return `This action removes a #${id} comment`;
    }
}
