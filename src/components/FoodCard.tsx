import { Plus, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import type { FoodItem } from '../data/foodItems';

interface FoodCardProps {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
}

export function FoodCard({ item, onAdd }: FoodCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = item.image && !imgError;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50 to-amber-100">
            <UtensilsCrossed className="w-10 h-10 text-orange-300" />
            <span className="text-xs text-orange-400 font-medium">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sm font-bold text-gray-900 shadow-sm">
          ₹{item.price}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-1">{item.category}</p>
        </div>
        <button
          onClick={() => onAdd(item)}
          className="w-full flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 py-2 rounded-xl font-semibold transition-colors mt-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Bill</span>
        </button>
      </div>
    </div>
  );
}
