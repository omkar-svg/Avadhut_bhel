import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FoodItem } from '../data/foodItems';

interface FoodCardProps {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
  inCartCount?: number;
}

export function FoodCard({ item, onAdd, inCartCount = 0 }: FoodCardProps) {
  const defaultImage = '/images/bhel puri.png';
  const [imgSrc, setImgSrc] = useState(item.image || defaultImage);

  useEffect(() => {
    setImgSrc(item.image || defaultImage);
  }, [item.image]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md border border-gray-200/70 overflow-hidden flex flex-col transition-all duration-200 group active:scale-[0.98] select-none">
      {/* Food Photo Container */}
      <div className="aspect-[4/3] overflow-hidden bg-orange-50/50 relative">
        {item.imageCrop ? (
          <div
            role="img"
            aria-label={item.name}
            className="w-full h-full bg-cover group-hover:scale-105 transition-transform duration-300"
            style={{
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: '700% auto',
              backgroundPosition: item.imageCrop,
            }}
          />
        ) : (
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgSrc(defaultImage)}
          />
        )}

        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-gray-950/80 text-white backdrop-blur-md px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shadow-md">
          ₹{item.price}
        </div>

        {/* In-cart count badge */}
        {inCartCount > 0 && (
          <div className="absolute top-2 left-2 bg-brand-500 text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-md animate-toast-slide-down">
            {inCartCount} in bill
          </div>
        )}
      </div>

      {/* Card Info & Add Button */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2.5 justify-between bg-white">
        <div>
          <h3 className="font-bold text-gray-900 leading-snug text-xs sm:text-base line-clamp-1 group-hover:text-brand-600 transition-colors">
            {item.name}
          </h3>
          {item.marathiName && (
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1" lang="mr">
              {item.marathiName}
            </p>
          )}
        </div>

        <button
          onClick={() => onAdd(item)}
          className={`w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all text-xs sm:text-sm active:scale-95 ${
            inCartCount > 0
              ? 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-md shadow-brand-500/20'
              : 'bg-brand-50 hover:bg-brand-100 active:bg-brand-200 text-brand-700 border border-brand-200/50'
          }`}
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span>{inCartCount > 0 ? `Add (${inCartCount})` : 'Add'}</span>
        </button>
      </div>
    </div>
  );
}
