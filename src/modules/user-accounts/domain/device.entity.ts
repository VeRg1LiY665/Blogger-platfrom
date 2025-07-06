import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateDeviceDomainDto } from './dto/CreateDeviceDomainDto';

@Schema({ timestamps: false })
export class SecurityDevice {
    @Prop({ type: Types.ObjectId, required: true })
    userId: string;
    @Prop({ type: String, required: true })
    title: string;
    @Prop({ type: String, required: true })
    ip: string;
    @Prop({ type: Number, required: true })
    iat: number;

    static createInstance(dto: CreateDeviceDomainDto): SecurityDeviceDocument {
        const securityDevice = new this();
        securityDevice.userId = dto.userId;
        securityDevice.title = dto.title;
        securityDevice.iat = dto.iat;
        securityDevice.ip = dto.ip;

        return securityDevice as SecurityDeviceDocument;
    }

    updateInstance(iat: number) {
        //updates iat for device in case of token refresh
        this.iat = iat;
    }
}

export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);

SecurityDeviceSchema.loadClass(SecurityDevice);

export type SecurityDeviceDocument = HydratedDocument<SecurityDevice>;

export type SecurityDeviceModelType = Model<SecurityDeviceDocument> & typeof SecurityDevice;
