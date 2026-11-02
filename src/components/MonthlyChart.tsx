import React, { useState } from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface CategoryData {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  count: number;
  budget?: number;
}

interface MonthlyChartProps {
  categoriesData: CategoryData[];
  totalSpent: number;
  onSelectCategory?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({
  categoriesData,
  totalSpent,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (totalSpent === 0 || categoriesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          📊
        </div>
        <p className="text-base font-semibold text-slate-700">Brak wydatków w tym miesiącu</p>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">
          Dodaj swój pierwszy wydatek za pomocą przycisku „Dodaj wydatek”, aby zobaczyć wykres i podsumowanie kategorii.
        </p>
      </div>
    );
  }

  // Calculate SVG donut arcs
  const size = 240;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = categoriesData.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = categoriesData.find(
    (c) => c.categoryId === (hoveredId || selectedCategoryId)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Podział według kategorii</h3>
          <p className="text-xs text-slate-500">Kliknij kategorię, aby przefiltrować listę transakcji</p>
        </div>
        {selectedCategoryId && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="text-xs font-medium text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 transition"
          >
            Pokaż wszystkie
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Doughnut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[210px] h-[210px] flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox={`0 0 ${size} ${size}`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {slices.map((slice) => {
                const isSelected = selectedCategoryId === slice.categoryId;
                const isHovered = hoveredId === slice.categoryId;
                const isFaded =
                  (selectedCategoryId || hoveredId) && !isSelected && !isHovered;

                return (
                  <circle
                    key={slice.categoryId}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isSelected || isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: isFaded ? 0.35 : 1,
                      transformOrigin: 'center',
                    }}
                    onMouseEnter={() => setHoveredId(slice.categoryId)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(
                          selectedCategoryId === slice.categoryId ? null : slice.categoryId
                        );
                      }
                    }}
                  />
                );
              })}
            </svg>

            {/* Center Summary Information */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {activeCategory ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 shadow-xs"
                    style={{ backgroundColor: activeCategory.color }}
                  >
                    <CategoryIcon iconName={activeCategory.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 line-clamp-1 max-w-[120px]">
                    {activeCategory.categoryName}
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5">
                    {formatCurrency(activeCategory.amount)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {formatPercent(activeCategory.percentage)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Suma
                  </span>
                  <span className="text-base font-extrabold text-slate-900 mt-0.5">
                    {formatCurrency(totalSpent)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {categoriesData.length} {categoriesData.length === 1 ? 'kategoria' : 'kategorii'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category list breakdown */}
        <div className="md:col-span-7 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {categoriesData.map((cat) => {
            const isSelected = selectedCategoryId === cat.categoryId;
            const isHovered = hoveredId === cat.categoryId;
            const hasBudget = cat.budget && cat.budget > 0;
            const budgetPercent = hasBudget ? (cat.amount / cat.budget!) * 100 : 0;
            const isOverBudget = hasBudget && cat.amount > cat.budget!;

            return (
              <div
                key={cat.categoryId}
                onMouseEnter={() => setHoveredId(cat.categoryId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(isSelected ? null : cat.categoryId);
                  }
                }}
                className={`group p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/60 shadow-xs'
                    : isHovered
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {cat.categoryName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {cat.count} {cat.count === 1 ? 'wydatek' : cat.count < 5 ? 'wydatki' : 'wydatków'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900">
                      {formatCurrency(cat.amount)}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {formatPercent(cat.percentage)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>

                {/* Budget hint if configured */}
                {hasBudget && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      Limit: {formatCurrency(cat.budget!)}
                    </span>
                    <span
                      className={`font-semibold ${
                        isOverBudget ? 'text-rose-600' : 'text-slate-600'
                      }`}
                    >
                      {Math.round(budgetPercent)}% limitu {isOverBudget && '(Przekroczony!)'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
