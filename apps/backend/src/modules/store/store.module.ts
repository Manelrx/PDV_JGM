import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { PriceTable } from './price-table.entity';
import { PriceService } from './price.service';

@Module({
    imports: [TypeOrmModule.forFeature([Store, PriceTable])],
    providers: [PriceService],
    exports: [PriceService],
})
export class StoreModule { }
