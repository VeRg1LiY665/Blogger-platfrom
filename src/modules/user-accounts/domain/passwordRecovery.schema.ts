import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false
})
export class passwordRecovery {
    @Prop({ type: String, required: true })
    recoveryCode: string;

    @Prop({ type: Date, required: true })
    expirationDate: Date;
}

export const passwordRecoverySchema = SchemaFactory.createForClass(passwordRecovery);
