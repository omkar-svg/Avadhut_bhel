import { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { SearchBar } from './components/SearchBar';
import { FoodCard } from './components/FoodCard';
import { Cart } from './components/Cart';
import { BillPreview } from './components/BillPreview';
import { CustomerModal, type CustomerInfo } from './components/CustomerModal';
import { ReportsPage } from './components/ReportsPage';
import { MenuPage } from './components/MenuPage';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastProvider, useToast } from './components/Toast';
import { foodItems, type FoodItem } from './data/foodItems';
import type { CartItemType } from './components/CartItem';
import { createBill, getBills, getMenuItems } from './services/api';
import { ShoppingBag, X, Receipt } from 'lucide-react';

function POSApp() {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [menuItems, setMenuItems] = useState<FoodItem[]>(foodItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pos' | 'reports' | 'menu'>('pos');

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [discount, setDiscount] = useState(0);
  const [billNumberCounter, setBillNumberCounter] = useState(1);
  const [billNumberReady, setBillNumberReady] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [billSaving, setBillSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Customer info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
  });
  const [savedBillId, setSavedBillId] = useState<number | null>(null);

  // Derived state
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.marathiName && item.marathiName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const menuCategories = useMemo(
    () => ['All', ...Array.from(new Set(menuItems.map((item) => item.category)))],
    [menuItems],
  );

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      map.set(item.id, item.quantity);
    }
    return map;
  }, [cartItems]);

  const currentBillNumber = `BILL-${billNumberCounter.toString().padStart(3, '0')}`;

  useEffect(() => {
    let cancelled = false;

    getBills()
      .then((bills) => {
        const highestNumber = bills.reduce((highest, bill) => {
          const match = /^BILL-(\d+)$/i.exec(bill.billNumber);
          return match ? Math.max(highest, Number(match[1])) : highest;
        }, 0);

        if (!cancelled) {
          setBillNumberCounter(highestNumber + 1);
        }
      })
      .catch((error) => {
        console.error('Could not load existing bills:', error);
      })
      .finally(() => {
        if (!cancelled) {
          setBillNumberReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshMenu = async () => {
    const items = await getMenuItems();
    setMenuItems(
      items.map((item) => ({
        ...item,
        id: String(item.id),
        image: item.image || '',
        imageCrop: item.imageCrop || '',
      })),
    );
  };

  useEffect(() => {
    getMenuItems()
      .then((items) => {
        if (items.length) {
          setMenuItems(
            items.map((item) => ({
              ...item,
              id: String(item.id),
              image: item.image || '',
              imageCrop: item.imageCrop || '',
            })),
          );
        }
      })
      .catch((error) => console.error('Could not load menu items:', error));
  }, []);

  // Actions
  const handleAddToBill = (item: FoodItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`Added ${item.name}`, 'info');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  const handleRemoveItem = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showToast(`Removed ${item.name}`, 'warning');
    }
  };

  const handleNewBill = () => {
    if (cartItems.length > 0 && !showBillPreview) {
      setShowClearConfirm(true);
      return;
    }
    startNewBill();
  };

  const startNewBill = () => {
    if (showBillPreview || cartItems.length > 0) {
      setBillNumberCounter((prev) => prev + 1);
    }
    setCartItems([]);
    setDiscount(0);
    setShowBillPreview(false);
    setShowMobileCart(false);
    setSavedBillId(null);
    setCustomerInfo({ name: '', phone: '', email: '' });
    showToast('Started new bill', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateBillClick = () => {
    setShowCustomerModal(true);
    setShowMobileCart(false);
  };

  const handleQuickSave = async (): Promise<void> => {
    const total = Math.max(0, subtotal - discount);
    const billNum = currentBillNumber;

    try {
      await createBill({
        billNumber: billNum,
        customerName: 'Walk-in Customer',
        customerPhone: '-',
        customerEmail: '',
        subtotal,
        discount,
        total,
        sendEmail: false,
        items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      });

      showToast(`Saved ${billNum} to Daily Sales!`, 'success');
      setBillNumberCounter((prev) => prev + 1);
      setCartItems([]);
      setDiscount(0);
      setShowMobileCart(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save bill', 'error');
    }
  };

  const handleCustomerConfirm = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setShowCustomerModal(false);
    setShowMobileCart(false);
    setShowBillPreview(true);

    const total = Math.max(0, subtotal - discount);
    setBillSaving(true);
    createBill({
      billNumber: currentBillNumber,
      customerName: info.name,
      customerPhone: info.phone,
      customerEmail: info.email,
      customerId: info.customerId,
      subtotal,
      discount,
      total,
      sendEmail: false,
      items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    })
      .then((saved) => {
        setSavedBillId(saved.id);
        showToast(`Bill ${currentBillNumber} saved to reports`, 'success');
      })
      .catch((err) => {
        console.error('Bill save failed:', err);
        setSavedBillId(null);
        showToast('Bill preview created (saved locally)', 'warning');
      })
      .finally(() => {
        setBillSaving(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50/50 w-full max-w-full overflow-x-hidden">
      <Header onNewBill={handleNewBill} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'reports' ? (
        <main className="flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
          <ReportsPage />
        </main>
      ) : activeTab === 'menu' ? (
        <div className="flex-1 overflow-y-auto w-full max-w-full min-w-0 overflow-x-hidden">
          <MenuPage items={menuItems} onChanged={refreshMenu} />
        </div>
      ) : (
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden w-full max-w-full min-w-0">
          {/* Left Section - Menu Items Grid */}
          <div className="flex-1 flex flex-col h-full overflow-hidden no-print w-full min-w-0 max-w-full">
            {/* Top Filter Bar (Sticky) */}
            <div className="p-3 sm:p-4 md:p-5 bg-white/95 backdrop-blur-md border-b border-gray-200/80 z-10 sticky top-0 shadow-xs space-y-2.5 w-full min-w-0 max-w-full overflow-hidden">
              <CategoryTabs
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                categories={menuCategories}
              />
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Menu Cards Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-28 md:pb-6 w-full min-w-0 max-w-full overflow-x-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {filteredItems.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onAdd={handleAddToBill}
                    inCartCount={cartItemMap.get(item.id) || 0}
                  />
                ))}

                {filteredItems.length === 0 && (
                  <div className="col-span-full py-16 text-center text-gray-400">
                    <p className="text-base sm:text-lg font-bold text-gray-600">No food items found</p>
                    <p className="text-xs text-gray-400 mt-1">Try another search term or select &quot;All&quot; categories.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Desktop Cart */}
          <div className="hidden md:block w-80 lg:w-[380px] xl:w-[420px] border-l border-gray-200/80 z-20">
            <Cart
              items={cartItems}
              subtotal={subtotal}
              discount={discount}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              onDiscountChange={setDiscount}
              onGenerateBill={handleGenerateBillClick}
              onQuickSave={handleQuickSave}
              billNumberReady={billNumberReady}
            />
          </div>
        </main>
      )}

      {/* ── Mobile Floating Bottom Bar ── */}
      {activeTab === 'pos' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 safe-bottom z-30 pointer-events-none no-print">
          <div className="pointer-events-auto bg-gray-950/90 text-white backdrop-blur-xl border border-white/10 p-3 px-4 rounded-3xl shadow-2xl flex items-center justify-between gap-3 animate-toast-slide-down">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} in bill
                </p>
                <p className="text-lg font-black text-white leading-tight">
                  ₹{Math.max(0, subtotal - discount)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMobileCart(true)}
              className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 active:scale-95 text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>{cartItems.length === 0 ? 'View Bill' : `Bill (${totalQuantity})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Cart Bottom Sheet Drawer ── */}
      {showMobileCart && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end no-print animate-fade-in"
          onClick={() => setShowMobileCart(false)}
        >
          <div
            className="bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center bg-gray-50 border-b border-gray-100">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-gray-900">Current Order</h2>
                <p className="text-xs text-gray-500">
                  {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} · ₹{Math.max(0, subtotal - discount)}
                </p>
              </div>
              <button
                onClick={() => setShowMobileCart(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto">
              <Cart
                items={cartItems}
                subtotal={subtotal}
                discount={discount}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                onDiscountChange={setDiscount}
                onGenerateBill={handleGenerateBillClick}
                onQuickSave={handleQuickSave}
                billNumberReady={billNumberReady}
              />
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          onConfirm={handleCustomerConfirm}
          onCancel={() => setShowCustomerModal(false)}
        />
      )}

      {/* Bill Preview Modal */}
      {showBillPreview && (
        <BillPreview
          items={cartItems}
          subtotal={subtotal}
          discount={discount}
          billNumber={currentBillNumber}
          customerName={customerInfo.name}
          customerPhone={customerInfo.phone}
          customerEmail={customerInfo.email}
          savedBillId={savedBillId}
          billSaving={billSaving}
          onClose={() => setShowBillPreview(false)}
          onPrint={handlePrint}
          onNewBill={handleNewBill}
        />
      )}

      {/* Clear Bill Confirmation Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Start a New Bill?"
        message="Your current bill items will be cleared. Do you want to proceed?"
        confirmLabel="Clear &amp; Start New"
        variant="warning"
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => {
          setShowClearConfirm(false);
          startNewBill();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <POSApp />
    </ToastProvider>
  );
}
