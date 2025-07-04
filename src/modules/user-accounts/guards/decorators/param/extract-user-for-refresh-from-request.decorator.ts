import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshContextDto } from '../../dto/refresh-context.dto';

export const ExtractUserForRefreshFromRequest = createParamDecorator(
    (data: unknown, context: ExecutionContext): RefreshContextDto => {
        const request = context.switchToHttp().getRequest();

        const user = request.user;

        if (!user) {
            throw new Error('there is no user in the request object!');
        }

        return user;
    }
);
