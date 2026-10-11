import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, CheckCircle2, X, Monitor, WifiOff } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'sidebar' | 'auth' | 'menu';
  isDarkBg?: boolean;
  onAfterClick?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'navbar',
  isDarkBg = false,
  onAfterClick,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed standalone PWA, hide the install button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        onAfterClick?.();
      }
      return;
    }
    setShowGuideModal(true);
  };

  const renderTrigger = () => {
    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
          title="Pasang Aplikasi ke Layar Utama (PWA)"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold">
              {isIOS ? 'Pasang di iPhone/iPad' : 'Install Aplikasi (PWA)'}
            </span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/20">
            PWA
          </span>
        </button>
      );
    }

    if (variant === 'menu') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
            isDarkBg
              ? 'text-emerald-300 hover:bg-slate-800'
              : 'text-emerald-700 hover:bg-emerald-50/70'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-current" />
            <span>{isIOS ? 'Pasang Aplikasi di iOS' : 'Install Aplikasi (PWA)'}</span>
          </span>
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            App
          </span>
        </button>
      );
    }

    if (variant === 'auth') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className="w-full py-2.5 px-3.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isIOS
              ? 'Pasang Aplikasi di Layar Utama (iOS)'
              : 'Install Aplikasi Rapor Digital (PWA)'}
          </span>
        </button>
      );
    }

    // Default: 'navbar'
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`h-9 w-9 sm:w-auto sm:px-3 rounded-lg text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
          isDarkBg
            ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-2xs'
        }`}
        title="Install Aplikasi Rapor Digital (PWA) ke Perangkat Anda"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">Install App</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {showGuideModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={() => setShowGuideModal(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src="/pwa-192x192.png"
                    alt="Rapor BR Icon"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 bg-white p-1 object-contain"
                  />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                      Install Sistem Rapor Digital
                    </h3>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      Progressive Web App (PWA) · Siap Offline & Layar Penuh
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                {isInstallable && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
                      Perangkat Anda mendukung instalasi langsung satu klik:
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await install();
                        if (ok) {
                          setShowGuideModal(false);
                          onAfterClick?.();
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pasang Aplikasi Sekarang</span>
                    </button>
                  </div>
                )}

                {isIOS ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Cara Pasang di iPhone / iPad (Safari):</span>
                    </div>
                    <ol className="space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span>
                          Ketuk ikon <strong>Bagikan (Share)</strong>{' '}
                          <Share className="w-3.5 h-3.5 inline text-slate-700 dark:text-slate-200 mx-0.5" />{' '}
                          di bilah bawah atau atas browser Safari.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span>
                          Gulir ke bawah lalu pilih{' '}
                          <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>{' '}
                          <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 dark:text-slate-200 mx-0.5" />.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span>
                          Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas untuk menyelesaikan.
                        </span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Android (Chrome / Edge / Browser):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Ketuk menu <strong>⋮ (Tiga Titik)</strong> di pojok kanan atas browser, lalu pilih{' '}
                        <strong>&ldquo;Instal aplikasi&rdquo;</strong> atau{' '}
                        <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                        <Monitor className="w-4 h-4 text-emerald-600" />
                        <span>Laptop / PC (Chrome / Edge):</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Klik ikon <strong>Install (⊕ / Monitor Unduh)</strong> di sisi kanan kolom alamat URL browser
                        (pastikan aplikasi dibuka di tab browser penuh, bukan di dalam jendela pratinjau).
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Berjalan tanpa bilah alamat browser & mendukung penyimpanan cache offline.</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  Mengerti & Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="no-print fixed bottom-16 lg:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-amber-400/40 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
      <span>Mode Offline — Menggunakan data yang tersimpan di perangkat.</span>
    </div>
  );
};
