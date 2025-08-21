import { CreateDeviceDomainDto } from './dto/CreateDeviceDomainDto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'devices' })
export class SecurityDevice {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.devices)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column()
    title: string;

    @Column()
    ip: string;

    @Column({ type: 'bigint' }) //REMEMBER postgres casts int to string if using bigint type
    iat: number;

    static createInstance(dto: CreateDeviceDomainDto): SecurityDevice {
        const securityDevice = new this();
        securityDevice.userId = +dto.userId;
        securityDevice.title = dto.title;
        securityDevice.iat = dto.iat;
        securityDevice.ip = dto.ip;

        return securityDevice;
    }

    updateInstance(iat: number) {
        //updates iat for device in case of token refresh
        this.iat = iat;
    }
}
