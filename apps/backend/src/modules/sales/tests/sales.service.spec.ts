import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../services/sales.service';
import { Sale, SaleStatus } from '../entities/sale.entity';
import { SessionService } from '../../session/services/session.service';
import { SessionStatus } from '../../session/entities/session.entity';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockSaleRepo = {
    findOne: jest.fn(),
};

const mockSessionService = {
    getSession: jest.fn(),
};

const mockManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};

const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockManager)),
};

describe('SalesService', () => {
    let service: SalesService;
    let dataSource: any;
    let sessionService: any;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesService,
                {
                    provide: getRepositoryToken(Sale),
                    useValue: mockSaleRepo,
                },
                {
                    provide: SessionService,
                    useValue: mockSessionService,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<SalesService>(SalesService);
        dataSource = module.get<DataSource>(DataSource);
        sessionService = module.get<SessionService>(SessionService);
    });

    describe('createSaleFromSession', () => {
        it('should create a sale from a CLOSED session', async () => {
            const session = {
                id: 's1',
                storeId: 'store1',
                customerId: 'u1',
                status: SessionStatus.CLOSED,
                total: 100,
                cart: [{ productCode: 'P1', quantity: 1, totalPrice: 100 }]
            };
            sessionService.getSession.mockResolvedValue(session);
            mockManager.findOne.mockResolvedValue(null); // No existing sale

            const newSale = { id: 'sale1', status: SaleStatus.CREATED };
            mockManager.create.mockReturnValue(newSale);
            mockManager.save.mockResolvedValue(newSale);

            const result = await service.createSaleFromSession('s1', 'u1');

            expect(sessionService.getSession).toHaveBeenCalledWith('s1');
            expect(mockManager.create).toHaveBeenCalledWith(Sale, expect.objectContaining({
                sessionId: 's1',
                status: SaleStatus.CREATED,
                total: 100,
            }));
            expect(result).toEqual(newSale);
        });

        it('should throw BadRequest if session is not CLOSED', async () => {
            const session = { id: 's1', customerId: 'u1', status: SessionStatus.ACTIVE };
            sessionService.getSession.mockResolvedValue(session);

            await expect(service.createSaleFromSession('s1', 'u1')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequest if user does not own session', async () => {
            const session = { id: 's1', customerId: 'other_user' };
            sessionService.getSession.mockResolvedValue(session);

            await expect(service.createSaleFromSession('s1', 'u1')).rejects.toThrow(BadRequestException);
        });

        it('should return existing sale if idempotent', async () => {
            const session = { id: 's1', customerId: 'u1', status: SessionStatus.CLOSED };
            sessionService.getSession.mockResolvedValue(session);
            const existingSale = { id: 'existing' };
            mockManager.findOne.mockResolvedValue(existingSale);

            const result = await service.createSaleFromSession('s1', 'u1');

            expect(result).toEqual(existingSale);
            expect(mockManager.create).not.toHaveBeenCalled();
        });
    });
});
