import { SalesStatus } from './sales-status.enum';

export class SalesStateMachine {
    private status: SalesStatus = SalesStatus.CRIADA;

    constructor(initialStatus?: SalesStatus) {
        if (initialStatus) {
            this.status = initialStatus;
        }
    }

    getCurrentStatus(): SalesStatus {
        return this.status;
    }

    transitionTo(newStatus: SalesStatus): void {
        // 1. Terminal State Check
        if (this.status === SalesStatus.CANCELADA) {
            throw new Error(`Cannot transition from terminal state ${this.status}.`);
        }

        // 2. Strict Invariants
        // PAGA -> CANCELADA is FORBIDDEN
        if (this.status === SalesStatus.PAGA && newStatus === SalesStatus.CANCELADA) {
            throw new Error(`Invalid state transition: ${this.status} to ${newStatus} is prohibited.`);
        }

        // SINCRONIZADA -> ANYTHING is FORBIDDEN (Final consistency)
        if (this.status === SalesStatus.SINCRONIZADA) {
            throw new Error(`Cannot transition from final state ${this.status}.`);
        }

        // 3. Valid Transitions (Happy Paths)
        // CRIADA -> AGUARDANDO
        if (this.status === SalesStatus.CRIADA && newStatus === SalesStatus.AGUARDANDO_PAGAMENTO) {
            this.status = newStatus;
            return;
        }

        // AGUARDANDO -> PAGA or CANCELADA
        if (this.status === SalesStatus.AGUARDANDO_PAGAMENTO) {
            if (newStatus === SalesStatus.PAGA || newStatus === SalesStatus.CANCELADA) {
                this.status = newStatus;
                return;
            }
        }

        // PAGA -> SINCRONIZADA or PENDENTE_SYNC
        if (this.status === SalesStatus.PAGA) {
            if (newStatus === SalesStatus.SINCRONIZADA || newStatus === SalesStatus.PAGA_PENDENTE_SYNC) {
                this.status = newStatus;
                return;
            }
        }

        // Fallback for unhandled but potentially valid transitions (or strict block)
        // For now, if not matched above, we throw to be safe
        throw new Error(`Invalid state transition: ${this.status} to ${newStatus}.`);
    }
}
