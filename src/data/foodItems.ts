export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export const foodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Bhel Puri',
    price: 50,
    category: 'Bhel',
    image: '/images/bhel puri.png'
  },
  {
    id: '2',
    name: 'Sev Puri',
    price: 50,
    category: 'Puri',
    image: '/images/sev puri.png'
  },
  {
    id: '3',
    name: 'Dahi Puri',
    price: 60,
    category: 'Puri',
    image: '/images/dahi puri.png'
  },
  {
    id: '4',
    name: 'Pani Puri',
    price: 40,
    category: 'Puri',
    image: '/images/pani puri.png'
  },
  {
    id: '5',
    name: 'Ragada Puri',
    price: 60,
    category: 'Puri',
    image: '/images/ragada puri.png'
  },
  {
    id: '6',
    name: 'Wet Bhel',
    price: 50,
    category: 'Bhel',
    image: '/images/wet bhel.png'
  },
  {
    id: '7',
    name: 'Ragda Pattice',
    price: 70,
    category: 'Snacks',
    image: ''
  },
  {
    id: '8',
    name: 'Masala Puri',
    price: 50,
    category: 'Puri',
    image: ''
  },
  {
    id: '9',
    name: 'Samosa',
    price: 20,
    category: 'Snacks',
    image: ''
  },
  {
    id: '10',
    name: 'Sandwich',
    price: 60,
    category: 'Sandwich',
    image: ''
  },
  {
    id: '11',
    name: 'Cheese Sandwich',
    price: 80,
    category: 'Sandwich',
    image: ''
  },
  {
    id: '12',
    name: 'Cold Drink',
    price: 30,
    category: 'Drinks',
    image: ''
  }
];

export const categories = ['All', 'Bhel', 'Puri', 'Snacks', 'Sandwich', 'Drinks'];
