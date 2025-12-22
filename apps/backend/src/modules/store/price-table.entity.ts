import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Store } from './store.entity';

@Entity('price_tables')
@Index(['store', 'barcode', 'version'], { unique: true }) // Validation: Unique price per version
export class PriceTable {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, { nullable: false })
    store: Store;

    @Column()
    barcode: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    version: string; // e.g., 'v1', '2023-10-27-001'

    @Column({ type: 'timestamp' })
    validFrom: Date;

    @Column({ type: 'timestamp', nullable: true })
    validTo: Date;

    @CreateDateColumn()
    createdAt: Date;
}
