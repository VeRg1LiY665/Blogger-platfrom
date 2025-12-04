import { Injectable } from '@nestjs/common';
import { GameViewDto } from '../view-dto/game.view-dto';

@Injectable()
export class GameViewFactory {
    constructor(private readonly questionLimit: number) {}

    /*async create(): Promise<GameViewDto> {
        const res = await new GameViewDto(this.questionLimit);
        return res;
    }*/
}
