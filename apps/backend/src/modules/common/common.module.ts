import { Module, Global } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { IdempotencyGuard } from './guards/idempotency.guard';

@Global()
@Module({
    providers: [CacheService, IdempotencyGuard],
    exports: [CacheService, IdempotencyGuard],
})
export class CommonModule { }
