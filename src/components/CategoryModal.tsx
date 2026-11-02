import React, { useState } from 'react';
import { Category, Expense } from '../types';
import { CategoryIcon, AVAILABLE_ICONS, CATEGORY_PALETTE } from './CategoryIcon';
import { X, Plus, Edit2, Trash2, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  expenses: Expense[];
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string, reassignToId?: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  expenses,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'delete-confirm'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(CATEGORY_PALETTE[0].hex);
  const [formIcon, setFormIcon] = useState(AVAILABLE_ICONS[0].id);
  const [formBudget, setFormBudget] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const startCreate = () => {
    setFormName('');
    setFormColor(CATEGORY_PALETTE[Math.floor(Math.random() * CATEGORY_PALETTE.length)].hex);
    setFormIcon('Tag');
    setFormBudget('');
    setFormError('');
    setMode('create');
  };

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormColor(cat.color);
    setFormIcon(cat.icon);
    setFormBudget(cat.budget ? String(cat.budget) : '');
    setFormError('');
    setMode('edit');
  };

  const startDelete = (cat: Category) => {
    const usageCount = expenses.filter((e) => e.categoryId === cat.id).length;
    setCategoryToDelete(cat);
    const otherCategories = categories.filter((c) => c.id !== cat.id);
    setReassignTargetId(otherCategories[0]?.id || '');
    if (usageCount > 0) {
      setMode('delete-confirm');
    } else {
      // No expenses, safe delete with confirm
      setMode('delete-confirm');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formName.trim();
    if (!cleanName) {
      setFormError('Nazwa kategorii nie może być pusta.');
      return;
    }

    // Check duplicate names
    const isDuplicate = categories.some(
      (c) =>
        c.name.toLowerCase() === cleanName.toLowerCase() &&
        (mode === 'create' || c.id !== editingCategory?.id)
    );
    if (isDuplicate) {
      setFormError('Kategoria o takiej nazwie już istnieje.');
      return;
    }

    const budgetVal = formBudget ? parseFloat(formBudget.replace(',', '.')) : undefined;

    if (mode === 'create') {
      onAddCategory({
        name: cleanName,
        color: formColor,
        icon: formIcon,
        budget: budgetVal && !isNaN(budgetVal) && budgetVal > 0 ? budgetVal : undefined,
      });
    } else if (mode === 'edit' && editingCategory) {
      onEditCategory({
        ...editingCategory,
        name: cleanName,
        color: formColor,
        icon: formIcon,
        budget: budgetVal && !isNaN(budgetVal) && budgetVal > 0 ? budgetVal : undefined,
      });
    }

    setMode('list');
  };

  const handleConfirmDelete = (reassign: boolean) => {
    if (!categoryToDelete) return;
    onDeleteCategory(categoryToDelete.id, reassign ? reassignTargetId : undefined);
    setCategoryToDelete(null);
    setMode('list');
  };

  // Usage count helper
  const getUsageCount = (categoryId: string) =>
    expenses.filter((e) => e.categoryId === categoryId).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {mode === 'list' && 'Zarządzanie kategoriami'}
              {mode === 'create' && 'Dodaj nową kategorię'}
              {mode === 'edit' && `Edycja kategorii: ${editingCategory?.name}`}
              {mode === 'delete-confirm' && `Usuwanie kategorii: ${categoryToDelete?.name}`}
            </h2>
            <p className="text-xs text-slate-500">
              Dostosuj kategorie wydatków do własnego stylu życia i budżetu
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {/* LIST VIEW */}
          {mode === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Twoje kategorie ({categories.length})
                </span>
                <button
                  onClick={startCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Dodaj nową kategorię
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const count = getUsageCount(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs group transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {cat.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{count} {count === 1 ? 'wydatek' : 'wydatków'}</span>
                            {cat.budget && (
                              <span className="text-teal-600 font-medium truncate">
                                • {formatCurrency(cat.budget)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Edytuj kategorię"
                          onClick={() => startEdit(cat)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {categories.length > 1 && (
                          <button
                            title="Usuń kategorię"
                            onClick={() => startDelete(cat)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CREATE & EDIT FORM */}
          {(mode === 'create' || mode === 'edit') && (
            <form onSubmit={handleSaveForm} className="space-y-4">
              {formError && (
                <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nazwa kategorii *
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="np. Edukacja, Samochód, Podróże..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition bg-white"
                />
              </div>

              {/* Color selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kolor kategorii
                </label>
                <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  {CATEGORY_PALETTE.map((pal) => (
                    <button
                      key={pal.hex}
                      type="button"
                      onClick={() => setFormColor(pal.hex)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-2xs relative"
                      style={{ backgroundColor: pal.hex }}
                    >
                      {formColor === pal.hex && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ikona
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  {AVAILABLE_ICONS.map((iconItem) => {
                    const isSelected = formIcon === iconItem.id;
                    const IconComp = iconItem.icon;
                    return (
                      <button
                        key={iconItem.id}
                        type="button"
                        title={iconItem.label}
                        onClick={() => setFormIcon(iconItem.id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs scale-105 ring-2 ring-teal-500'
                            : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly budget goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Miesięczny limit budżetu dla tej kategorii (opcjonalnie)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="np. 800"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full text-sm text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition bg-white"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    PLN / miesiąc
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pomoże śledzić, czy nie przekraczasz założeń w danym miesiącu.
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Powrót do listy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition"
                >
                  {mode === 'create' ? 'Dodaj kategorię' : 'Zapisz zmiany'}
                </button>
              </div>
            </form>
          )}

          {/* DELETE CONFIRM VIEW */}
          {mode === 'delete-confirm' && categoryToDelete && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold">
                    Czy na pewno chcesz usunąć kategorię „{categoryToDelete.name}”?
                  </p>
                  {getUsageCount(categoryToDelete.id) > 0 ? (
                    <p className="mt-1">
                      Do tej kategorii jest przypisanych{' '}
                      <strong>{getUsageCount(categoryToDelete.id)}</strong> wydatków. Wybierz co
                      chcesz z nimi zrobić:
                    </p>
                  ) : (
                    <p className="mt-1">
                      Ta kategoria nie ma przypisanych żadnych wydatków i zostanie trwale usunięta.
                    </p>
                  )}
                </div>
              </div>

              {getUsageCount(categoryToDelete.id) > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                      Przenieś wydatki do innej kategorii (Zalecane):
                    </label>
                    <select
                      value={reassignTargetId}
                      onChange={(e) => setReassignTargetId(e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 p-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {categories
                        .filter((c) => c.id !== categoryToDelete.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(true)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition"
                    >
                      Przenieś wydatki i usuń tę kategorię
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(false)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                    >
                      Usuń kategorię wraz ze wszystkimi przypisanymi wydatkami
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition"
                  >
                    Usuń kategorię
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
