import React, { useState, useEffect, useMemo } from 'react';
import { AppData, Category, Expense } from './types';
import { loadAppData, saveAppData, exportMonthCsv } from './utils/storage';
import {
  formatCurrency,
  formatMonthKey,
  getMonthKey,
  getPreviousMonthKey,
  getNextMonthKey,
  getTodayDateString,
  formatPercent,
} from './utils/formatters';
import { MonthlyChart } from './components/MonthlyChart';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseModal } from './components/ExpenseModal';
import { CategoryModal } from './components/CategoryModal';
import { LocalDataModal } from './components/LocalDataModal';
import { ArchiveView } from './components/ArchiveView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  Archive,
  HardDrive,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
  Target,
  Edit2,
  Check,
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());

  // Navigation tab: 'monthly' | 'archive'
  const [activeTab, setActiveTab] = useState<'monthly' | 'archive'>('monthly');

  // Currently selected month: 'YYYY-MM'
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => {
    return getMonthKey(new Date());
  });

  // Filter category in monthly view
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLocalDataModalOpen, setIsLocalDataModalOpen] = useState(false);

  // Editing monthly budget goal
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Save to localStorage on any state change
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Expenses in currently selected month
  const currentMonthExpenses = useMemo(() => {
    return data.expenses.filter((e) => e.date.startsWith(selectedMonthKey));
  }, [data.expenses, selectedMonthKey]);

  // Total spent in currently selected month
  const currentMonthTotal = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  // Expenses in previous month for comparison
  const previousMonthKey = useMemo(
    () => getPreviousMonthKey(selectedMonthKey),
    [selectedMonthKey]
  );
  const previousMonthTotal = useMemo(() => {
    return data.expenses
      .filter((e) => e.date.startsWith(previousMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [data.expenses, previousMonthKey]);

  // Month-over-month comparison percent
  const monthOverMonthChange = useMemo(() => {
    if (previousMonthTotal === 0) return null;
    return ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
  }, [currentMonthTotal, previousMonthTotal]);

  // Category breakdown for current month
  const categoryBreakdownData = useMemo(() => {
    const map = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        color: string;
        icon: string;
        amount: number;
        count: number;
        budget?: number;
      }
    >();

    // Initialize all existing categories so they appear in distribution
    data.categories.forEach((cat) => {
      map.set(cat.id, {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        icon: cat.icon,
        amount: 0,
        count: 0,
        budget: cat.budget,
      });
    });

    // Accumulate expenses
    currentMonthExpenses.forEach((exp) => {
      const existing = map.get(exp.categoryId);
      if (existing) {
        existing.amount += exp.amount;
        existing.count += 1;
      } else {
        // Fallback for an expense whose category might have been deleted or missing
        map.set(exp.categoryId, {
          categoryId: exp.categoryId,
          categoryName: 'Inne',
          color: '#94a3b8',
          icon: 'Tag',
          amount: exp.amount,
          count: 1,
        });
      }
    });

    // Convert to array and calculate percentage
    const list = Array.from(map.values())
      .filter((item) => item.amount > 0)
      .map((item) => ({
        ...item,
        percentage:
          currentMonthTotal > 0 ? (item.amount / currentMonthTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return list;
  }, [data.categories, currentMonthExpenses, currentMonthTotal]);

  // Daily average in selected month
  const daysInMonth = useMemo(() => {
    const [year, month] = selectedMonthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }, [selectedMonthKey]);

  const dailyAverage = useMemo(() => {
    return daysInMonth > 0 ? currentMonthTotal / daysInMonth : 0;
  }, [currentMonthTotal, daysInMonth]);

  // --- Handlers ---
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (expenseData.id) {
      // Edit
      setData((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === expenseData.id
            ? { ...e, ...expenseData, id: expenseData.id! }
            : e
        ),
      }));
    } else {
      // Add
      const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
      }));
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== expenseId),
    }));
  };

  const handleAddCategory = (catData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const handleEditCategory = (updatedCat: Category) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === updatedCat.id ? updatedCat : c
      ),
    }));
  };

  const handleDeleteCategory = (
    categoryId: string,
    reassignTargetId?: string
  ) => {
    setData((prev) => {
      let updatedExpenses = prev.expenses;
      if (reassignTargetId) {
        // Reassign
        updatedExpenses = updatedExpenses.map((e) =>
          e.categoryId === categoryId ? { ...e, categoryId: reassignTargetId } : e
        );
      } else {
        // Remove associated expenses
        updatedExpenses = updatedExpenses.filter(
          (e) => e.categoryId !== categoryId
        );
      }

      return {
        ...prev,
        categories: prev.categories.filter((c) => c.id !== categoryId),
        expenses: updatedExpenses,
      };
    });
  };

  const handleSaveBudgetGoal = () => {
    const val = parseFloat(budgetInput.replace(',', '.'));
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        monthlyTotalBudget: !isNaN(val) && val > 0 ? val : undefined,
      },
    }));
    setIsEditingBudget(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Wydatkomierz</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  Lokalny
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Podsumowanie i archiwizacja wydatków w dynamicznych kategoriach
              </p>
            </div>
          </div>

          {/* Action buttons & PWA install */}
          <div className="flex items-center gap-2">
            {/* Install PWA Button */}
            <PWAInstallButton />

            {/* Local Data / Backup */}
            <button
              onClick={() => setIsLocalDataModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition"
              title="Kopie zapasowe i prywatność"
            >
              <HardDrive className="w-3.5 h-3.5 text-slate-600" />
              <span>Kopia / Dane</span>
            </button>

            {/* Manage Categories */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition"
              title="Zarządzaj dynamicznymi kategoriami"
            >
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Kategorie</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-[10px] font-bold text-slate-600 shadow-2xs">
                {data.categories.length}
              </span>
            </button>

            {/* Quick Add Expense Button */}
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs hover:shadow active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Dodaj wydatek</span>
              <span className="sm:hidden">Dodaj</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-6 text-xs font-semibold border-t border-slate-100">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'monthly'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Widok miesiąca ({formatMonthKey(selectedMonthKey)})</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'archive'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archiwum i historia wielomiesięczna</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* MONTHLY VIEW */}
        {activeTab === 'monthly' && (
          <>
            {/* Month Selector Bar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => setSelectedMonthKey(getPreviousMonthKey(selectedMonthKey))}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Poprzedni miesiąc"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center px-3">
                  <div className="text-lg font-extrabold text-slate-900">
                    {formatMonthKey(selectedMonthKey)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentMonthExpenses.length}{' '}
                    {currentMonthExpenses.length === 1 ? 'wydatek' : 'wydatków'} w tym miesiącu
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMonthKey(getNextMonthKey(selectedMonthKey))}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Następny miesiąc"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedMonthKey !== getMonthKey(new Date()) && (
                  <button
                    onClick={() => setSelectedMonthKey(getMonthKey(new Date()))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition"
                  >
                    Bieżący miesiąc
                  </button>
                )}

                <button
                  onClick={() =>
                    exportMonthCsv(data.expenses, data.categories, selectedMonthKey)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  title="Eksportuj wydatki tego miesiąca do pliku CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pobierz CSV</span>
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Spend */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Suma wydatków
                </span>
                <div className="my-2">
                  <span className="text-2xl font-black text-slate-900">
                    {formatCurrency(currentMonthTotal)}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {monthOverMonthChange !== null ? (
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        monthOverMonthChange > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {monthOverMonthChange > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {monthOverMonthChange > 0 ? '+' : ''}
                      {formatPercent(monthOverMonthChange)} vs {formatMonthKey(previousMonthKey).split(' ')[0]}
                    </span>
                  ) : (
                    <span>Brak danych z poprzedniego miesiąca</span>
                  )}
                </div>
              </div>

              {/* Daily Average */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Średnia dzienna
                </span>
                <div className="my-2">
                  <span className="text-2xl font-black text-slate-900">
                    {formatCurrency(dailyAverage)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ dzień</span>
                </div>
                <div className="text-xs text-slate-500">
                  Rozłożone na {daysInMonth} dni miesiąca
                </div>
              </div>

              {/* Monthly Budget Goal */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Budżet miesięczny
                  </span>
                  <button
                    onClick={() => {
                      setBudgetInput(
                        data.settings.monthlyTotalBudget
                          ? String(data.settings.monthlyTotalBudget)
                          : ''
                      );
                      setIsEditingBudget(!isEditingBudget);
                    }}
                    className="text-slate-400 hover:text-teal-600 transition"
                    title="Ustaw miesięczny budżet ogólny"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isEditingBudget ? (
                  <div className="my-1.5 flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="np. 5000"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 p-1.5 border border-teal-500 rounded-lg outline-hidden"
                    />
                    <button
                      onClick={handleSaveBudgetGoal}
                      className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="my-2">
                    {data.settings.monthlyTotalBudget ? (
                      <div>
                        <span className="text-2xl font-black text-slate-900">
                          {formatCurrency(data.settings.monthlyTotalBudget)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">
                        Nie ustawiono limitu
                      </span>
                    )}
                  </div>
                )}

                {data.settings.monthlyTotalBudget ? (
                  <div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          currentMonthTotal > data.settings.monthlyTotalBudget
                            ? 'bg-rose-500'
                            : 'bg-teal-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (currentMonthTotal / data.settings.monthlyTotalBudget) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        currentMonthTotal > data.settings.monthlyTotalBudget
                          ? 'text-rose-600'
                          : 'text-slate-600'
                      }`}
                    >
                      Wykorzystano{' '}
                      {Math.round(
                        (currentMonthTotal / data.settings.monthlyTotalBudget) * 100
                      )}
                      % limitu
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Kliknij ołówek, by zdefiniować cel
                  </div>
                )}
              </div>

              {/* Transactions count & Top Category */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Największy wydatek
                </span>
                <div className="my-2 truncate">
                  {categoryBreakdownData[0] ? (
                    <div>
                      <span className="text-base font-extrabold text-slate-900 truncate block">
                        {categoryBreakdownData[0].categoryName}
                      </span>
                      <span className="text-xs font-bold text-teal-700">
                        {formatCurrency(categoryBreakdownData[0].amount)} (
                        {formatPercent(categoryBreakdownData[0].percentage)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Brak wydatków</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {currentMonthExpenses.length} transakcji łącznie
                </div>
              </div>
            </div>

            {/* Category Doughnut & Distribution Chart */}
            <MonthlyChart
              categoriesData={categoryBreakdownData}
              totalSpent={currentMonthTotal}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            {/* Expense Table List */}
            <ExpenseList
              expenses={currentMonthExpenses}
              categories={data.categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              onAddNew={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              onEditExpense={(exp) => {
                setEditingExpense(exp);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
            />
          </>
        )}

        {/* ARCHIVE & HISTORY VIEW */}
        {activeTab === 'archive' && (
          <ArchiveView
            categories={data.categories}
            expenses={data.expenses}
            onSelectMonth={(monthKey) => {
              setSelectedMonthKey(monthKey);
              setActiveTab('monthly');
            }}
          />
        )}
      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        categories={data.categories}
        initialExpense={editingExpense}
        defaultMonthKey={selectedMonthKey}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={data.categories}
        expenses={data.expenses}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <LocalDataModal
        isOpen={isLocalDataModalOpen}
        onClose={() => setIsLocalDataModalOpen(false)}
        appData={data}
        onRestoreData={(newData) => setData(newData)}
      />

      {/* Offline Indicator Banner */}
      <OfflineIndicator />
    </div>
  );
}
