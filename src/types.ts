export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
  createdAt: string;
}

export type PaymentMethod = 'card' | 'cash' | 'blik' | 'transfer' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  label: string; // np. "Listopad 2026"
  year: number;
  month: number; // 1-12
  totalSpent: number;
  categoryTotals: Record<string, {
    categoryId: string;
    categoryName: string;
    color: string;
    icon: string;
    amount: number;
    count: number;
    percentage: number;
    budget?: number;
  }>;
  expensesCount: number;
}

export interface AppSettings {
  currency: string;
  monthlyTotalBudget?: number;
}

export interface AppData {
  categories: Category[];
  expenses: Expense[];
  settings: AppSettings;
}
