import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BillItem } from './BillItem';
import { Customer } from './Customer';

@Entity('bill')
export class Bill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  billNumber!: string;

  @Column()
  customerName!: string;

  @Column()
  customerPhone!: string;

  @Column({ nullable: true })
  customerEmail!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @Column({ default: false })
  emailSent!: boolean;

  // Optional link to a stored customer
  @Column({ nullable: true })
  customerId!: number | null;

  @ManyToOne(() => Customer, (customer) => customer.bills, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => BillItem, (item) => item.bill, { cascade: true, eager: true })
  items!: BillItem[];
}
