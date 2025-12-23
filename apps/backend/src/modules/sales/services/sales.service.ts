import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sale, SaleStatus } from '../entities/sale.entity';
import { SessionService } from '../../session/services/session.service';
import { SessionStatus } from '../../session/entities/session.entity';

@Injectable()
export class SalesService {
    private readonly logger = new Logger(SalesService.name);

    constructor(
        @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
        private readonly sessionService: SessionService,
        private readonly dataSource: DataSource,
    ) { }

    async createSaleFromSession(sessionId: string, userId: string): Promise<Sale> {
        // Transactional Lock
        return this.dataSource.transaction(async (manager) => {
            // 1. Fetch Session (Locked? For now, standard fetch, relying on Status check)
            // Accessing Session via Service restricted to public API. 
            // Better: We need access to Entity or a specialized method in SessionService.
            // For MVP: We assume SessionService exposes methods or we reuse Repository pattern if strictly needed,
            // but plan said "Prefer accessing Sessions via SessionService".
            // So we call a method. We might need to add `getSession` to SessionService.
            const session = await this.sessionService.getSession(sessionId);

            if (!session) throw new NotFoundException('Session not found');
            if (session.customerId !== userId) throw new BadRequestException('Session belongs to another user');

            // 2. Validate Status
            if (session.status !== SessionStatus.CLOSED) {
                throw new BadRequestException(`Session must be CLOSED to convert to Sale. Current: ${session.status}`);
            }

            // 3. Idempotency Check
            const existingSale = await manager.findOne(Sale, { where: { sessionId } });
            if (existingSale) {
                return existingSale;
            }

            // 4. Create Snapshot
            const sale = manager.create(Sale, {
                sessionId: session.id,
                storeId: session.storeId,
                customerId: session.customerId,
                total: session.total,
                status: SaleStatus.CREATED,
                items: JSON.parse(JSON.stringify(session.cart)), // Deep Copy Snapshot
            });

            const savedSale = await manager.save(Sale, sale);
            this.logger.log(`Sale ${savedSale.id} created from Session ${sessionId}`);
            return savedSale;
        });
    }

    async getSale(saleId: string, userId: string): Promise<Sale> {
        const sale = await this.saleRepo.findOne({ where: { id: saleId } });
        if (!sale) throw new NotFoundException('Sale not found');
        if (sale.customerId !== userId) throw new BadRequestException('Access denied');
        return sale;
    }
}
