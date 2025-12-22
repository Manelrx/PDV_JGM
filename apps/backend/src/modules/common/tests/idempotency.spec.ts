import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyGuard } from '../../guards/idempotency.guard';
import { CacheService } from '../../services/cache.service';
import { ExecutionContext, ConflictException } from '@nestjs/common';

describe('IdempotencyGuard', () => {
    let guard: IdempotencyGuard;
    let cacheService: CacheService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IdempotencyGuard,
                CacheService,
            ],
        }).compile();

        guard = module.get<IdempotencyGuard>(IdempotencyGuard);
        cacheService = module.get<CacheService>(CacheService);
    });

    it('should return TRUE for new request (First execution)', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { 'x-idempotency-key': 'uuid-123' },
                    body: {},
                }),
            }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should THROW ConflictException for duplicate request (Replay)', async () => {
        // 1. Setup Cache State (Already Processed)
        await cacheService.set('IDEMPOTENCY:uuid-duplicate', { status: 'DONE' }, 600);

        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: { 'x-idempotency-key': 'uuid-duplicate' },
                    body: {},
                }),
            }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(ConflictException);
    });

    it('should IGNORE request without idempotency key', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {}, // No key
                    body: {},
                }),
            }),
        } as unknown as ExecutionContext;

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });
});
