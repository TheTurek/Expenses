import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle, Smartphone, HelpCircle } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopHelp, setShowDesktopHelp] = useState(false);

  // If already running as an installed PWA, show a subtle badge indicating local app status
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
        <span>Aplikacja lokalna</span>
      </div>
    );
  }

  // Chromium / Android / Edge / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition ${
          compact ? 'px-2.5 py-1.5 text-xs' : ''
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Zainstaluj lokalnie</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-600" />
          <span>Zainstaluj na iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">
                Instalacja na iPhone / iPad
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                1. Kliknij przycisk <strong>Udostępnij</strong> (ikona kwadratu ze strzałką) w dolnym pasku Safari.<br />
                2. Przewiń listę w dół i wybierz <strong>Do ekranu początkowego</strong>.<br />
                3. Aplikacja zainstaluje się jako ikona i będzie działać lokalnie bez przeglądarki!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
              >
                Zamknij
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop manual instructions button if browser hasn't fired beforeinstallprompt yet
  return (
    <>
      <button
        onClick={() => setShowDesktopHelp(true)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition"
        title="Jak uruchomić lokalnie jako program na komputerze"
      >
        <Monitor className="w-3.5 h-3.5 text-teal-600" />
        <span>Uruchom lokalnie</span>
      </button>

      {showDesktopHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-teal-600" />
              Instalacja jako aplikacja lokalna (Desktop)
            </h3>
            <div className="mt-3 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Aplikacja jest w pełni przystosowana jako <strong>Progressive Web App (PWA)</strong> i może działać jako samodzielny program na Twoim komputerze (Windows, Mac, Linux):
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p>
                  <strong>Chrome / Edge / Opera:</strong> Spójrz na prawą stronę paska adresu URL w przeglądarce i kliknij ikonę <strong>Zainstaluj Wydatkomierz</strong> (komputer z monitorkiem lub strzałka).
                </p>
                <p>
                  Możesz też otworzyć menu przeglądarki (trzy kropki) → <em>Zapisz i udostępnij</em> → <em>Zainstaluj tę witrynę jako aplikację</em>.
                </p>
              </div>
              <p>
                Po instalacji program otworzy się we własnym oknie, bez paska adresu, z własną ikoną na Pulpicie i Menu Start, działając w 100% lokalnie i offline.
              </p>
            </div>
            <button
              onClick={() => setShowDesktopHelp(false)}
              className="mt-4 w-full rounded-xl bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700 shadow-xs transition"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}
    </>
  );
};
