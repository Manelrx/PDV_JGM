import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SalesService } from './services/sales.service';
import { SalesController } from './controllers/sales.controller';
import { SessionModule } from '../session/session.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Sale]),
        SessionModule,
    ],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
