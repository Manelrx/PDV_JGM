# Project Roadmap: Autonomous Mini Market System

## Phase 1: Foundation & Architecture
- [x] **Project Setup & Architecture Definition** <!-- id: 0 -->
    - [x] Create repository structure (Monorepo recommended)
    - [x] Define technical stack and dependencies
    - [x] Create architecture diagrams and documentation
    - [x] **Critical Domain Modeling** <!-- id: 1.1 -->
        - [x] Define Sales State Machine & Transitions
        - [x] Design Offline/Sync Strategy & Consistency
        - [x] Define Audit Log Event Schemas
        - [x] Design ERPNext Isolation & Queue Pattern
- [x] **Backend Orchestrator Core** <!-- id: 1 -->
    - [x] Setup NestJS framework with TypeScript
    - [x] Configure PostgreSQL connectivity
    - [x] Implement Logging & Audit system (Immutable logs)
    - [x] Setup Health Checks & Resiliency patterns
    - [x] **Price & Store Module (Versioning)** <!-- id: 1.2 -->
        - [x] Implement Store/Price Table Schema
        - [x] Implement Price Lookup Service with Versioning
    - [/] **Critical Domain Tests (Automated)** <!-- id: 1.3 -->
        - [x] Test Sales State Machine Transitions
        - [ ] Test Idempotency (Webhook, Offline Sync, PayIntent)
        - [ ] Test ERP Outage Resilience & DLQ
    - [ ] **Backend Hardening & Contracts** <!-- id: 1.4 -->
        - [ ] Implement Redis Atomic Idempotency (SETNX/Lua)
        - [x] Define Price API Contract (DTOs + generatedAt)
        - [x] Enforce Backend Total Calculation Invariant
        - [x] Define ERP Sync Queue Strategy (Retry/DLQ Manual Policy)
        - [ ] Implement DLQ Manual Reprocessing API
        - [ ] Test Advanced Idempotency (Out-of-Order, Restart)
- [ ] **ERPNext Stub/Mock Integration** <!-- id: 2 -->
    - [ ] Define Products/Stock data models (Source of Truth)
    - [ ] Create sync mechanism (Webhooks/Polling) structure

## Phase 2: Core Components Implementation
- [ ] **Mobile App (Scan & Go) - Skeleton** <!-- id: 3 -->
    - [ ] Setup React Native (Expo) project
    - [ ] Implement Authentication flow (Auth0/Firebase or Custom JWT)
    - [ ] Basic Catalog & Cart logic
- [ ] **PDV (Offline-first) - Skeleton** <!-- id: 4 -->
    - [ ] Setup React/Electron project
    - [ ] Implement Local Database (SQLite/RxDB) synchronization
    - [ ] Offline/Online state management

## Phase 3: Business Logic & Orchestration
- [ ] **Session Management** <!-- id: 5 -->
    - [ ] Create/Manage shopping sessions
    - [ ] Biometric Access Integration (Mock)
- [ ] **Sales Flow Orchestration** <!-- id: 6 -->
    - [ ] Validation logic (prices, stock availability check)
    - [ ] State Machine for Sales (CREATED -> PENDING -> PAID -> SYNCED)
- [ ] **Payments Integration** <!-- id: 7 -->
    - [ ] Gateway integration (Pix-first strategy)
    - [ ] Webhook handlers for payment confirmation

## Phase 4: Reliability & Integrity
- [ ] **Offline Fallback Mechanisms** <!-- id: 8 -->
    - [ ] PDV local sales queue & sync logic
    - [ ] ERPNext async synchronization (BullMQ/RabbitMQ)
- [ ] **Security Hardening** <!-- id: 9 -->
    - [ ] mTLS setup
    - [ ] RBAC implementation
    - [ ] Data encryption

## Phase 5: Verification & Delivery
- [ ] **End-to-End Testing** <!-- id: 10 -->
    - [ ] Full flow simulation (Biometry -> App/PDV -> Pay -> ERP)
- [ ] **Documentation & Handover** <!-- id: 11 -->
    - [ ] API Docs (Swagger/OpenAPI)
    - [ ] Deployment Guide
