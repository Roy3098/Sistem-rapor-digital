import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { ThemeModal } from './components/ThemeModal';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { GradesView } from './views/GradesView';
import { ReportCardView } from './views/ReportCardView';
import { ManageDataView } from './views/ManageDataView';
import { ExamsView } from './views/ExamsView';
import { ProfileView } from './views/ProfileView';
import { AttendanceView } from './views/AttendanceView';
import { TeachingScheduleView } from './views/TeachingScheduleView';
import { Megaphone, Settings2, Pause, Play, Gauge } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentUser,
    currentView,
    siteSettings,
    themeSettings,
    themeClasses,
    isDeviceDarkMode,
    announcements,
    openSuperAdminAnnouncements,
    updateSchoolConfig,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // If not logged in, show Auth
  if (!currentUser) {
    return <AuthView />;
  }

  const isSuperAdmin =
    currentUser.role === 'superadmin' || currentUser.username.toLowerCase() === 'superadmin';

  const activeAnnouncements = [...announcements.filter((a) => a.isActive)].sort((a, b) =>
    a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1
  );

  // Build running ticker items from all active announcements + fallback banner text
  const rawTickerItems =
    activeAnnouncements.length > 0
      ? activeAnnouncements.map((a) => ({
          id: a.id,
          badge: a.category,
          title: a.title,
          content: a.content,
          date: a.date,
          priority: a.priority,
          isPinned: a.isPinned,
        }))
      : siteSettings.announcement
      ? [
          {
            id: 'default-banner',
            badge: 'Info Akademik',
            title: siteSettings.schoolName,
            content: siteSettings.announcement,
            date: '',
            priority: 'normal' as const,
            isPinned: true,
          },
        ]
      : [];

  // Ensure enough items in one half-track so marquee is always wider than 100vw
  const singleHalfTrack =
    rawTickerItems.length === 1
      ? [rawTickerItems[0], rawTickerItems[0]]
      : rawTickerItems;

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'grades':
      case 'tahfidz':
      case 'form-uas':
        return <GradesView />;
      case 'reports':
        return <ReportCardView />;
      case 'exams':
        return <ExamsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'teaching':
        return <TeachingScheduleView />;
      case 'manage':
        return <ManageDataView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  const isSidebarLayout = themeSettings.layout === 'sidebar';
  const containerWidthClass =
    themeSettings.contentWidth === 'full'
      ? 'w-full px-4 sm:px-8'
      : themeSettings.contentWidth === 'wide'
      ? 'max-w-[1480px] w-full mx-auto px-4 sm:px-6 lg:px-8'
      : themeSettings.contentWidth === 'compact'
      ? 'max-w-5xl w-full mx-auto px-4 sm:px-6'
      : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8';

  const densityPaddingClass =
    themeSettings.density === 'compact'
      ? 'py-4 space-y-4'
      : themeSettings.density === 'spacious'
      ? 'py-8 space-y-8'
      : 'py-6 space-y-6';

  const isDarkSurface = isDeviceDarkMode;

  const speedOptions: Array<{
    id: NonNullable<typeof themeSettings.announcementSpeed>;
    shortLabel: string;
    fullLabel: string;
    multiplier: number;
  }> = [
    { id: 'very_slow', shortLabel: '0.5x', fullLabel: 'Sangat Lambat (0.5x)', multiplier: 1.85 },
    { id: 'slow', shortLabel: '0.75x', fullLabel: 'Lambat (0.75x)', multiplier: 1.35 },
    { id: 'normal', shortLabel: '1x', fullLabel: 'Normal (1x)', multiplier: 1.0 },
    { id: 'fast', shortLabel: '1.5x', fullLabel: 'Cepat (1.5x)', multiplier: 0.6 },
    { id: 'very_fast', shortLabel: '2x', fullLabel: 'Sangat Cepat (2x)', multiplier: 0.35 },
  ];

  const currentSpeedId = themeSettings.announcementSpeed || 'normal';
  const currentSpeedMeta =
    speedOptions.find((s) => s.id === currentSpeedId) || speedOptions[2];

  const handleCycleSpeed = () => {
    const idx = speedOptions.findIndex((s) => s.id === currentSpeedId);
    const nextOption = speedOptions[(idx + 1) % speedOptions.length];
    updateSchoolConfig(
      {
        themeSettings: {
          announcementSpeed: nextOption.id,
        },
      },
      { silent: true }
    );
  };

  const renderAnnouncementBar = () => {
    if (themeSettings.showAnnouncement === false || singleHalfTrack.length === 0) return null;
    const totalTickerChars = singleHalfTrack.reduce(
      (sum, item) =>
        sum +
        (item.badge?.length || 0) +
        (item.title?.length || 0) +
        (item.content?.length || 0) +
        24,
      0
    );
    const baseDurationSec = Math.max(
      76,
      singleHalfTrack.length * 32,
      Math.round(totalTickerChars * 0.34)
    );
    const marqueeDurationSec = Math.max(
      18,
      Math.round(baseDurationSec * currentSpeedMeta.multiplier)
    );

    return (
      <div
        className={`no-print ${
          isDarkSurface
            ? 'bg-slate-900/95 text-slate-200 border-b border-slate-800'
            : 'bg-white/95 text-slate-700 border-b border-slate-200/80'
        } backdrop-blur-md text-xs py-1.5 px-3 sm:px-4 overflow-hidden select-none`}
      >
        <div className={`${containerWidthClass} flex items-center justify-between gap-2.5 !px-0`}>
          {/* Left Fixed Icon Only */}
          <div
            className={`flex items-center shrink-0 z-10 pr-2.5 border-r ${
              isDarkSurface ? 'border-slate-700/80' : 'border-slate-200/80'
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${themeClasses.primary} text-white shadow-2xs`}
              title="Informasi & Pengumuman Resmi"
            >
              <Megaphone className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Center Continuous Running Text (Marquee) */}
          <div
            className="relative flex-1 min-w-0 overflow-hidden"
            style={
              {
                '--marquee-duration': `${marqueeDurationSec}s`,
                maskImage:
                  'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
              } as React.CSSProperties
            }
          >
            <div
              className="animate-announcement-marquee items-center"
              data-paused={isTickerPaused ? 'true' : 'false'}
            >
              {[0, 1].map((copyIdx) => (
                <div
                  key={copyIdx}
                  className="flex items-center shrink-0"
                  aria-hidden={copyIdx === 1}
                >
                  {singleHalfTrack.map((item, idx) => (
                    <div
                      key={`${copyIdx}-${item.id}-${idx}`}
                      className="inline-flex items-center gap-2 pr-10 whitespace-nowrap"
                    >
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          item.priority === 'urgent'
                            ? isDarkSurface
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-rose-100 text-rose-700 border border-rose-200'
                            : item.priority === 'important'
                            ? isDarkSurface
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                            : `${themeClasses.primaryLightBg} ${themeClasses.primaryText} border ${themeClasses.primaryBorder}`
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span
                        className={`font-bold ${
                          isDarkSurface ? 'text-slate-100' : 'text-slate-900'
                        }`}
                      >
                        {item.title}:
                      </span>
                      <span
                        className={`font-medium ${
                          isDarkSurface ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {item.content}
                      </span>
                      {item.date && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({item.date})
                        </span>
                      )}
                      <span
                        className={`ml-6 text-[10px] ${themeClasses.primaryText} opacity-60`}
                        aria-hidden="true"
                      >
                        ✦
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right Controls: Speed Cycler, Pause/Play & Superadmin Shortcut */}
          <div
            className={`flex items-center gap-1.5 shrink-0 z-10 pl-2 border-l ${
              isDarkSurface ? 'border-slate-700/80' : 'border-slate-200/80'
            }`}
          >
            <button
              type="button"
              onClick={handleCycleSpeed}
              className={`inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[10px] font-bold tabular-nums transition-colors cursor-pointer ${
                isDarkSurface
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
              title={`Kecepatan Running Pengumuman: ${currentSpeedMeta.fullLabel} (Klik untuk ubah)`}
            >
              <Gauge className="w-3 h-3 shrink-0" />
              <span>{currentSpeedMeta.shortLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTickerPaused((prev) => !prev)}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-md border transition-colors cursor-pointer ${
                isDarkSurface
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200/80 text-slate-600 hover:text-slate-900'
              }`}
              title={isTickerPaused ? 'Jalankan Teks Pengumuman' : 'Jeda Teks Pengumuman'}
            >
              {isTickerPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={openSuperAdminAnnouncements}
                className={`inline-flex items-center justify-center gap-1.5 h-6 w-6 sm:w-auto sm:px-2.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                  isDarkSurface
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200/80'
                }`}
                title="Kelola Pengumuman"
              >
                <Settings2 className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">Kelola</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkSurface ? 'text-slate-100' : 'text-slate-800'
      } antialiased font-sans transition-colors duration-200`}
      style={{ backgroundColor: 'var(--page-bg, #f8fafc)' }}
    >
      <ToastContainer />
      <ThemeModal />

      {/* Layout Option 1: Modern Sidebar Workspace */}
      {isSidebarLayout ? (
        <div className="flex-1 flex min-h-screen">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />

          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

            {renderAnnouncementBar()}

            <main className={`flex-1 ${containerWidthClass} ${densityPaddingClass}`}>
              <div key={currentView} className="view-transition-container">
                {renderActiveView()}
              </div>
              <BottomNav />
            </main>

            {/* Clean Footer */}
            {themeSettings.showFooter !== false && (
              <footer className="no-print bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 mt-auto">
                <div className={`${containerWidthClass} flex flex-col sm:flex-row items-center justify-between gap-2`}>
                  <p>
                    © {new Date().getFullYear()} {siteSettings.appName} ·{' '}
                    {siteSettings.foundationName ? `${siteSettings.foundationName} · ` : ''}
                    {siteSettings.schoolName}
                  </p>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>{siteSettings.footerText || 'Evaluasi Akademik, Rapor Digital & Tahfidz'}</span>
                  </div>
                </div>
              </footer>
            )}
          </div>
        </div>
      ) : (
        /* Layout Option 2: Topbar Classic Header */
        <div className="flex-1 flex flex-col">
          <Navbar />

          {renderAnnouncementBar()}

          <main className={`flex-1 ${containerWidthClass} ${densityPaddingClass}`}>
            <div key={currentView} className="view-transition-container">
              {renderActiveView()}
            </div>
            <BottomNav />
          </main>

          {themeSettings.showFooter !== false && (
            <footer className="no-print bg-white/80 backdrop-blur-md border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 mt-auto">
              <div className={`${containerWidthClass} flex flex-col sm:flex-row items-center justify-between gap-2`}>
                <p>
                  © {new Date().getFullYear()} {siteSettings.appName} ·{' '}
                  {siteSettings.foundationName ? `${siteSettings.foundationName} · ` : ''}
                  {siteSettings.schoolName}
                </p>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>{siteSettings.footerText || 'Evaluasi Akademik, Rapor Digital & Tahfidz'}</span>
                </div>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
