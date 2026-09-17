import { useState, useEffect } from 'react';
import { Store, Clock } from 'lucide-react';

interface HeaderProps {
  onNewBill: () => void;
}

export function Header({ onNewBill }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between no-print sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="bg-brand-500 p-2 rounded-lg text-white">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">AVADHUT BHEL</h1>
          <p className="text-xs text-gray-500 font-medium">Delicious & Fresh</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm font-medium">
          <Clock className="w-4 h-4" />
          <span>{time.toLocaleDateString()} {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        <button
          onClick={onNewBill}
          className="bg-brand-50 text-brand-700 hover:bg-brand-100 px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm"
        >
          New Bill
        </button>
      </div>
    </header>
  );
}
