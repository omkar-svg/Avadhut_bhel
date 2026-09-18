import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Bill } from './Bill';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ default: 0 })
  totalOrders!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalSpent!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Bill, (bill) => bill.customer)
  bills!: Bill[];
}
