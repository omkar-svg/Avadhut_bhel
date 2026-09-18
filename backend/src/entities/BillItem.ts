import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bill } from './Bill';

@Entity('bill_item')
export class BillItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Bill, (bill) => bill.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'billId' })
  bill!: Bill;

  @Column()
  itemName!: string;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;
}
