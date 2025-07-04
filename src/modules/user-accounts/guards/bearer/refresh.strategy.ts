import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { RefreshContextDto } from '../dto/refresh-context.dto';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies['refreshToken']]), // Extract token from cookie
            ignoreExpiration: false,
            secretOrKey: 'pokjcleYm&hd93g1!' //TODO: move to env. will be in the following lessons
        });
    }

    /**
     * функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
     * @param payload
     */
    async validate(payload: RefreshContextDto): Promise<RefreshContextDto> {
        return payload;
    }
}
