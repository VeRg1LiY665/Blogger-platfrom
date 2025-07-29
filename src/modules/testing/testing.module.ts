import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { DatabaseModule } from '../../database/database.modules';

@Module({
    imports: [DatabaseModule],
    controllers: [TestingController]
})
export class TestingModule {}
