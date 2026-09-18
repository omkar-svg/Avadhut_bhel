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
  onQuickSave: () => Promise<void>;
  billNumberReady: boolean;
}

export function Cart({
  items,
  subtotal,
  discount,
  onUpdateQuantity,
  onRemove,
  onDiscountChange,
  onGenerateBill,
  onQuickSave,
  billNumberReady,
}: CartProps) {
  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200/80 no-print">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-500" />
          <span>Current Bill</span>
        </h2>
        {items.length > 0 && (
          <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {items.reduce((sum, i) => sum + i.quantity, 0)} items
          </span>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-gray-400">
            <div className="bg-orange-50 p-4 rounded-3xl text-brand-400">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-gray-700 text-base">Your bill is empty</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                Tap food items on the menu to add them to this order.
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Cart Summary & Actions */}
      <BillSummary
        subtotal={subtotal}
        discount={discount}
        onDiscountChange={onDiscountChange}
        onGenerateBill={onGenerateBill}
        onQuickSave={onQuickSave}
        disabled={items.length === 0 || !billNumberReady}
      />
    </div>
  );
}
