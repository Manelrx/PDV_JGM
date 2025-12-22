import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceTable } from './price-table.entity';
import { Store } from './store.entity';

@Injectable()
export class PriceService {
    constructor(
        @InjectRepository(PriceTable)
        private readonly priceRepo: Repository<PriceTable>,
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
    ) { }

    async getPrice(storeId: string, barcode: string): Promise<{ price: number; version: string }> {
        // 1. Validate Store
        const store = await this.storeRepo.findOne({ where: { id: storeId, isActive: true } });
        if (!store) {
            throw new NotFoundException(`Store ${storeId} not found or inactive.`);
        }

        // 2. Find Active Price
        // Logic: Get the latest version valid for now
        const now = new Date();

        // Simple logic: Find exact match. 
        // In production, might want 'validFrom <= now' AND ('validTo >= now' OR null)
        const priceEntry = await this.priceRepo.findOne({
            where: {
                store: { id: storeId },
                barcode: barcode,
            },
            order: { validFrom: 'DESC' }, // Get most recent
        });

        if (!priceEntry) {
            throw new NotFoundException(`Price for product ${barcode} not found in store ${storeId}.`);
        }

        return {
            price: priceEntry.price,
            version: priceEntry.version,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            currency: 'BRL',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            validUntil: priceEntry.validTo || new Date(now.getTime() + 1000 * 60 * 60 * 24),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            generatedAt: now,
        };
    }
}
