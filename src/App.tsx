import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { SearchBar } from './components/SearchBar';
import { FoodCard } from './components/FoodCard';
import { Cart } from './components/Cart';
import { BillPreview } from './components/BillPreview';
import { foodItems, type FoodItem } from './data/foodItems';
import type { CartItemType } from './components/CartItem';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [discount, setDiscount] = useState(0);
  const [billNumberCounter, setBillNumberCounter] = useState(1);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Derived state
  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const currentBillNumber = `BILL-${billNumberCounter.toString().padStart(3, '0')}`;

  // Actions
  const handleAddToBill = (item: FoodItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleNewBill = () => {
    if (cartItems.length > 0 && !showBillPreview) {
      if (!window.confirm("Clear current bill and start a new one?")) {
        return;
      }
    }
    
    // If coming from printed bill, we increment the bill number
    if (showBillPreview) {
      setBillNumberCounter(prev => prev + 1);
    } else if (cartItems.length > 0) {
      setBillNumberCounter(prev => prev + 1); // Also increment if they just cleared an active bill manually
    }
    
    setCartItems([]);
    setDiscount(0);
    setShowBillPreview(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header onNewBill={handleNewBill} />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-gray-50/50">
        {/* Left Section - Menu */}
        <div className="flex-1 flex flex-col h-full overflow-hidden no-print">
          <div className="p-4 sm:p-6 pb-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10 sticky top-0 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredItems.map(item => (
                <FoodCard key={item.id} item={item} onAdd={handleAddToBill} />
              ))}
              
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p className="text-lg">No items found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Cart (Desktop) */}
        <div className="hidden md:block w-80 lg:w-[400px] border-l border-gray-200 z-20">
          <Cart
            items={cartItems}
            subtotal={subtotal}
            discount={discount}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            onDiscountChange={setDiscount}
            onGenerateBill={() => setShowBillPreview(true)}
          />
        </div>
      </main>

      {/* Mobile Floating Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.1)] flex justify-between items-center no-print">
        <div>
          <p className="text-sm text-gray-500 font-medium">{cartItems.length} items</p>
          <p className="text-lg font-bold text-gray-900">₹{Math.max(0, subtotal - discount)}</p>
        </div>
        <button
          onClick={() => setShowMobileCart(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
        >
          View Bill
        </button>
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-50 flex flex-col no-print slide-in-bottom">
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-10">
            <h2 className="text-lg font-bold text-gray-900">Current Bill</h2>
            <button 
              onClick={() => setShowMobileCart(false)} 
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Cart
              items={cartItems}
              subtotal={subtotal}
              discount={discount}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              onDiscountChange={setDiscount}
              onGenerateBill={() => {
                setShowMobileCart(false);
                setShowBillPreview(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Bill Preview Modal */}
      {showBillPreview && (
        <BillPreview
          items={cartItems}
          subtotal={subtotal}
          discount={discount}
          billNumber={currentBillNumber}
          onClose={() => setShowBillPreview(false)}
          onPrint={handlePrint}
          onNewBill={handleNewBill}
        />
      )}
    </div>
  );
}

export default App;
