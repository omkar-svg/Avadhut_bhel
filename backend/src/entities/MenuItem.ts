import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('menu_item')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: '' })
  marathiName!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column()
  category!: string;

  @Column({ default: '' })
  image!: string;

  @Column({ default: '' })
  imageCrop!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
