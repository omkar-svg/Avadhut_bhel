import type { CartItemType } from './CartItem';

interface BillPreviewProps {
  items: CartItemType[];
  subtotal: number;
  discount: number;
  billNumber: string;
  onClose: () => void;
  onPrint: () => void;
  onNewBill: () => void;
}

export function BillPreview({
  items,
  subtotal,
  discount,
  billNumber,
  onClose,
  onPrint,
  onNewBill
}: BillPreviewProps) {
  const total = Math.max(0, subtotal - discount);
  const now = new Date();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-full">
        {/* Printable Area - We visually render it here but this is also what gets printed */}
        <div id="print-area" className="p-6 bg-white overflow-y-auto print-only flex-1">
          <div className="text-center mb-6">
            <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-2 mb-4">
              <h1 className="text-2xl font-black tracking-wider text-gray-900">AVADHUT BHEL</h1>
              <p className="text-sm font-medium text-gray-600">Delicious & Fresh</p>
            </div>
            
            <div className="text-left text-sm text-gray-600 space-y-1">
              <p><span className="font-semibold">Bill No:</span> {billNumber}</p>
              <p><span className="font-semibold">Date:</span> {now.toLocaleDateString()}</p>
              <p><span className="font-semibold">Time:</span> {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 font-semibold">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center w-12">Qty</th>
                  <th className="pb-2 text-right w-16">Price</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {items.map((item) => (
                  <tr key={item.id} className="text-gray-900">
                    <td className="py-1.5">{item.name}</td>
                    <td className="py-1.5 text-center">{item.quantity}</td>
                    <td className="py-1.5 text-right font-medium">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5 text-sm mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span>₹{discount}</span>
            </div>
            <div className="border-t border-gray-300 pt-1.5 flex justify-between font-bold text-base text-gray-900 mt-2">
              <span>TOTAL</span>
              <span>₹{total}</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 border-t-2 border-b-2 border-dashed border-gray-300 py-2">
            <p className="font-medium">Thank You!</p>
            <p>Visit Again 🙂</p>
          </div>
        </div>

        {/* Action Buttons - Not printed */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onPrint}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            Print Bill
          </button>
          <button
            onClick={onNewBill}
            className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20"
          >
            New Bill
          </button>
        </div>
      </div>
    </div>
  );
}
