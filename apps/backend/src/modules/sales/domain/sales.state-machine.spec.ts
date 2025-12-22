import { SalesStateMachine } from './sales.state-machine';
import { SalesStatus } from './sales-status.enum';

describe('SalesStateMachine', () => {
    it('should start in CRIADA state', () => {
        const machine = new SalesStateMachine();
        expect(machine.getCurrentStatus()).toBe(SalesStatus.CRIADA);
    });

    describe('Transitions', () => {
        it('should transition from CRIADA to AGUARDANDO_PAGAMENTO', () => {
            const machine = new SalesStateMachine(SalesStatus.CRIADA);
            machine.transitionTo(SalesStatus.AGUARDANDO_PAGAMENTO);
            expect(machine.getCurrentStatus()).toBe(SalesStatus.AGUARDANDO_PAGAMENTO);
        });

        it('should transition from AGUARDANDO_PAGAMENTO to PAGA', () => {
            const machine = new SalesStateMachine(SalesStatus.AGUARDANDO_PAGAMENTO);
            machine.transitionTo(SalesStatus.PAGA);
            expect(machine.getCurrentStatus()).toBe(SalesStatus.PAGA);
        });

        it('should transition from AGUARDANDO_PAGAMENTO to CANCELADA', () => {
            const machine = new SalesStateMachine(SalesStatus.AGUARDANDO_PAGAMENTO);
            machine.transitionTo(SalesStatus.CANCELADA);
            expect(machine.getCurrentStatus()).toBe(SalesStatus.CANCELADA);
        });
    });

    describe('Strict Validations (Forbidden Transitions)', () => {
        it('should THROW error when trying to CANCEL a PAID sale', () => {
            const machine = new SalesStateMachine(SalesStatus.PAGA);
            expect(() => {
                machine.transitionTo(SalesStatus.CANCELADA);
            }).toThrow('Invalid state transition: PAGA to CANCELADA is prohibited.');
        });

        it('should THROW error when trying to modify a SYNCED sale', () => {
            const machine = new SalesStateMachine(SalesStatus.SINCRONIZADA);
            expect(() => {
                machine.transitionTo(SalesStatus.AGUARDANDO_PAGAMENTO);
            }).toThrow();
        });
    });
});
