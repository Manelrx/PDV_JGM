import { Injectable, CanActivate, ExecutionContext, ConflictException } from '@nestjs/common';
import { CacheService } from '../services/cache.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IdempotencyGuard implements CanActivate {
    constructor(
        private readonly cacheService: CacheService,
        private readonly reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const key = request.headers['x-idempotency-key'] || request.body.idempotencyKey;

        if (!key) return true; // Not an idempotent request context

        const cacheKey = `IDEMPOTENCY:${key}`;
        const cachedResponse = await this.cacheService.get(cacheKey);

        if (cachedResponse) {
            throw new ConflictException('Request already processed. (Idempotency)');
            // In a real implementation, we would return the CACHED response, 
            // but for this guard we just block execution to protect the handler.
            // An Interceptor is better suited to return the actual cached response.
        }

        // Lock (atomic placeholder)
        await this.cacheService.set(cacheKey, { status: 'PROCESSING' }, 600);

        return true;
    }
}
