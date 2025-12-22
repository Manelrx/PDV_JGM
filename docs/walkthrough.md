# Backend Orchestrator Implementation (Hardening Phase)

We have successfully implemented the core domain logic and strengthened it with critical resilience patterns.

## 1. Resilience & Hardening
- **Idempotency Guard**: `IdempotencyGuard` implemented in `CommonModule`. Uses atomic cache locks (simulated) to prevent duplicate processing of Webhooks and Offline Syncs.
- **Strict Price Contract**: `PriceService` now returns strict DTOs including `generatedAt` timestamp for audit precision.
- **Backend Invariant**: `SalesService` enforces that **only** the backend calculates totals, never fulfilling a client-provided total.
- **ERP Queue**: strategies defined for BullMQ with **5 exponential retries** and **Manual DLQ Policy**.

## 2. Core Modules
- **Sales State Machine**: Strict transitions (`PAGA` -> `CANCELADA` prohibited).
- **Price Module**: Resolves per-store pricing versions.

## 3. Database & Infrastructure
- **TypeORM** configured with PostgreSQL in `database.config.ts`.
- **Infrastructure**: Docker Compose ready for Postgres + Redis.

## Logic Verification
- **Automated Tests**:
    - `sales.state-machine.spec.ts`: Validates strict transitions.
    - `idempotency.spec.ts`: Validates race condition handling and duplicate prevention.
