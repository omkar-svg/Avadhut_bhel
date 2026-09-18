import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Bill } from '../entities/Bill';

const HISTORY_DAYS = 2;

export async function removeExpiredBillHistory() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORY_DAYS);

  // bill_item uses ON DELETE CASCADE, so deleting a bill also removes its items.
  const result = await AppDataSource.getRepository(Bill).delete({ createdAt: LessThan(cutoff) });
  if (result.affected) console.log(`Removed ${result.affected} bill(s) older than ${HISTORY_DAYS} days.`);
}
