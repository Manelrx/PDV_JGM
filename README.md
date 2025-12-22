# PDV JGM - Autonomous Mini Market System

## Project Overview
This project is an **Autonomous Mini Market System** for residential condominiums. It consists of a Mobile App (Scan & Go), an Offline-First PDV (Totem), and a Backend Orchestrator that ensures strict financial consistency and integrates with ERPNext.

## Architecture
The system follows a strict orchestrator-based architecture where the Backend is the single source of truth for prices and sales states.
- **Architecture Design**: [docs/architecture_design.md](./docs/architecture_design.md)
- **Repo Structure**: Monorepo managed by `pnpm` and `Turborepo`.

## Directory Layout
```
/
├── apps/
│   ├── backend/    (NestJS)
│   ├── mobile/     (Expo React Native - Stub)
│   └── pdv/        (Vite React + Electron - Stub)
├── packages/
│   ├── types/      (Shared Interfaces)
│   └── config/     (Shared Configs)
├── docs/           (Project Plans & Artifacts)
└── docker-compose.yml (Local Infrastructure)
```

## Current Status
We are in **Phase 1 (Finalization)**.
- **Backend**: Core Implemented (NestJS + Postgres).
- **Sales State Machine**: Strict implementation with TDD verification.
- **Price Engine**: Multi-store versioning implemented.
- **Hardening**: Idempotency Guard (Mocked Cache) and ERP Queue Strategy defined.

**Pending Steps (Immediate)**:
1.  **Redis Intergration**: Replace simulated Cache with `ioredis` for `SETNX` atomicity.
2.  **DLQ API**: Implement Endpoint for Manual Dead Letter Queue Management.
3.  **Frontend**: Begin implementation of Mobile and PDV apps.

## Setup Instructions

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```

3.  **Run Backend (Dev)**:
    ```bash
    cd apps/backend
    npm run start:dev
    ```

4.  **Run Tests**:
    ```bash
    cd apps/backend
    # Verified:
    npm run test src/modules/sales/domain/sales.state-machine.spec.ts
    npm run test src/modules/common/tests/idempotency.spec.ts
    ```

## Documentation & Plans
- **Roadmap / Tasks**: [docs/task.md](./docs/task.md)
- **Implementation Plan**: [docs/implementation_plan.md](./docs/implementation_plan.md)
- **Walkthrough / Changelog**: [docs/walkthrough.md](./docs/walkthrough.md)

## Notes for Next Developer
- **SSL Issues**: Dependencies were installed manually or via modified registry due to `SELF_SIGNED_CERT_IN_CHAIN` errors in the previous environment.
- **Idempotency**: Currently using a mock In-Memory cache. MUST be swapped for Redis before production.
- **Environment Variables**: Configure `.env` based on `database.config.ts`.
