
interface BillSummaryProps {
  subtotal: number;
  discount: number;
  onDiscountChange: (discount: number) => void;
  onGenerateBill: () => void;
  disabled: boolean;
}

export function BillSummary({ subtotal, discount, onDiscountChange, onGenerateBill, disabled }: BillSummaryProps) {
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="bg-white p-4 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-gray-100 mt-auto">
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold">₹{subtotal}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Discount</span>
          <div className="flex items-center gap-1">
            <span>₹</span>
            <input
              type="number"
              min="0"
              max={subtotal}
              value={discount || ''}
              onChange={(e) => onDiscountChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 px-2 py-1 text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="h-px bg-gray-200 w-full my-2"></div>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-900">TOTAL</span>
          <span className="text-2xl font-black text-brand-600">₹{total}</span>
        </div>
      </div>

      <button
        onClick={onGenerateBill}
        disabled={disabled}
        className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-sm"
      >
        GENERATE BILL
      </button>
    </div>
  );
}
