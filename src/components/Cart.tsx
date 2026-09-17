import { ShoppingCart } from 'lucide-react';
import { CartItem, type CartItemType } from './CartItem';
import { BillSummary } from './BillSummary';

interface CartProps {
  items: CartItemType[];
  subtotal: number;
  discount: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onDiscountChange: (discount: number) => void;
  onGenerateBill: () => void;
}

export function Cart({
  items,
  subtotal,
  discount,
  onUpdateQuantity,
  onRemove,
  onDiscountChange,
  onGenerateBill
}: CartProps) {
  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 no-print">
      <div className="p-4 border-b border-gray-200 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-500" />
          Current Bill
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-gray-400">
            <div className="bg-gray-50 p-4 rounded-full">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-gray-600 mb-1">No items added yet</p>
              <p className="text-sm">Select food items from the menu<br/>to start a new bill.</p>
            </div>
          </div>
        ) : (
          items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      <BillSummary
        subtotal={subtotal}
        discount={discount}
        onDiscountChange={onDiscountChange}
        onGenerateBill={onGenerateBill}
        disabled={items.length === 0}
      />
    </div>
  );
}
