import { Module } from '@nestjs/common';
import { CommentsService } from '../modules/bloggers-platform/application/comments.service';
import { CommentsController } from '../modules/bloggers-platform/api/comments.controller';

@Module({
    controllers: [CommentsController],
    providers: [CommentsService]
})
export class CommentsModule {}
