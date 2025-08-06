import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { RefreshContextDto } from '../dto/refresh-context.dto';
import { UserAccountsConfig } from '../../config/user-accounts.config';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(userAccountsConfig: UserAccountsConfig) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies['refreshToken']]), // Extract token from cookie
            ignoreExpiration: false,
            secretOrKey: userAccountsConfig.refreshTokenSecret
        });
    }

    /**
     * функция принимает payload из refresh jwt токена и возвращает то, что впоследствии будет записано в req.user
     * @param payload
     */
    async validate(payload: RefreshContextDto): Promise<RefreshContextDto> {
        return payload;
    }
}
