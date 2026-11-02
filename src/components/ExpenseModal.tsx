import React, { useState, useEffect } from 'react';
import { Category, Expense, PaymentMethod } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { X, Calendar, CreditCard, Banknote, Landmark, Smartphone, MoreHorizontal } from 'lucide-react';
import { getTodayDateString } from '../utils/formatters';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => void;
  categories: Category[];
  initialExpense?: Expense | null;
  defaultMonthKey?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialExpense,
  defaultMonthKey,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(String(initialExpense.amount));
      setCategoryId(initialExpense.categoryId);
      setDate(initialExpense.date);
      setPaymentMethod(initialExpense.paymentMethod || 'card');
      setNotes(initialExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategoryId(categories[0]?.id || '');
      // If defaultMonthKey is given (e.g. 2026-11), default to today if in same month, or 1st of that month
      const today = getTodayDateString();
      if (defaultMonthKey && !today.startsWith(defaultMonthKey)) {
        setDate(`${defaultMonthKey}-01`);
      } else {
        setDate(today);
      }
      setPaymentMethod('card');
      setNotes('');
    }
    setError('');
  }, [initialExpense, isOpen, categories, defaultMonthKey]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Podaj nazwę lub opis wydatku.');
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Podaj prawidłową kwotę większą od zera.');
      return;
    }

    if (!categoryId) {
      setError('Wybierz kategorię wydatku.');
      return;
    }

    if (!date) {
      setError('Wybierz datę wydatku.');
      return;
    }

    onSave({
      ...(initialExpense?.id ? { id: initialExpense.id } : {}),
      title: cleanTitle,
      amount: Math.round(numAmount * 100) / 100,
      categoryId,
      date,
      paymentMethod,
      notes: notes.trim(),
    });

    onClose();
  };

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'card', label: 'Karta', icon: CreditCard },
    { id: 'blik', label: 'BLIK', icon: Smartphone },
    { id: 'transfer', label: 'Przelew', icon: Landmark },
    { id: 'cash', label: 'Gotówka', icon: Banknote },
    { id: 'other', label: 'Inne', icon: MoreHorizontal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialExpense ? 'Edytuj wydatek' : 'Dodaj nowy wydatek'}
            </h2>
            <p className="text-xs text-slate-500">
              Wprowadź szczegóły płatności i przypisz ją do kategorii
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Amount and Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Kwota (PLN / zł) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-bold text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                PLN
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tytuł / Opis wydatku *
            </label>
            <input
              type="text"
              placeholder="np. Zakupy Biedronka, Paliwo, Czynsz..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-medium text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition bg-white"
            />
          </div>

          {/* Category Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Kategoria *
              </label>
              <span className="text-[11px] text-slate-400">
                {categories.length} dostępnych
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium border transition ${
                      isSelected
                        ? 'border-teal-500 bg-white shadow-xs text-teal-900 font-semibold'
                        : 'border-transparent hover:border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Data transakcji *
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm text-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition bg-white"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Sposób płatności
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {paymentMethods.map((pm) => {
                const IconComponent = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-medium border transition ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/80 text-teal-800'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mb-1 text-slate-600" />
                    <span className="text-[11px] truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notatki / Miejsce zakupu (opcjonalnie)
            </label>
            <textarea
              rows={2}
              placeholder="np. Sklep osiedlowy, paragon #4829, gwarancja..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-hidden transition bg-white resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow transition"
            >
              {initialExpense ? 'Zapisz zmiany' : 'Dodaj wydatek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
