import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { MenuItem } from '../entities/MenuItem';

const router = Router();
const menuRepo = () => AppDataSource.getRepository(MenuItem);

function readItem(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const price = Number(body.price);

  if (!name || !category || !Number.isFinite(price) || price < 0) return null;

  return {
    name,
    category,
    price,
    marathiName: typeof body.marathiName === 'string' ? body.marathiName.trim() : '',
    image: typeof body.image === 'string' ? body.image.trim() : '',
    imageCrop: typeof body.imageCrop === 'string' ? body.imageCrop.trim() : '',
  };
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    return res.json(await menuRepo().find({ order: { id: 'ASC' } }));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = readItem(req.body);
    if (!data) return res.status(400).json({ error: 'name, category, and a valid price are required' });
    return res.status(201).json(await menuRepo().save(menuRepo().create(data)));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create menu item' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await menuRepo().findOneBy({ id: Number(req.params.id) });
    const data = readItem(req.body);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    if (!data) return res.status(400).json({ error: 'name, category, and a valid price are required' });
    Object.assign(item, data);
    return res.json(await menuRepo().save(item));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update menu item' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await menuRepo().delete(Number(req.params.id));
    if (!result.affected) return res.status(404).json({ error: 'Menu item not found' });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;
