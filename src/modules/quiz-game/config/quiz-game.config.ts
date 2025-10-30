import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class QuizGameConfig {
    @IsNotEmpty({
        message: 'Set Env variable QUESTIONS_LIMIT, examples: 1, 5, 20'
    })
    questionLimit: number;

    constructor(private configService: ConfigService<any, true>) {
        // Initialize properties in the constructor
        this.questionLimit = +this.configService.get('QUESTIONS_LIMIT');

        //then validate props
        configValidationUtility.validateConfig(this);
    }
}
