import React, { useState, useMemo } from 'react';
import { Category, Expense } from '../types';
import { formatCurrency, formatMonthKey, formatPercent } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  ChevronRight,
  BarChart3,
  Archive,
} from 'lucide-react';
import { exportMonthCsv, exportAppDataJson } from '../utils/storage';

interface ArchiveViewProps {
  categories: Category[];
  expenses: Expense[];
  onSelectMonth: (monthKey: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  categories,
  expenses,
  onSelectMonth,
}) => {
  const [selectedCategoryTrend, setSelectedCategoryTrend] = useState<string>('all');

  // Discover all months present in expenses + guarantee current month is included
  const allMonths = useMemo(() => {
    const monthSet = new Set<string>();
    expenses.forEach((e) => {
      const m = e.date.substring(0, 7);
      if (m) monthSet.add(m);
    });
    // Sort descending (latest first)
    return Array.from(monthSet).sort().reverse();
  }, [expenses]);

  // Build matrix data: { [monthKey]: { total: number, categories: { [catId]: number } } }
  const matrixData = useMemo(() => {
    const res: Record<
      string,
      { total: number; count: number; categories: Record<string, number> }
    > = {};

    allMonths.forEach((m) => {
      res[m] = { total: 0, count: 0, categories: {} };
      categories.forEach((cat) => {
        res[m].categories[cat.id] = 0;
      });
    });

    expenses.forEach((e) => {
      const m = e.date.substring(0, 7);
      if (res[m]) {
        res[m].total += e.amount;
        res[m].count += 1;
        if (res[m].categories[e.categoryId] !== undefined) {
          res[m].categories[e.categoryId] += e.amount;
        } else {
          res[m].categories[e.categoryId] = e.amount;
        }
      }
    });

    return res;
  }, [allMonths, categories, expenses]);

  // Overall totals
  const allTimeTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const monthlyAverage =
    allMonths.length > 0 ? allTimeTotal / allMonths.length : 0;

  // Trend chart data (sorted chronological: oldest to newest)
  const trendMonths = useMemo(() => [...allMonths].reverse(), [allMonths]);
  const maxTrendValue = useMemo(() => {
    let max = 0;
    trendMonths.forEach((m) => {
      const data = matrixData[m];
      if (!data) return;
      const val =
        selectedCategoryTrend === 'all'
          ? data.total
          : data.categories[selectedCategoryTrend] || 0;
      if (val > max) max = val;
    });
    return max > 0 ? max : 1000;
  }, [trendMonths, matrixData, selectedCategoryTrend]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Zaarchiwizowane miesiące</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {allMonths.length} {allMonths.length === 1 ? 'miesiąc' : 'miesięcy'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Suma wszystkich wydatków</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(allTimeTotal)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Średnia miesięczna</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {formatCurrency(monthlyAverage)}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Multi-Month Trend Chart */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Wizualizacja trendu wydatków w czasie
            </h3>
            <p className="text-xs text-slate-500">
              Wybierz konkretną kategorię lub zobacz sumę ogólną we wszystkich miesiącach
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Kategoria:</label>
            <select
              value={selectedCategoryTrend}
              onChange={(e) => setSelectedCategoryTrend(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-teal-500"
            >
              <option value="all">Wszystkie wydatki (Suma)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Bar Columns */}
        <div className="pt-4 pb-2">
          <div className="grid grid-flow-col auto-cols-fr gap-3 items-end h-48 border-b border-slate-100 px-2">
            {trendMonths.map((m, idx) => {
              const data = matrixData[m];
              const val =
                selectedCategoryTrend === 'all'
                  ? data?.total || 0
                  : data?.categories[selectedCategoryTrend] || 0;
              const heightPercent = maxTrendValue > 0 ? (val / maxTrendValue) * 100 : 0;
              const catObj = categories.find((c) => c.id === selectedCategoryTrend);
              const barColor = catObj ? catObj.color : '#0d9488';

              // Previous month comparison
              const prevMonth = trendMonths[idx - 1];
              const prevVal = prevMonth
                ? selectedCategoryTrend === 'all'
                  ? matrixData[prevMonth]?.total || 0
                  : matrixData[prevMonth]?.categories[selectedCategoryTrend] || 0
                : null;

              const diff = prevVal !== null && prevVal > 0 ? ((val - prevVal) / prevVal) * 100 : null;

              return (
                <div key={m} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip / value above bar */}
                  <div className="text-[10px] font-bold text-slate-700 mb-1 opacity-80 group-hover:opacity-100 transition truncate max-w-full">
                    {val > 0 ? formatCurrency(val) : '0 zł'}
                  </div>

                  <div
                    onClick={() => onSelectMonth(m)}
                    className="w-full max-w-[54px] rounded-t-lg transition-all duration-300 cursor-pointer relative hover:brightness-110"
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                      backgroundColor: barColor,
                    }}
                  >
                    {diff !== null && Math.abs(diff) > 1 && (
                      <span
                        className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-1 py-0.5 rounded ${
                          diff > 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {diff > 0 ? `+${Math.round(diff)}%` : `${Math.round(diff)}%`}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-600 mt-2 truncate max-w-full">
                    {formatMonthKey(m).split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {m.split('-')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Matrix Table: Month by Month & Category by Category */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Zestawienie archiwalne: Kategoria / Miesiąc
            </h3>
            <p className="text-xs text-slate-500">
              Szczegółowa macierz ile wydano w danym miesiącu w obrębie każdej kategorii
            </p>
          </div>
          <button
            onClick={() =>
              exportAppDataJson({
                categories,
                expenses,
                settings: { currency: 'zł' },
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Eksportuj kopię JSON
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-3 px-3.5 font-bold text-slate-700 sticky left-0 bg-slate-50 z-10 w-56">
                  Kategoria
                </th>
                {allMonths.map((m) => (
                  <th
                    key={m}
                    className="py-3 px-3 font-semibold text-slate-700 text-right whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{formatMonthKey(m)}</span>
                      <button
                        title="Otwórz ten miesiąc"
                        onClick={() => onSelectMonth(m)}
                        className="text-teal-600 hover:text-teal-700 ml-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5 inline" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-3.5 font-bold text-slate-800 text-right bg-slate-100/70">
                  Średnia / m-c
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => {
                let catTotalAllMonths = 0;
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-2.5 px-3.5 font-medium text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50/60 z-10 flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon iconName={cat.icon} className="w-3 h-3" />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </td>

                    {allMonths.map((m) => {
                      const amount = matrixData[m]?.categories[cat.id] || 0;
                      const monthTotal = matrixData[m]?.total || 1;
                      const share = (amount / monthTotal) * 100;
                      catTotalAllMonths += amount;

                      return (
                        <td
                          key={m}
                          className="py-2.5 px-3 text-right font-medium text-slate-700 whitespace-nowrap"
                        >
                          {amount > 0 ? (
                            <div>
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(amount)}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {formatPercent(share)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-800 bg-slate-50/50 whitespace-nowrap">
                      {formatCurrency(
                        allMonths.length > 0 ? catTotalAllMonths / allMonths.length : 0
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* TOTAL ROW */}
              <tr className="bg-slate-100/90 font-extrabold border-t-2 border-slate-300">
                <td className="py-3 px-3.5 text-slate-900 sticky left-0 bg-slate-100 z-10">
                  SUMA MIESIĄCA
                </td>
                {allMonths.map((m, idx) => {
                  const mTotal = matrixData[m]?.total || 0;
                  const prevM = allMonths[idx + 1]; // next in reversed array is previous chronologically
                  const prevTotal = prevM ? matrixData[prevM]?.total || 0 : null;
                  const change =
                    prevTotal && prevTotal > 0
                      ? ((mTotal - prevTotal) / prevTotal) * 100
                      : null;

                  return (
                    <td key={m} className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="text-slate-900">{formatCurrency(mTotal)}</div>
                      {change !== null && (
                        <div
                          className={`flex items-center justify-end text-[10px] font-bold ${
                            change > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {change > 0 ? (
                            <TrendingUp className="w-3 h-3 inline mr-0.5" />
                          ) : (
                            <TrendingDown className="w-3 h-3 inline mr-0.5" />
                          )}
                          {change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="py-3 px-3.5 text-right text-teal-800 bg-slate-200/80 whitespace-nowrap">
                  {formatCurrency(monthlyAverage)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Archive Cards with One-click CSV Export */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Miesięczne paczki archiwalne (Eksport i raporty)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allMonths.map((m) => {
            const mData = matrixData[m];
            return (
              <div
                key={m}
                className="p-3.5 rounded-xl border border-slate-200/90 hover:border-teal-400 bg-white hover:bg-teal-50/20 transition flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {formatMonthKey(m)}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {mData?.count || 0} transakcji
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-teal-700 mt-1">
                    {formatCurrency(mData?.total || 0)}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectMonth(m)}
                    className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition text-center"
                  >
                    Zobacz szczegóły
                  </button>
                  <button
                    title="Pobierz CSV z wydatkami tego miesiąca"
                    onClick={() => exportMonthCsv(expenses, categories, m)}
                    className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
