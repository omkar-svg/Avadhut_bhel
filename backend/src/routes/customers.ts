import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Customer } from '../entities/Customer';
import { ILike } from 'typeorm';

const router = Router();

const customerRepo = () => AppDataSource.getRepository(Customer);

// ─── GET /api/customers ─── List all customers (with optional search)
router.get('/', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';

    const customers = await customerRepo().find({
      where: q
        ? [
            { name: ILike(`%${q}%`) },
            { phone: ILike(`%${q}%`) },
            { email: ILike(`%${q}%`) },
          ]
        : undefined,
      order: { name: 'ASC' },
    });

    return res.json(customers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// ─── GET /api/customers/:id ─── Single customer
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await customerRepo().findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    return res.json(customer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// ─── POST /api/customers ─── Create new customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, email } = req.body;

    if (!name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: 'name and phone are required' });
    }

    // Check if phone already exists
    const existing = await customerRepo().findOne({ where: { phone: phone.trim() } });
    if (existing) {
      return res.status(409).json({ error: 'A customer with this phone number already exists', customer: existing });
    }

    const customer = customerRepo().create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      totalOrders: 0,
      totalSpent: 0,
    });

    const saved = await customerRepo().save(customer);
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

// ─── PUT /api/customers/:id ─── Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await customerRepo().findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const { name, phone, email } = req.body;

    if (name?.trim()) customer.name = name.trim();
    if (phone?.trim()) customer.phone = phone.trim();
    if (email !== undefined) customer.email = email?.trim() || null;

    const updated = await customerRepo().save(customer);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

// ─── DELETE /api/customers/:id ─── Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await customerRepo().findOne({
      where: { id: parseInt(req.params.id) },
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await customerRepo().remove(customer);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// ─── Internal helper: update customer stats after a bill is created
export async function updateCustomerStats(customerId: number, billTotal: number) {
  try {
    const customer = await AppDataSource.getRepository(Customer).findOne({ where: { id: customerId } });
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent = Number(customer.totalSpent) + billTotal;
      await AppDataSource.getRepository(Customer).save(customer);
    }
  } catch (err) {
    console.error('Failed to update customer stats:', err);
  }
}

export default router;
