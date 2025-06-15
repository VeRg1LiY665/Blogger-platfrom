import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false
})
export class emailConfirmation {
    @Prop({ type: String, required: true })
    confirmationCode: string;

    @Prop({ type: Date, required: true })
    expirationDate: Date;

    @Prop({ type: Boolean, required: true })
    isConfirmed: boolean;
}

export const emailConfirmationSchema = SchemaFactory.createForClass(emailConfirmation);
