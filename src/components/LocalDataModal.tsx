import React, { useRef, useState } from 'react';
import { AppData, Category, Expense } from '../types';
import { exportAppDataJson, getInitialData } from '../utils/storage';
import {
  X,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  FileJson,
} from 'lucide-react';

interface LocalDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onRestoreData: (newData: AppData) => void;
}

export const LocalDataModal: React.FC<LocalDataModalProps> = ({
  isOpen,
  onClose,
  appData,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  if (!isOpen) return null;

  const handleExport = () => {
    exportAppDataJson(appData);
    setStatusMsg({
      text: 'Plik kopii zapasowej JSON został pobrany na Twój dysk.',
      type: 'success',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as AppData;
        if (!parsed.categories || !Array.isArray(parsed.categories) || !Array.isArray(parsed.expenses)) {
          throw new Error('Niepoprawny format pliku kopii.');
        }

        onRestoreData(parsed);
        setStatusMsg({
          text: `Pomyślnie zaimportowano ${parsed.expenses.length} wydatków i ${parsed.categories.length} kategorii.`,
          type: 'success',
        });
      } catch (err) {
        setStatusMsg({
          text: 'Błąd podczas wczytywania pliku. Upewnij się, że to poprawny plik JSON kopii.',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        'Czy na pewno chcesz przywrócić dane przykładowe? Bieżące zmiany zostaną zastąpione domyślnym zestawem.'
      )
    ) {
      const initial = getInitialData();
      onRestoreData(initial);
      setStatusMsg({
        text: 'Przywrócono przykładowy zestaw danych z historią wydatków.',
        type: 'success',
      });
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Czy na pewno chcesz wyczyścić wszystkie wydatki i zacząć od czystego konta?'
      )
    ) {
      const cleanData: AppData = {
        categories: appData.categories,
        expenses: [],
        settings: appData.settings,
      };
      onRestoreData(cleanData);
      setStatusMsg({
        text: 'Wszystkie transakcje zostały wyczyszczone. Kategorie zostały zachowane.',
        type: 'success',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Prywatność i lokalne dane
              </h2>
              <p className="text-xs text-slate-500">
                Kopie zapasowe i zarządzanie magazynem na Twoim urządzeniu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {statusMsg && (
            <div
              className={`p-3 text-xs font-semibold rounded-xl flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950 leading-relaxed">
              <p className="font-bold">100% lokalne i prywatne dane</p>
              <p className="mt-1">
                Wszystkie Twoje wydatki i stworzone kategorie są przechowywane wyłącznie na tym
                urządzeniu (w lokalnej pamięci Twojej przeglądarki/aplikacji). Żadne informacje o
                Twoich finansach nie opuszczają Twojego komputera.
              </p>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kopia zapasowa na dysk (Archiwizacja)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/20 transition flex items-center gap-3 text-left shadow-2xs group"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Eksportuj do JSON</p>
                  <p className="text-[11px] text-slate-500">Pobierz plik ze wszystkimi danymi</p>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/20 transition flex items-center gap-3 text-left shadow-2xs group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Przywróć z JSON</p>
                  <p className="text-[11px] text-slate-500">Wczytaj wcześniej zapisany plik</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Management / Reset */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Zarządzanie stanem bazy
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleResetDemo}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Przywróć dane przykładowe
              </button>
              <button
                onClick={handleClearAll}
                className="py-2 px-3 rounded-xl border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition"
              >
                Wyczyść wszystkie transakcje
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 shadow-2xs transition"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
