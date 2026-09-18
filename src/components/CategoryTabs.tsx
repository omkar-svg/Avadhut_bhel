interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
  categories: string[];
}

export function CategoryTabs({ selected, onSelect, categories }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-print w-full max-w-full min-w-0 py-0.5 px-0.5 overscroll-x-contain">
      {categories.map((category) => {
        const isSelected = selected === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl whitespace-nowrap text-xs sm:text-sm font-bold transition-all duration-200 flex-shrink-0 active:scale-95 ${
              isSelected
                ? 'bg-gradient-to-r from-brand-500 to-orange-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/80 shadow-xs'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
