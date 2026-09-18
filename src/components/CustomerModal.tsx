import { useState, useEffect, useCallback } from 'react';
import {
  User, Phone, Mail, ChevronRight, X,
  Search, BookUser, UserPlus, Check,
  Loader2, Star, Trash2, ShoppingBag, AlertCircle
} from 'lucide-react';
import { getCustomers, createCustomer, deleteCustomer, type CustomerRecord } from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  customerId?: number;
}

interface CustomerModalProps {
  onConfirm: (info: CustomerInfo) => void;
  onCancel: () => void;
}

type Tab = 'saved' | 'new';

export function CustomerModal({ onConfirm, onCancel }: CustomerModalProps) {
  const [tab, setTab] = useState<Tab>('saved');

  // ── Saved customers ──────────────────────────────────────────────
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [backendDown, setBackendDown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── New customer form ────────────────────────────────────────────
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saveToDb, setSaveToDb] = useState(true);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Fetch saved customers ────────────────────────────────────────
  const fetchCustomers = useCallback(async (q?: string) => {
    setLoadingCustomers(true);
    try {
      const data = await getCustomers(q);
      setCustomers(data);
      setBackendDown(false);
    } catch {
      setCustomers([]);
      setBackendDown(true);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(searchQuery || undefined), 300);
    return () => clearTimeout(t);
  }, [searchQuery, fetchCustomers]);

  // ── Saved customer confirm ───────────────────────────────────────
  const handleSelectConfirm = () => {
    if (!selectedCustomer) return;
    onConfirm({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email || '',
      customerId: selectedCustomer.id,
    });
  };

  // ── Walk-in / General sale ───────────────────────────────────────
  const handleWalkIn = () => {
    onConfirm({ name: 'Walk-in Customer', phone: '-', email: '' });
  };

  // ── Delete customer ──────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deletingCustomer) return;
    const id = deletingCustomer.id;
    setDeletingId(id);
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
      setDeletingCustomer(null);
    }
  };

  // ── New customer form submit ─────────────────────────────────────
  const validate = () => {
    let ok = true;
    if (!name.trim()) { setNameError('Name is required'); ok = false; }
    else setNameError('');
    if (!phone.trim()) { setPhoneError('Phone is required'); ok = false; }
    else if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) { setPhoneError('Enter a valid 10-digit number'); ok = false; }
    else setPhoneError('');
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address'); ok = false;
    } else setEmailError('');
    return ok;
  };

  const handleNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    let savedId: number | undefined;
    if (saveToDb && !backendDown) {
      try {
        const saved = await createCustomer({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
        });
        savedId = saved.id;
      } catch {
        // silently ignore duplicate/backend errors
      }
    }
    setSaving(false);
    onConfirm({ name: name.trim(), phone: phone.trim(), email: email.trim(), customerId: savedId });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in no-print"
        onClick={onCancel}
      >
        {/* Bottom sheet on mobile, rounded card on desktop */}
        <div
          className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-sheet sm:animate-popup"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile drag handle */}
          <div className="pt-3 pb-1 flex justify-center sm:hidden bg-gradient-to-r from-brand-500 to-orange-400">
            <div className="w-12 h-1.5 bg-white/40 rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-orange-400 px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Customer Details</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-0.5">Quick search saved customer or add new</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Walk-in Bill Button */}
          <div className="px-4 pt-3 pb-1 flex-shrink-0">
            <button
              onClick={handleWalkIn}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-dashed border-brand-300 text-brand-700 bg-brand-50/50 hover:bg-brand-50 active:bg-brand-100 transition-all text-sm font-bold active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              Quick Bill — Walk-in Customer (General Calculation)
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 mx-4 mt-2 rounded-2xl flex-shrink-0">
            <button
              onClick={() => setTab('saved')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === 'saved'
                  ? 'text-brand-700 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookUser className="w-4 h-4" />
              <span>Saved</span>
              {customers.length > 0 && (
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {customers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('new')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === 'new'
                  ? 'text-brand-700 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </div>

          {/* TAB 1: SAVED CUSTOMERS */}
          {tab === 'saved' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Search */}
              <div className="px-4 py-2.5 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone or email…"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Customer List */}
              <div className="flex-1 overflow-y-auto px-4 py-1">
                {backendDown && (
                  <div className="mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs sm:text-sm text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>Backend server offline. You can still create a quick bill or add a customer directly.</span>
                  </div>
                )}
                {loadingCustomers ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                    <span className="text-xs font-semibold">Loading customers…</span>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="py-12 text-center px-4">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <BookUser className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-gray-700 text-sm sm:text-base">
                      {searchQuery ? 'No customers found' : 'No saved customers yet'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery ? 'Try another keyword or phone number' : 'Add your first regular customer for quick billing'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setTab('new')}
                        className="mt-3 px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-brand-100 transition-colors"
                      >
                        + Add First Customer
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pb-3">
                    {customers.map(c => {
                      const isSelected = selectedCustomer?.id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCustomer(prev => prev?.id === c.id ? null : c)}
                          className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                              : 'bg-white border-gray-100 hover:border-gray-300 active:bg-gray-50'
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-colors ${
                              isSelected ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-gray-900 truncate text-sm sm:text-base">{c.name}</p>
                              {c.totalOrders > 0 && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 flex-shrink-0">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">📞 {c.phone}</p>
                            {c.email && <p className="text-[11px] text-gray-400 truncate">✉️ {c.email}</p>}
                          </div>

                          {/* Check / Delete */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isSelected ? (
                              <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setDeletingCustomer(c);
                                }}
                                disabled={deletingId === c.id}
                                className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete Customer"
                              >
                                {deletingId === c.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom actions */}
              <div className="px-4 py-3.5 border-t border-gray-100 bg-white flex-shrink-0 space-y-2 safe-bottom">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectConfirm}
                    disabled={!selectedCustomer}
                    id="confirm-saved-customer-btn"
                    className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 active:bg-brand-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                  >
                    Generate Bill <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEW CUSTOMER */}
          {tab === 'new' && (
            <form onSubmit={handleNewSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="customer-name"
                      type="text"
                      value={name}
                      autoComplete="name"
                      autoFocus
                      onChange={e => { setName(e.target.value); setNameError(''); }}
                      placeholder="e.g. Ramesh Shinde"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                        nameError ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                      }`}
                    />
                  </div>
                  {nameError && <p className="text-rose-600 text-xs font-semibold mt-1">{nameError}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="customer-phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      autoComplete="tel"
                      onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                      placeholder="e.g. 9876543210"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                        phoneError ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                      }`}
                    />
                  </div>
                  {phoneError && <p className="text-rose-600 text-xs font-semibold mt-1">{phoneError}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                    Email Address <span className="text-gray-400 font-normal text-xs">(optional for digital receipt)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="customer-email"
                      type="email"
                      inputMode="email"
                      value={email}
                      autoComplete="email"
                      onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="e.g. customer@gmail.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                        emailError ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 bg-gray-50/50 focus:bg-white'
                      }`}
                    />
                  </div>
                  {emailError && <p className="text-rose-600 text-xs font-semibold mt-1">{emailError}</p>}
                </div>

                {/* Save to DB checkbox */}
                {!backendDown && (
                  <label className="flex items-center gap-3 bg-brand-50/60 border border-brand-200/60 rounded-2xl p-3.5 cursor-pointer hover:bg-brand-50 transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={saveToDb}
                      onChange={e => setSaveToDb(e.target.checked)}
                      className="w-5 h-5 rounded-lg text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Save to Customer Directory</p>
                      <p className="text-[11px] text-gray-500">Quickly select this customer for future orders</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-2.5 px-4 py-3.5 border-t border-gray-100 bg-white flex-shrink-0 safe-bottom">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-customer-btn"
                  disabled={saving}
                  className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                  ) : (
                    <>Generate Bill <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Customer Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingCustomer}
        title="Delete Customer?"
        message={`Are you sure you want to remove "${deletingCustomer?.name}" from your saved customer records?`}
        confirmLabel="Delete"
        variant="danger"
        onCancel={() => setDeletingCustomer(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
