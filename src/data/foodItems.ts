export interface FoodItem {
  id: string;
  name: string;
  marathiName: string;
  price: number;
  category: string;
  image: string;
  imageCrop: string;
}

const menuCropSheet = '/images/menu-card-crops-v2.png';

export const foodItems: FoodItem[] = [
  { id: '1', name: 'Special Oli Bhel', marathiName: 'स्पेशल ओली भेळ', price: 40, category: 'Bhel', image: menuCropSheet, imageCrop: '0% 15%' },
  { id: '2', name: 'Special Sukhi Bhel', marathiName: 'स्पेशल सुकी भेळ', price: 40, category: 'Bhel', image: menuCropSheet, imageCrop: '16.667% 15%' },
  { id: '3', name: 'Special Dahi Bhel', marathiName: 'स्पेशल दही भेळ', price: 55, category: 'Bhel', image: menuCropSheet, imageCrop: '33.333% 15%' },
  { id: '4', name: 'Pani Puri', marathiName: 'पाणीपुरी', price: 40, category: 'Puri', image: menuCropSheet, imageCrop: '50% 15%' },
  { id: '5', name: 'Dahi Puri', marathiName: 'दहीपुरी', price: 60, category: 'Puri', image: menuCropSheet, imageCrop: '66.667% 15%' },
  { id: '6', name: 'Shev Puri', marathiName: 'शेवपुरी', price: 60, category: 'Puri', image: menuCropSheet, imageCrop: '83.333% 15%' },
  { id: '7', name: 'Ragda', marathiName: 'रगडा', price: 50, category: 'Snacks', image: menuCropSheet, imageCrop: '100% 15%' },
  { id: '8', name: 'Samosa Ragda', marathiName: 'समोसा रगडा', price: 60, category: 'Snacks', image: menuCropSheet, imageCrop: '0% 85%' },
  { id: '9', name: 'Farsan Bhel', marathiName: 'फरसाण भेळ', price: 70, category: 'Bhel', image: menuCropSheet, imageCrop: '16.667% 85%' },
  { id: '10', name: 'Papdi Bhel', marathiName: 'पापडी भेळ', price: 60, category: 'Bhel', image: menuCropSheet, imageCrop: '33.333% 85%' },
  { id: '11', name: 'Dabeli', marathiName: 'दाबेली', price: 20, category: 'Snacks', image: menuCropSheet, imageCrop: '50% 85%' },
  { id: '12', name: 'Bhel Puri', marathiName: 'भेळ पुरी', price: 60, category: 'Bhel', image: menuCropSheet, imageCrop: '66.667% 85%' },
  { id: '13', name: 'Masala Puri', marathiName: 'मसाला पुरी', price: 50, category: 'Puri', image: menuCropSheet, imageCrop: '83.333% 85%' },
  { id: '14', name: 'Shev Chivda', marathiName: 'शेवचिवडे', price: 20, category: 'Snacks', image: menuCropSheet, imageCrop: '100% 85%' },
];

export const categories = ['All', 'Bhel', 'Puri', 'Snacks'];
