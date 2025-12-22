# Backend Finalization Plan

This plan focuses on replacing mocks with production-grade Redis logic and implementing operational tools for the DLQ.

## User Review Required
> [!IMPORTANT]
> **Redis Implementation**: We will use `ioredis`. The `IdempotencyGuard` will use `SET key value EX ttl NX` to ensure atomicity.
> **DLQ Operations**: A new `DlqController` will verify proper role-based access (admin only) in the future, but for now will expose `POST /admin/dlq/retry/:id` and `GET /admin/dlq`.

## Proposed Changes

### 1. Redis Integration (Atomic)
#### [MODIFY] apps/backend/package.json
- Add `ioredis` dependency.

#### [MODIFY] apps/backend/src/modules/common/services/cache.service.ts
- Replace Map with `ioredis` client.
- Implement `setNx` method using atomic Redis commands.

#### [MODIFY] apps/backend/src/modules/common/guards/idempotency.guard.ts
- Use `cacheService.setNx(key, 'PROCESSING', ttl)` to acquire lock.
- If returns `false` (key exists) -> Check status.
    - If `PROCESSING` -> Throw 409 (Conflict/Retry Later).
    - If `DONE` -> Return Cached Response.

### 2. DLQ Management API
#### [NEW] apps/backend/src/modules/erp/dlq.controller.ts
- `GET /admin/dlq`: List failed jobs.
- `POST /admin/dlq/:jobId/retry`: Re-inject job into Queue.

### 3. Advanced Tests
#### [NEW] apps/backend/src/modules/common/tests/idempotency-advanced.spec.ts
- **Scenario**: Out-of-order Webhook
    - Fire Webhook -> Lock acquired.
    - Simulate latency.
    - Fire duplicate Webhook -> Reject immediately.
- **Scenario**: Restart/Crash
    - Acquire Lock -> Crash (Test runner restart simulation) -> Lock expires (TTL) -> Retry succeeds.

## Verification Plan

### Automated Tests
- `npm run test` on `idempotency-advanced.spec.ts`.
