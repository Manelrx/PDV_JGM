import { Injectable, BadRequestException } from '@nestjs/common';
import { PriceService } from '../store/price.service';

@Injectable()
export class SalesService {
    constructor(
        private readonly priceService: PriceService,
    ) { }

    async addItemToSession(sessionId: string, storeId: string, barcode: string, quantity: number) {
        // INVARIANT: Backend calculates price. Never trust client total.
        const { price, version } = await this.priceService.getPrice(storeId, barcode);

        const lineTotal = price * quantity;

        // Logic to persist LineItem to DB would go here...
        // await this.lineItemRepo.save({ ..., priceSnapshot: price, priceVersion: version, total: lineTotal });

        return {
            success: true,
            added: {
                barcode,
                price,
                quantity,
                total: lineTotal,
                version
            }
        };
    }
}
