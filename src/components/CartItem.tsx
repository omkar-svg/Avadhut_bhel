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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
          <span className="font-bold text-gray-900 text-sm whitespace-nowrap ml-2">
            ₹{item.price * item.quantity}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">₹{item.price} each</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-900">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
