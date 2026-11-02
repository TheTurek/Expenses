import React, { useState, useMemo } from 'react';
import { Category, Expense, PaymentMethod } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDatePolish } from '../utils/formatters';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  ArrowUpDown,
  Tag,
  Plus,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAddNew: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEditExpense,
  onDeleteExpense,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Category filter
        if (selectedCategoryId && exp.categoryId !== selectedCategoryId) {
          return false;
        }
        // Payment method filter
        if (selectedMethod !== 'all' && exp.paymentMethod !== selectedMethod) {
          return false;
        }
        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesTitle = exp.title.toLowerCase().includes(q);
          const matchesNotes = exp.notes?.toLowerCase().includes(q);
          const cat = categoryMap.get(exp.categoryId);
          const matchesCat = cat?.name.toLowerCase().includes(q);
          if (!matchesTitle && !matchesNotes && !matchesCat) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        }
        if (sortBy === 'date-asc') {
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, selectedCategoryId, selectedMethod, searchTerm, sortBy, categoryMap]);

  const getMethodBadge = (method?: PaymentMethod) => {
    switch (method) {
      case 'blik':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
            <Smartphone className="w-3 h-3" />
            BLIK
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            <Landmark className="w-3 h-3" />
            Przelew
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
            <Banknote className="w-3 h-3" />
            Gotówka
          </span>
        );
      case 'card':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <CreditCard className="w-3 h-3" />
            Karta
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lista wydatków</h3>
            <p className="text-xs text-slate-500">
              {filteredAndSortedExpenses.length} z {expenses.length} pozycji w tym miesiącu
            </p>
          </div>

          <button
            onClick={onAddNew}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Dodaj wydatek
          </button>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj po nazwie, notatkach..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-hidden bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategoryId || 'all'}
              onChange={(e) =>
                onSelectCategory(e.target.value === 'all' ? null : e.target.value)
              }
              className="w-full py-1.5 px-2.5 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 bg-slate-50/50 outline-hidden focus:border-teal-500"
            >
              <option value="all">Wszystkie kategorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="sm:col-span-2">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 bg-slate-50/50 outline-hidden focus:border-teal-500"
            >
              <option value="all">Płatność: Wszystkie</option>
              <option value="card">Karta</option>
              <option value="blik">BLIK</option>
              <option value="transfer">Przelew</option>
              <option value="cash">Gotówka</option>
              <option value="other">Inne</option>
            </select>
          </div>

          {/* Sort */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs font-medium text-slate-700 rounded-lg border border-slate-200 bg-slate-50/50 outline-hidden focus:border-teal-500"
            >
              <option value="date-desc">Data (najnowsze)</option>
              <option value="date-asc">Data (najstarsze)</option>
              <option value="amount-desc">Kwota (najwyższa)</option>
              <option value="amount-asc">Kwota (najniższa)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredAndSortedExpenses.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-sm font-semibold text-slate-700">
            {expenses.length === 0
              ? 'Brak wydatków w tym miesiącu'
              : 'Nie znaleziono wydatków pasujących do filtrów'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {expenses.length === 0
              ? 'Wpisz pierwsze pozycje, aby rozpocząć monitorowanie budżetu.'
              : 'Spróbuj zmienić zapytanie lub wyczyścić filtry kategorii.'}
          </p>
          {expenses.length === 0 && (
            <button
              onClick={onAddNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj wydatek
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Tytuł wydatku</th>
                <th className="py-2.5 px-4">Kategoria</th>
                <th className="py-2.5 px-4">Płatność</th>
                <th className="py-2.5 px-4 text-right">Kwota</th>
                <th className="py-2.5 px-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedExpenses.map((exp) => {
                const cat = categoryMap.get(exp.categoryId);
                return (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDatePolish(exp.date)}</span>
                      </div>
                    </td>

                    {/* Title & Notes */}
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[240px]">
                      <div className="truncate">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] font-normal text-slate-400 truncate mt-0.5">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {cat ? (
                        <button
                          onClick={() => onSelectCategory(cat.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition"
                        >
                          <div
                            className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CategoryIcon iconName={cat.icon} className="w-2.5 h-2.5" />
                          </div>
                          <span className="truncate max-w-[140px]">{cat.name}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Brak kategorii</span>
                      )}
                    </td>

                    {/* Payment method */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getMethodBadge(exp.paymentMethod)}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-extrabold text-sm text-slate-900 whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          title="Edytuj wydatek"
                          onClick={() => onEditExpense(exp)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Usuń wydatek"
                          onClick={() => {
                            if (window.confirm(`Czy na pewno usunąć wydatek „${exp.title}”?`)) {
                              onDeleteExpense(exp.id);
                            }
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
