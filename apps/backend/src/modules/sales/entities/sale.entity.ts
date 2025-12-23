import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SaleStatus {
    CREATED = 'CREATED', // Waiting for payment intent
    PENDING_PAYMENT = 'PENDING_PAYMENT', // QR Code generated / Send to Gateway
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    @Index({ unique: true }) // Idempotency: One Sale per Session
    sessionId!: string;

    @Column()
    storeId!: string;

    @Column()
    customerId!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total!: number;

    @Column({
        type: 'enum',
        enum: SaleStatus,
        default: SaleStatus.CREATED
    })
    status!: SaleStatus;

    // Immutable Snapshot of the Session Cart
    @Column({ type: 'jsonb' })
    items!: any[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
