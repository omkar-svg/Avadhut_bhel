import { Minus, Plus, Trash2 } from 'lucide-react';
import type { FoodItem } from '../data/foodItems';

export interface CartItemType extends FoodItem {
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200/60 shadow-xs">
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-bold text-gray-900 text-sm leading-snug truncate">{item.name}</h4>
          <span className="font-black text-gray-900 text-sm whitespace-nowrap ml-2">
            ₹{item.price * item.quantity}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-semibold">₹{item.price} each</span>

          <div className="flex items-center gap-2">
            {/* Quantity Stepper with large touch buttons */}
            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors"
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-xs sm:text-sm font-black text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 text-gray-600 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
