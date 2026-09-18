import { useState, useMemo } from 'react';
import { Pencil, Plus, Trash2, Search, X, Utensils, IndianRupee, Image, Tag, Loader2, Sparkles } from 'lucide-react';
import type { FoodItem } from '../data/foodItems';
import { createMenuItem, deleteMenuItem, updateMenuItem } from '../services/api';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';

interface MenuPageProps {
  items: FoodItem[];
  onChanged: () => Promise<void>;
}

const blankItem = (): FoodItem => ({
  id: '',
  name: '',
  marathiName: '',
  price: 0,
  category: 'Bhel',
  image: '',
  imageCrop: '',
});

const DEFAULT_CATEGORIES = ['Bhel', 'Chaat', 'Puri', 'Snacks', 'Drinks', 'Special'];

export function MenuPage({ items, onChanged }: MenuPageProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<FoodItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const list = Array.from(new Set(['All', ...items.map((i) => i.category), ...DEFAULT_CATEGORIES]));
    return list;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.marathiName && item.marathiName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) {
      setError('Item name is required');
      return;
    }
    if (editing.price < 0) {
      setError('Price cannot be negative');
      return;
    }

    setSaving(true);
    setError('');
    const data = {
      name: editing.name.trim(),
      marathiName: editing.marathiName.trim(),
      price: Number(editing.price),
      category: editing.category.trim() || 'Bhel',
      image: editing.image.trim(),
      imageCrop: editing.imageCrop?.trim() || '',
    };

    try {
      if (editing.id) {
        await updateMenuItem(Number(editing.id), data);
        showToast(`Updated "${data.name}"`, 'success');
      } else {
        await createMenuItem(data);
        showToast(`Added "${data.name}" to menu`, 'success');
      }
      await onChanged();
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save menu item');
      showToast(err instanceof Error ? err.message : 'Could not save menu item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: FoodItem) => {
    try {
      await deleteMenuItem(Number(item.id));
      showToast(`Deleted "${item.name}"`, 'info');
      await onChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not remove item', 'error');
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50/60 p-3 sm:p-6 pb-24 w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full min-w-0">
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/70 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Utensils className="w-6 h-6 text-brand-500" />
              Menu Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Add or edit food items. Updates sync instantly across all POS devices.
            </p>
          </div>
          <button
            onClick={() => {
              setError('');
              setEditing(blankItem());
            }}
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-brand-500/25 transition-all active:scale-[0.98] flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search food items or Marathi names…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items List / Cards */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm divide-y divide-gray-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50/70 transition-colors"
            >
              {/* Item Thumbnail */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 overflow-hidden flex-shrink-0 relative border border-gray-100">
                <img
                  src={item.image || '/images/bhel puri.png'}
                  onError={(e) => {
                    e.currentTarget.src = '/images/bhel puri.png';
                  }}
                  className="w-full h-full object-cover"
                  alt={item.name}
                />
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/50 flex-shrink-0">
                    {item.category}
                  </span>
                </div>
                {item.marathiName && (
                  <p className="text-xs text-gray-500 truncate mt-0.5" lang="mr">
                    {item.marathiName}
                  </p>
                )}
                <p className="text-sm font-black text-brand-600 mt-1">₹{item.price}</p>
              </div>

              {/* Edit & Delete Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    setError('');
                    setEditing(item);
                  }}
                  className="p-2.5 sm:px-3.5 sm:py-2 rounded-xl text-brand-600 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                  title="Edit item"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setRemoving(item)}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-gray-400 p-4">
              <Utensils className="w-12 h-12 mx-auto mb-2 opacity-40 text-brand-500" />
              <p className="font-bold text-gray-700 text-base">No food items found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your category filter or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Item Modal Popup ── */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in no-print"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-sheet sm:animate-popup border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden bg-gradient-to-r from-brand-500 to-orange-400">
              <div className="w-12 h-1.5 bg-white/40 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-500 to-orange-400 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {editing.id ? 'Edit Food Item' : 'Add New Food Item'}
                </h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={save} className="flex flex-col flex-1 overflow-hidden" noValidate>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-3 text-xs sm:text-sm font-semibold">
                    ⚠️ {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                    Item Name (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="e.g. Special Sukha Bhel"
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>

                {/* Marathi Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                    Marathi Name <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    value={editing.marathiName}
                    onChange={(e) => setEditing({ ...editing, marathiName: e.target.value })}
                    placeholder="e.g. स्पेशल सुका भेळ"
                    className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                </div>

                {/* Price & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                      Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="number"
                        min="0"
                        value={editing.price || ''}
                        onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) || 0 })}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        placeholder="e.g. Bhel"
                        list="category-suggestions"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                      <datalist id="category-suggestions">
                        {DEFAULT_CATEGORIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Image Path / URL */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                    Image URL or Path <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={editing.image}
                      onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                      placeholder="/images/bhel puri.png or https://…"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 px-5 py-4 border-t border-gray-100 bg-white flex-shrink-0 safe-bottom">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-300 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-brand-500/25 active:scale-[0.98]"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
                  ) : (
                    <>{editing.id ? 'Save Changes' : 'Add Item'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Dialog */}
      <ConfirmDialog
        open={!!removing}
        title="Delete Menu Item?"
        message={`Are you sure you want to remove "${removing?.name}" from the POS menu?`}
        confirmLabel="Delete Item"
        variant="danger"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) {
            remove(removing)
              .catch((err) => setError(err instanceof Error ? err.message : 'Could not remove item'))
              .finally(() => setRemoving(null));
          }
        }}
      />
    </main>
  );
}
