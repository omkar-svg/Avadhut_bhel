import { useState, useEffect } from 'react';
import { Store, Clock, BarChart2, ShoppingBag, Utensils, Plus } from 'lucide-react';

interface HeaderProps {
  onNewBill: () => void;
  activeTab: 'pos' | 'reports' | 'menu';
  onTabChange: (tab: 'pos' | 'reports' | 'menu') => void;
}

export function Header({ onNewBill, activeTab, onTabChange }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-xs px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between no-print sticky top-0 z-40 border-b border-gray-200/80 gap-1.5 sm:gap-3 w-full max-w-full overflow-hidden">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-0">
        <div className="bg-gradient-to-br from-brand-500 to-orange-600 p-1.5 sm:p-2 rounded-xl text-white shadow-md shadow-brand-500/20 flex-shrink-0">
          <Store className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xs sm:text-base md:text-lg font-black text-gray-900 tracking-tight leading-none truncate">
            AVADHUT<span className="hidden xs:inline"> BHEL</span>
          </h1>
          <p className="text-[9px] sm:text-xs text-brand-600 font-bold hidden sm:block leading-tight mt-0.5">
            Fresh &amp; Tasty
          </p>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <nav className="flex items-center gap-0.5 sm:gap-1 bg-gray-100/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-gray-200/50 flex-shrink-0">
        <button
          onClick={() => onTabChange('pos')}
          className={`flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'pos'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>POS</span>
        </button>
        <button
          onClick={() => onTabChange('menu')}
          className={`flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'menu'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Menu</span>
        </button>
        <button
          onClick={() => onTabChange('reports')}
          className={`flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Reports</span>
        </button>
      </nav>

      {/* Right Side: Clock & New Bill */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <div className="hidden md:flex items-center gap-1.5 text-gray-500 text-xs font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/60">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {activeTab === 'pos' && (
          <button
            onClick={onNewBill}
            className="flex items-center gap-1 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 text-brand-700 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold transition-colors text-xs sm:text-sm border border-brand-200/60"
            title="Start New Bill"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Bill</span>
          </button>
        )}
      </div>
    </header>
  );
}
