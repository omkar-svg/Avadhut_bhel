import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Bill } from '../entities/Bill';
import { BillItem } from '../entities/BillItem';
import { sendBillEmail } from '../services/emailService';
import { updateCustomerStats } from './customers';

const router = Router();

const billRepo = () => AppDataSource.getRepository(Bill);

// ─── POST /api/bills ─── Create a new bill
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      billNumber,
      customerName,
      customerPhone,
      customerEmail,
      customerId,   // optional: ID of a saved customer
      subtotal,
      discount,
      total,
      items,
      sendEmail,
    } = req.body;

    // Validate required fields
    if (!billNumber || !customerName || !customerPhone || !items?.length) {
      return res.status(400).json({ error: 'billNumber, customerName, customerPhone, and items are required' });
    }

    // Build bill entity
    const bill = billRepo().create({
      billNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      customerId: customerId ? parseInt(customerId) : null,
      subtotal: parseFloat(subtotal),
      discount: parseFloat(discount) || 0,
      total: parseFloat(total),
      emailSent: false,
    });

    // Build bill items
    const billItems: BillItem[] = items.map((i: { name: string; quantity: number; price: number }) => {
      const item = new BillItem();
      item.itemName = i.name;
      item.quantity = i.quantity;
      item.unitPrice = i.price;
      item.total = i.price * i.quantity;
      return item;
    });

    bill.items = billItems;

    // Save to DB
    const saved = await billRepo().save(bill);

    // Update customer stats if linked to a stored customer
    if (customerId) {
      await updateCustomerStats(parseInt(customerId), parseFloat(total));
    }

    // Optionally send email
    if (sendEmail && customerEmail) {
      try {
        await sendBillEmail(saved);
        await billRepo().update(saved.id, { emailSent: true });
        saved.emailSent = true;
      } catch (emailErr) {
        console.error('Email failed:', emailErr);
        // Don't fail the whole request if email fails
      }
    }

    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    // A stale browser tab or a second POS terminal can submit a bill number
    // that has just been used. Report the actionable conflict, rather than a
    // generic 500 response.
    if (isDuplicateBillNumberError(err)) {
      return res.status(409).json({ error: 'This bill number already exists. Refresh the POS and try again.' });
    }
    return res.status(500).json({ error: 'Failed to create bill' });
  }
});

function isDuplicateBillNumberError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: unknown }).code === '23505';
}

// ─── GET /api/bills ─── List all bills (recent first)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bills = await billRepo().find({
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
    return res.json(bills);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// ─── GET /api/bills/:id ─── Get single bill
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const bill = await billRepo().findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['items'],
    });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    return res.json(bill);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// ─── POST /api/bills/:id/send-email ─── Re-send email for existing bill
router.post('/:id/send-email', async (req: Request, res: Response) => {
  try {
    const bill = await billRepo().findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['items'],
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    if (!bill.customerEmail) {
      return res.status(400).json({ error: 'No email address on this bill' });
    }

    await sendBillEmail(bill);
    await billRepo().update(bill.id, { emailSent: true });

    return res.json({ success: true, message: `Email sent to ${bill.customerEmail}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
