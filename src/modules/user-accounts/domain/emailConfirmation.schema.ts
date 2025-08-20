import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'emailConfirmation' })
export class EmailConfirmation {
    /* constructor() {
        this.confirmationCode = '';
        this.expirationDate = new Date();
        this.isConfirmed = false;
    }*/
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '' })
    confirmationCode: string;

    @Column({ default: new Date() })
    expirationDate: Date;

    @Column({ default: false })
    isConfirmed: boolean;

    @OneToOne(() => User, (user) => user.emailConfirmation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;
}
