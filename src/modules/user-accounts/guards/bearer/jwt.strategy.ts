import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserContextDto } from '../dto/user-context.dto';
import { UserAccountsConfig } from '../../config/user-accounts.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(userAccountsConfig: UserAccountsConfig) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: userAccountsConfig.accessTokenSecret
        });
    }

    /**
     * функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
     * @param payload
     */
    async validate(payload: UserContextDto): Promise<UserContextDto> {
        //NOTE! types are not working in runtime - strategy extracts the whole payload
        return payload;
    }
}
