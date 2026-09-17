import { categories } from '../data/foodItems';

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-print">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 ${
            selected === category
              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
