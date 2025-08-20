import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'passwordRecovery' })
export class PasswordRecovery {
    /*constructor() {
        this.recoveryCode = '';
        this.expirationDate = new Date();
    }*/
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '' })
    recoveryCode: string;

    @Column({ default: new Date() })
    expirationDate: Date;

    @OneToOne(() => User, (user) => user.passwordRecovery, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;
}
