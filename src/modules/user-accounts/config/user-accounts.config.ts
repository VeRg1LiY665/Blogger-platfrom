import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class UserAccountsConfig {
    @IsNotEmpty({
        message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d'
    })
    accessTokenExpireIn: string;

    @IsNotEmpty({
        message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d'
    })
    refreshTokenExpireIn: string;

    @IsNotEmpty({
        message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!'
    })
    refreshTokenSecret: string;

    @IsNotEmpty({
        message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!'
    })
    accessTokenSecret: string;

    constructor(private configService: ConfigService<any, true>) {
        // Initialize properties in the constructor
        this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
        this.refreshTokenExpireIn = this.configService.get('REFRESH_TOKEN_EXPIRE_IN');
        this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
        this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');

        //then validate props
        configValidationUtility.validateConfig(this);
    }
}
