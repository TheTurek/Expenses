import { AppData, Category, Expense } from '../types';

const STORAGE_KEY = 'wydatkomierz_local_data_v2';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-groceries',
    name: 'Jedzenie i zakupy spożywcze',
    color: '#0d9488', // Teal
    icon: 'ShoppingCart',
    budget: 1800,
    createdAt: '2026-08-01',
  },
  {
    id: 'cat-housing',
    name: 'Mieszkanie i opłaty',
    color: '#3b82f6', // Blue
    icon: 'Home',
    budget: 2500,
    createdAt: '2026-08-01',
  },
  {
    id: 'cat-transport',
    name: 'Transport i paliwo',
    color: '#f59e0b', // Amber
    icon: 'Car',
    budget: 650,
    createdAt: '2026-08-01',
  },
  {
    id: 'cat-health',
    name: 'Zdrowie i leki',
    color: '#ef4444', // Red
    icon: 'HeartPulse',
    budget: 350,
    createdAt: '2026-08-01',
  },
  {
    id: 'cat-entertainment',
    name: 'Rozrywka i kultura',
    color: '#8b5cf6', // Violet
    icon: 'Film',
    budget: 500,
    createdAt: '2026-08-01',
  },
  {
    id: 'cat-services',
    name: 'Subskrypcje i usługi',
    color: '#ec4899', // Pink
    icon: 'Wifi',
    budget: 250,
    createdAt: '2026-08-01',
  },
  {
    id: 'cat-other',
    name: 'Inne wydatki',
    color: '#64748b', // Slate
    icon: 'Tag',
    budget: 400,
    createdAt: '2026-08-01',
  },
];

// Seed realistic demo data across November 2026, October 2026, and September 2026
export const INITIAL_EXPENSES: Expense[] = [
  // Listopad 2026
  {
    id: 'exp-nov-1',
    title: 'Czynsz za mieszkanie i fundusz remontowy',
    amount: 2200,
    categoryId: 'cat-housing',
    date: '2026-11-01',
    paymentMethod: 'transfer',
    notes: 'Opłata za listopad',
    createdAt: '2026-11-01T09:00:00Z',
  },
  {
    id: 'exp-nov-2',
    title: 'Duże zakupy tygodniowe Biedronka',
    amount: 342.60,
    categoryId: 'cat-groceries',
    date: '2026-11-01',
    paymentMethod: 'card',
    notes: 'Artykuły spożywcze, chemia domowa',
    createdAt: '2026-11-01T15:30:00Z',
  },
  {
    id: 'exp-nov-3',
    title: 'Paliwo PB95 Orlen',
    amount: 285.40,
    categoryId: 'cat-transport',
    date: '2026-11-02',
    paymentMethod: 'card',
    notes: 'Zatankowano do pełna',
    createdAt: '2026-11-02T08:15:00Z',
  },
  {
    id: 'exp-nov-4',
    title: 'Subskrypcja Spotify i Netflix',
    amount: 79.99,
    categoryId: 'cat-services',
    date: '2026-11-02',
    paymentMethod: 'card',
    createdAt: '2026-11-02T10:00:00Z',
  },

  // Październik 2026
  {
    id: 'exp-oct-1',
    title: 'Czynsz mieszkaniowy',
    amount: 2200,
    categoryId: 'cat-housing',
    date: '2026-10-01',
    paymentMethod: 'transfer',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'exp-oct-2',
    title: 'Rachunek za prąd i gaz',
    amount: 345.50,
    categoryId: 'cat-housing',
    date: '2026-10-10',
    paymentMethod: 'transfer',
    createdAt: '2026-10-10T11:00:00Z',
  },
  {
    id: 'exp-oct-3',
    title: 'Zakupy spożywcze Lidl',
    amount: 412.30,
    categoryId: 'cat-groceries',
    date: '2026-10-05',
    paymentMethod: 'card',
    createdAt: '2026-10-05T16:00:00Z',
  },
  {
    id: 'exp-oct-4',
    title: 'Zakupy spożywcze i targ warzywny',
    amount: 388.90,
    categoryId: 'cat-groceries',
    date: '2026-10-14',
    paymentMethod: 'blik',
    createdAt: '2026-10-14T12:00:00Z',
  },
  {
    id: 'exp-oct-5',
    title: 'Zakupy spożywcze Auchan',
    amount: 495.20,
    categoryId: 'cat-groceries',
    date: '2026-10-24',
    paymentMethod: 'card',
    createdAt: '2026-10-24T18:00:00Z',
  },
  {
    id: 'exp-oct-6',
    title: 'Paliwo i płyn do spryskiwaczy',
    amount: 310.00,
    categoryId: 'cat-transport',
    date: '2026-10-08',
    paymentMethod: 'card',
    createdAt: '2026-10-08T08:00:00Z',
  },
  {
    id: 'exp-oct-7',
    title: 'Bilety komunikacji miejskiej ZTM',
    amount: 110.00,
    categoryId: 'cat-transport',
    date: '2026-10-02',
    paymentMethod: 'blik',
    createdAt: '2026-10-02T07:30:00Z',
  },
  {
    id: 'exp-oct-8',
    title: 'Wizyta u dentysty (kontrola i piaskowanie)',
    amount: 280.00,
    categoryId: 'cat-health',
    date: '2026-10-15',
    paymentMethod: 'card',
    createdAt: '2026-10-15T14:00:00Z',
  },
  {
    id: 'exp-oct-9',
    title: 'Wyjście do kina i kawiarni',
    amount: 145.00,
    categoryId: 'cat-entertainment',
    date: '2026-10-18',
    paymentMethod: 'card',
    createdAt: '2026-10-18T20:00:00Z',
  },
  {
    id: 'exp-oct-10',
    title: 'Internet światłowodowy i telefon',
    amount: 135.00,
    categoryId: 'cat-services',
    date: '2026-10-12',
    paymentMethod: 'transfer',
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'exp-oct-11',
    title: 'Prezent urodzinowy dla znajomego',
    amount: 160.00,
    categoryId: 'cat-other',
    date: '2026-10-27',
    paymentMethod: 'card',
    createdAt: '2026-10-27T17:00:00Z',
  },

  // Wrzesień 2026
  {
    id: 'exp-sep-1',
    title: 'Czynsz mieszkaniowy',
    amount: 2200,
    categoryId: 'cat-housing',
    date: '2026-09-01',
    paymentMethod: 'transfer',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'exp-sep-2',
    title: 'Zakupy spożywcze wrzesień cz. 1',
    amount: 620.40,
    categoryId: 'cat-groceries',
    date: '2026-09-07',
    paymentMethod: 'card',
    createdAt: '2026-09-07T16:00:00Z',
  },
  {
    id: 'exp-sep-3',
    title: 'Zakupy spożywcze wrzesień cz. 2',
    amount: 580.10,
    categoryId: 'cat-groceries',
    date: '2026-09-20',
    paymentMethod: 'card',
    createdAt: '2026-09-20T17:00:00Z',
  },
  {
    id: 'exp-sep-4',
    title: 'Paliwo i myjnia',
    amount: 340.00,
    categoryId: 'cat-transport',
    date: '2026-09-12',
    paymentMethod: 'card',
    createdAt: '2026-09-12T08:00:00Z',
  },
  {
    id: 'exp-sep-5',
    title: 'Koncert muzyczny i bilety',
    amount: 320.00,
    categoryId: 'cat-entertainment',
    date: '2026-09-19',
    paymentMethod: 'blik',
    createdAt: '2026-09-19T19:00:00Z',
  },
  {
    id: 'exp-sep-6',
    title: 'Apteka - witaminy na jesień',
    amount: 115.00,
    categoryId: 'cat-health',
    date: '2026-09-25',
    paymentMethod: 'card',
    createdAt: '2026-09-25T11:00:00Z',
  },
  {
    id: 'exp-sep-7',
    title: 'Internet i subskrypcje',
    amount: 215.00,
    categoryId: 'cat-services',
    date: '2026-09-15',
    paymentMethod: 'transfer',
    createdAt: '2026-09-15T10:00:00Z',
  },

  // Sierpień 2026
  {
    id: 'exp-aug-1',
    title: 'Czynsz mieszkaniowy',
    amount: 2200,
    categoryId: 'cat-housing',
    date: '2026-08-01',
    paymentMethod: 'transfer',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'exp-aug-2',
    title: 'Wydatki spożywcze',
    amount: 1410.50,
    categoryId: 'cat-groceries',
    date: '2026-08-15',
    paymentMethod: 'card',
    createdAt: '2026-08-15T15:00:00Z',
  },
  {
    id: 'exp-aug-3',
    title: 'Wyjazd urlopowy i paliwo',
    amount: 720.00,
    categoryId: 'cat-transport',
    date: '2026-08-18',
    paymentMethod: 'card',
    createdAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'exp-aug-4',
    title: 'Restauracje i wyjścia letnie',
    amount: 450.00,
    categoryId: 'cat-entertainment',
    date: '2026-08-22',
    paymentMethod: 'blik',
    createdAt: '2026-08-22T21:00:00Z',
  },
];

export function getInitialData(): AppData {
  return {
    categories: DEFAULT_CATEGORIES,
    expenses: INITIAL_EXPENSES,
    settings: {
      currency: 'zł',
      monthlyTotalBudget: 6000,
    },
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.expenses)) {
      return getInitialData();
    }
    return parsed;
  } catch (err) {
    console.error('Błąd odczytu danych z localStorage:', err);
    return getInitialData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Błąd zapisu danych do localStorage:', err);
  }
}

export function exportAppDataJson(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateTag = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `wydatkomierz_kopia_zapasowa_${dateTag}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMonthCsv(expenses: Expense[], categories: Category[], monthKey: string): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const filtered = expenses
    .filter((e) => e.date.startsWith(monthKey))
    .sort((a, b) => a.date.localeCompare(b.date));

  const headers = ['Data', 'Tytuł wydatku', 'Kategoria', 'Kwota (PLN)', 'Metoda płatności', 'Notatki'];
  const rows = filtered.map((e) => {
    const catName = categoryMap.get(e.categoryId) || 'Nieprzypisana';
    const amountStr = e.amount.toFixed(2).replace('.', ',');
    const methodStr = e.paymentMethod || 'karta';
    const notesStr = (e.notes || '').replace(/"/g, '""');
    const titleStr = (e.title || '').replace(/"/g, '""');
    return `"${e.date}","${titleStr}","${catName}","${amountStr}","${methodStr}","${notesStr}"`;
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wydatki_${monthKey}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
