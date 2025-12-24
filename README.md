# PDV Just Go Market (Autonomous System)

Welcome to the **Just Go Market** Autonomous Mini Market System. This project implements a fully autonomous backend for a Scan & Go retail experience, featuring strict domain logic, resilient integrations, and a robust offline-first architecture.

**State:** Phase 3 Complete (Session & Sales Orchestration)
**Focus:** Payment Integration & Security

---

## 🏛 System Architecture

The system is built as a Monorepo using **NestJS** (Backend), **React Native** (Mobile), and **Vite/React** (PDV).

### **Core Principles**
1.  **Backend Authority**: All total calculations and validations happen on the server. Clients (App/PDV) are dump terminals.
2.  **Immutable Snapshots**: Sessions and Sales store snapshots of prices/items to prevent historical drift.
3.  **Strict Transitions**: State machines govern Sales (`CREATED` -> `PAID`) and Sessions (`ACTIVE` -> `CLOSED`).
4.  **Resilience**:
    *   **Redis Idempotency**: `SETNX` locks prevent double-processing.
    *   **Dead Letter Queues**: Failed ERP sync jobs (BullMQ) are captured for manual retry.
    *   **Offline Fallback**: PDV operates in "Safe Mode" if the Design System fails.

---

## 🧩 Backend Modules

### 1. **Auth & Biometry** (Guardian)
*   **Auth**: JWT-based stateless authentication.
*   **Biometry**: Mock service simulating physical access control (`BiometryService`).
*   **Security**: `AuthGuard` protects all transaction endpoints.

### 2. **Catalog & Price** (Source of Truth)
*   **Entities**: `Product` (ERP Logic), `Stock` (Warehouse), `Price` (Versioned).
*   **Sync**: Consumers (`ErpSyncProcessor`) listen to `erp-sync` queue for asynchronous updates.
*   **Rules**: Prices are per-store and versioned. Stock updates respect source timestamp to prevent out-of-order overwrites.

### 3. **Session Management** (Carts)
*   **Lifecycle**: User starts a session -> Adds items -> Closes session.
*   **Rules**:
    *   Only **one** active session per user/store.
    *   Item prices are **snapshotted** from `PriceService` at the moment of addition.
    *   Total is always calculated by the backend.

### 4. **Sales Orchestration** (Financial)
*   **Conversion**: `SalesService` converts a **CLOSED** Session into a **CREATED** Sale transactionally.
*   **Immutability**: The Sale entity contains a deep copy of the cart, independent of the session.
*   **Idempotency**: Retrying the conversion returns the *existing* sale, preventing duplication.

### 5. **ERP Integration** (Async)
*   **Mock Service**: `ErpMockService` simulates ERPNext behavior (Products, Stock, Price).
*   **Resilience**: `DlqService` allows Admin re-processing of failed sync jobs with audit logs.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & pnpm
*   Docker (for Postgres + Redis)

### Running the Stack

    ```bash
    # 1. Install Dependencies
    pnpm install

    # 2. Start Database & Redis (REQUIRED)
    docker-compose up -d
    ```

2.  **Backend**:
    ```bash
    cd apps/backend
    pnpm start:dev
    ```

3.  **Mobile (Expo)**:
    ```bash
    cd apps/mobile
    pnpm start
    ```

4.  **PDV (Vite)**:
    ```bash
    cd apps/pdv
    pnpm dev
    ```

---

## 🧪 Verification & Testing

The project maintains a high bar for code quality with focused Unit Tests for critical logic:

    ```bash
    cd apps/backend
    node verify_backend.js
    ```
    *   **Automated Tests**:
        *   `npm test modules/session`
        *   `npm test modules/sales`

---

## 📅 Roadmap Status

- [x] **Phase 1: Foundation**: Arch, Logs, Idempotency, DLQ.
- [x] **Phase 2: Core Components**: Mobile/PDV Skeletons, ERP Sync.
- [x] **Phase 3: Business Logic**: Auth, Session, Sales Conversion.
- [ ] **Phase 4: Payments**: Pix Integration.
- [ ] **Phase 5: Delivery**: End-to-End Tests & Docs.

---

*Verified by Antigravity Agent - 2025-12*
