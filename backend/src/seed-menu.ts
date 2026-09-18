import { AppDataSource } from './data-source';
import { MenuItem } from './entities/MenuItem';

const cropSheet = '/images/menu-card-crops-v2.png';
const seedItems = [
  ['Special Oli Bhel', 'स्पेशल ओली भेळ', 40, 'Bhel', '0% 15%'],
  ['Special Sukhi Bhel', 'स्पेशल सुकी भेळ', 40, 'Bhel', '16.667% 15%'],
  ['Special Dahi Bhel', 'स्पेशल दही भेळ', 55, 'Bhel', '33.333% 15%'],
  ['Pani Puri', 'पाणीपुरी', 40, 'Puri', '50% 15%'],
  ['Dahi Puri', 'दहीपुरी', 60, 'Puri', '66.667% 15%'],
  ['Shev Puri', 'शेवपुरी', 60, 'Puri', '83.333% 15%'],
  ['Ragda', 'रगडा', 50, 'Snacks', '100% 15%'],
  ['Samosa Ragda', 'समोसा रगडा', 60, 'Snacks', '0% 85%'],
  ['Farsan Bhel', 'फरसाण भेळ', 70, 'Bhel', '16.667% 85%'],
  ['Papdi Bhel', 'पापडी भेळ', 60, 'Bhel', '33.333% 85%'],
  ['Dabeli', 'दाबेली', 20, 'Snacks', '50% 85%'],
  ['Bhel Puri', 'भेळ पुरी', 60, 'Bhel', '66.667% 85%'],
  ['Masala Puri', 'मसाला पुरी', 50, 'Puri', '83.333% 85%'],
  ['Shev Chivda', 'शेवचिवडे', 20, 'Snacks', '100% 85%'],
] as const;

export async function seedMenuIfEmpty() {
  const repository = AppDataSource.getRepository(MenuItem);
  if (await repository.count()) return;

  await repository.save(seedItems.map(([name, marathiName, price, category, imageCrop]) => repository.create({
    name,
    marathiName,
    price,
    category,
    image: cropSheet,
    imageCrop,
  })));
}
