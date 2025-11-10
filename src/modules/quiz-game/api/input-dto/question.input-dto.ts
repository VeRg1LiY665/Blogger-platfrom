import { ArrayMinSize, IsArray, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class QuestionInputDto {
    @IsString()
    @Trim()
    @Length(10, 500)
    body: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    correctAnswers: string[];
}
