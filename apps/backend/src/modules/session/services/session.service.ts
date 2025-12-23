import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus, CartItem } from '../entities/session.entity';
import { PriceService } from '../../catalog/services/price.service';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(
        @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
        private readonly priceService: PriceService,
    ) { }

    async startSession(customerId: string, storeId: string): Promise<Session> {
        // 1. Check for Active Session
        const activeSession = await this.sessionRepo.findOne({
            where: { customerId, storeId, status: SessionStatus.ACTIVE },
        });

        if (activeSession) {
            throw new ConflictException(`User ${customerId} already has an active session in store ${storeId}`);
        }

        // 2. Create
        const session = this.sessionRepo.create({
            customerId,
            storeId,
            status: SessionStatus.ACTIVE,
            cart: [],
            total: 0,
        });

        return this.sessionRepo.save(session);
    }

    async addItem(sessionId: string, customerId: string, productCode: string, quantity: number): Promise<Session> {
        const session = await this.sessionRepo.findOne({ where: { id: sessionId, customerId } });
        if (!session) throw new NotFoundException('Session not found');
        if (session.status !== SessionStatus.ACTIVE) throw new BadRequestException('Session is not active');

        // Snapshot Price
        // Using 'Standard' as default price list for now
        const priceSnap = await this.priceService.getPrice(productCode, 'Standard');
        if (!priceSnap) throw new NotFoundException(`Price for ${productCode} not found`);

        const unitPrice = priceSnap.price;
        const totalPrice = unitPrice * quantity;

        // Update Cart
        const existingItemIndex = session.cart.findIndex(i => i.productCode === productCode);
        if (existingItemIndex > -1) {
            // Update existing
            const item = session.cart[existingItemIndex];
            item.quantity += quantity;
            item.totalPrice = item.quantity * item.unitPrice; // Maintain original unit price snapshot? Or update?
            // Decision: Always refresh unit price to latest snapshot on update
            item.unitPrice = unitPrice;
            item.totalPrice = item.quantity * unitPrice;
            item.addedAt = new Date().toISOString();
        } else {
            session.cart.push({
                productCode,
                productName: priceSnap.productName,
                quantity,
                unitPrice,
                totalPrice,
                addedAt: new Date().toISOString()
            });
        }

        this.recalculateTotal(session);
        return this.sessionRepo.save(session);
    }

    async closeSession(sessionId: string, customerId: string): Promise<Session> {
        const session = await this.sessionRepo.findOne({ where: { id: sessionId, customerId } });
        if (!session) throw new NotFoundException('Session not found');
        if (session.status !== SessionStatus.ACTIVE) throw new BadRequestException('Session is not active');

        if (session.cart.length === 0) throw new BadRequestException('Cannot close empty session');

        session.status = SessionStatus.CLOSED;
        return this.sessionRepo.save(session);
    }

    async getSession(sessionId: string): Promise<Session | null> {
        return this.sessionRepo.findOne({ where: { id: sessionId } });
    }

    private recalculateTotal(session: Session) {
        session.total = session.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    }
}
