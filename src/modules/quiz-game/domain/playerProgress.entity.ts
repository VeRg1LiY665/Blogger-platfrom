import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Answer } from './answers.entity';
import { GameEntity } from './game.entity';

@Entity({ name: 'playersProgress' })
export class PlayerProgress {
    constructor(
        public userId: string,
        public userLogin: string
    ) {
        this.playerId = userId;
        this.playerLogin = userLogin;
        this.playerScore = 0;
    }
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(() => Answer, (answer) => answer.playerProgress, { cascade: true })
    answers: Answer[];

    @Column()
    playerId: string;

    @Column()
    playerLogin: string;

    @Column()
    playerScore: number;

    @ManyToOne(() => GameEntity, (gameEntity) => gameEntity.playerProgress)
    gameEntity: GameEntity;
}
