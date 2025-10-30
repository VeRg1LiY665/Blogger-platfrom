import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Answer } from './answers.entity';
import { GameEntity } from './game.entity';
import { randomUUID } from 'node:crypto';
import { CreatePlayerProgressDomainDto } from './dto/create-player-progress.domain.dto';

@Entity({ name: 'playersProgress' })
export class PlayerProgress {
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
    @JoinColumn({ name: 'gameEntityId' })
    gameEntity: GameEntity;

    @Column()
    gameEntityId: string;

    static createInstance(dto: CreatePlayerProgressDomainDto) {
        const newInstanse = new this();

        newInstanse.id = randomUUID();
        newInstanse.playerId = dto.userId;
        newInstanse.playerLogin = dto.userLogin;
        newInstanse.gameEntityId = dto.gameId;
        newInstanse.playerScore = 0;

        return newInstanse;
    }
}
