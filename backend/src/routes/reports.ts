import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Bill } from '../entities/Bill';
import { BillItem } from '../entities/BillItem';
import { Between } from 'typeorm';

const router = Router();

const billRepo = () => AppDataSource.getRepository(Bill);
const billItemRepo = () => AppDataSource.getRepository(BillItem);

// ─── GET /api/reports/daily?date=YYYY-MM-DD ─── Daily sales report
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Set day boundaries
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bills = await billRepo().find({
      where: { createdAt: Between(startOfDay, endOfDay) },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    // Aggregate totals
    const totalRevenue = bills.reduce((sum, b) => sum + Number(b.total), 0);
    const totalOrders = bills.length;
    const totalDiscount = bills.reduce((sum, b) => sum + Number(b.discount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top items
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        const existing = itemMap.get(item.itemName);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += Number(item.total);
        } else {
          itemMap.set(item.itemName, {
            name: item.itemName,
            quantity: item.quantity,
            revenue: Number(item.total),
          });
        }
      });
    });

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Hourly breakdown
    const hourlyMap = new Map<number, { hour: number; orders: number; revenue: number }>();
    bills.forEach((bill) => {
      const hour = new Date(bill.createdAt).getHours();
      const existing = hourlyMap.get(hour);
      if (existing) {
        existing.orders += 1;
        existing.revenue += Number(bill.total);
      } else {
        hourlyMap.set(hour, { hour, orders: 1, revenue: Number(bill.total) });
      }
    });

    const hourlyBreakdown = Array.from(hourlyMap.values()).sort((a, b) => a.hour - b.hour);

    return res.json({
      date: dateStr,
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      },
      topItems,
      hourlyBreakdown,
      bills: bills.map((b) => ({
        id: b.id,
        billNumber: b.billNumber,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        total: b.total,
        createdAt: b.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate daily report' });
  }
});

// ─── GET /api/reports/summary ─── Overall summary (last 30 days)
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const bills = await billRepo().find({
      where: { createdAt: Between(twoDaysAgo, new Date()) },
      relations: ['items'],
    });

    const totalRevenue = bills.reduce((sum, b) => sum + Number(b.total), 0);
    const totalOrders = bills.length;

    // Daily revenue for chart
    const dailyMap = new Map<string, number>();
    bills.forEach((bill) => {
      const day = new Date(bill.createdAt).toISOString().split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + Number(bill.total));
    });

    const dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json({
      period: '2 days',
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      dailyRevenue,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
