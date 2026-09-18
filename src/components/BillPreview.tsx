import { useState } from 'react';
import {
  CheckCircle, Loader2, X,
  Printer, AlertCircle, Send, Plus, Receipt
} from 'lucide-react';
import type { CartItemType } from './CartItem';
import { sendBillEmail } from '../services/api';

interface BillPreviewProps {
  items: CartItemType[];
  subtotal: number;
  discount: number;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  savedBillId: number | null;
  billSaving?: boolean;
  onClose: () => void;
  onPrint: () => void;
  onNewBill: () => void;
}

export function BillPreview({
  items,
  subtotal,
  discount,
  billNumber,
  customerName,
  customerPhone,
  customerEmail,
  savedBillId,
  billSaving = false,
  onClose,
  onPrint,
  onNewBill,
}: BillPreviewProps) {
  const total = Math.max(0, subtotal - discount);
  const now = new Date();

  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const handleSendEmail = async () => {
    if (!savedBillId || !customerEmail) return;
    setEmailStatus('sending');
    setEmailError('');
    try {
      await sendBillEmail(savedBillId);
      setEmailStatus('sent');
    } catch (err) {
      setEmailStatus('error');
      setEmailError(err instanceof Error ? err.message : 'Failed to send email');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 no-print animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] animate-sheet sm:animate-popup border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden bg-gray-50 border-b border-gray-100">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/90 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-500" />
            {billSaving ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving to report…
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                {savedBillId ? 'Saved to Report' : 'Bill Generated'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Printable Thermal Receipt Content ── */}
        <div id="print-area" className="p-5 sm:p-6 bg-white overflow-y-auto print-only flex-1 divide-y divide-gray-200/80">
          {/* Shop Header */}
          <div className="text-center pb-4">
            <div className="border-y-2 border-dashed border-gray-300 py-2.5 mb-3 bg-amber-50/40 rounded-lg">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-gray-900">AVADHUT BHEL</h1>
              <p className="text-xs sm:text-sm font-semibold text-brand-600 uppercase tracking-widest mt-0.5">Delicious &amp; Fresh</p>
            </div>
            <div className="grid grid-cols-2 text-xs text-gray-600 gap-y-1 text-left bg-gray-50 p-2.5 rounded-xl">
              <p><span className="font-bold text-gray-800">Bill No:</span> {billNumber}</p>
              <p className="text-right"><span className="font-bold text-gray-800">Date:</span> {now.toLocaleDateString('en-IN')}</p>
              <p className="col-span-2"><span className="font-bold text-gray-800">Time:</span> {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="py-3 text-xs sm:text-sm text-gray-700 space-y-1">
            <p><span className="font-bold text-gray-900">Customer:</span> {customerName}</p>
            <p><span className="font-bold text-gray-900">Phone:</span> {customerPhone}</p>
            {customerEmail && <p><span className="font-bold text-gray-900">Email:</span> {customerEmail}</p>}
          </div>

          {/* Items Table */}
          <div className="py-3">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-gray-500 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center w-12">Qty</th>
                  <th className="pb-2 text-right w-20">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="text-gray-900 font-medium">
                    <td className="py-2 pr-2 leading-tight">{item.name}</td>
                    <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-2 text-right font-bold">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-3 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>- ₹{discount}</span>
              </div>
            )}
            <div className="border-t-2 border-dashed border-gray-300 pt-2 flex justify-between items-center font-black text-lg sm:text-xl text-gray-900 mt-2 bg-brand-50/50 p-2 rounded-xl">
              <span>TOTAL</span>
              <span className="text-brand-600">₹{total}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 text-center text-xs text-gray-500">
            <p className="font-bold text-gray-700">Thank You For Your Visit! 🙏</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Please visit again</p>
          </div>
        </div>

        {/* ── Action Buttons & Status Alerts ── */}
        <div className="no-print flex-shrink-0 border-t border-gray-100 bg-white p-4 safe-bottom space-y-3">
          {/* Email status feedback */}
          {emailStatus === 'sent' && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold animate-toast-slide-down">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Receipt sent to {customerEmail}</span>
            </div>
          )}
          {emailStatus === 'error' && (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold animate-toast-slide-down">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{emailError}</span>
            </div>
          )}

          {/* Send Email button (if email exists) */}
          {customerEmail && emailStatus !== 'sent' && savedBillId && (
            <button
              onClick={handleSendEmail}
              disabled={emailStatus === 'sending'}
              id="send-email-btn"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 disabled:opacity-60 transition-all shadow-md shadow-indigo-500/20 text-sm active:scale-[0.98]"
            >
              {emailStatus === 'sending' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending Email…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Email Receipt</>
              )}
            </button>
          )}

          {/* Primary Action Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onClose}
              className="py-3 px-2 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-xs sm:text-sm text-center"
            >
              Close
            </button>
            <button
              onClick={onPrint}
              id="print-bill-btn"
              className="py-3 px-2 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onNewBill}
              id="new-bill-btn"
              className="py-3 px-2 rounded-2xl font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
