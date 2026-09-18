import { CheckCircle2, Loader2, FileText, Calculator, IndianRupee } from 'lucide-react';
import { useState } from 'react';

interface BillSummaryProps {
  subtotal: number;
  discount: number;
  onDiscountChange: (discount: number) => void;
  onGenerateBill: () => void;
  onQuickSave: () => Promise<void>;
  disabled: boolean;
}

export function BillSummary({
  subtotal,
  discount,
  onDiscountChange,
  onGenerateBill,
  onQuickSave,
  disabled,
}: BillSummaryProps) {
  const total = Math.max(0, subtotal - discount);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickSaved, setQuickSaved] = useState(false);

  const handleQuickSave = async () => {
    setQuickSaving(true);
    try {
      await onQuickSave();
      setQuickSaved(true);
      setTimeout(() => setQuickSaved(false), 2500);
    } catch {
      // ignore
    } finally {
      setQuickSaving(false);
    }
  };

  const setDiscountPreset = (amount: number) => {
    onDiscountChange(Math.min(subtotal, Math.max(0, amount)));
  };

  return (
    <div className="bg-white p-4 rounded-t-3xl shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] border-t border-gray-100 mt-auto flex-shrink-0">
      {/* Discount & Totals Section */}
      <div className="space-y-2.5 mb-4">
        {/* Subtotal */}
        <div className="flex justify-between text-xs sm:text-sm text-gray-500 font-semibold">
          <span>Subtotal</span>
          <span className="text-gray-900 font-bold">₹{subtotal}</span>
        </div>

        {/* Discount Input & Quick Chips */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500 font-semibold">
            <span>Discount</span>
            <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200">
              <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discount || ''}
                onChange={(e) => onDiscountChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-transparent text-right font-bold text-gray-900 focus:outline-none text-sm"
                placeholder="0"
              />
            </div>
          </div>

          {/* Quick preset chips if subtotal > 0 */}
          {subtotal > 0 && (
            <div className="flex items-center justify-end gap-1 pt-0.5">
              {[0, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDiscountPreset(val)}
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    discount === val
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {val === 0 ? 'No disc' : `₹${val}`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100 w-full my-2" />

        {/* Final Total */}
        <div className="flex justify-between items-center">
          <span className="font-black text-gray-900 text-base sm:text-lg">TOTAL</span>
          <span className="text-2xl sm:text-3xl font-black text-brand-600">₹{total}</span>
        </div>
      </div>

      {/* ── Two Action Buttons ── */}
      <div className="flex flex-col gap-2">
        {/* Primary: Generate Bill (Opens Customer Details Modal) */}
        <button
          onClick={onGenerateBill}
          disabled={disabled}
          id="generate-bill-btn"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 active:from-brand-700 active:to-orange-700 disabled:bg-gray-200 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98]"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Bill</span>
        </button>

        {/* Secondary: Quick Save directly to daily calculation */}
        <button
          onClick={handleQuickSave}
          disabled={disabled || quickSaving}
          id="quick-save-btn"
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all border-2 ${
            quickSaved
              ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
              : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50 active:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          {quickSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin text-brand-500" /> Saving…</>
          ) : quickSaved ? (
            <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Added to Daily Calculation!</>
          ) : (
            <><Calculator className="w-4 h-4" /> Add to Daily Calculation Only</>
          )}
        </button>
      </div>
    </div>
  );
}
