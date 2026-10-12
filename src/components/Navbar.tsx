import React, { useState, useEffect, useRef } from 'react';
import { useApp, AppView } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { PWAInstallButton } from './PWAInstallButton';
import { getHeaderStyles, isDarkSurfaceMode } from '../utils/theme';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Database,
  FileQuestion,
  User as UserIcon,
  LogOut,
  RotateCcw,
  Settings,
  Menu,
  Moon,
  Sun,
  UserCheck,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    isSuperAdmin,
    currentView,
    setCurrentView,
    setManageTab,
    logout,
    academicYear,
    setAcademicYear,
    resetToSampleData,
    siteSettings,
    themeSettings,
    updateThemeSettings,
    themeClasses,
    isDeviceDarkMode,
    toggleDeviceDarkMode,
    isCloudSynced,
    isSyncing,
    lastSyncedAt,
    forceSyncAllToCloud,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const isDarkSurface = isDeviceDarkMode;
  const isHeaderDarkBg =
    isDarkSurface ||
    themeSettings.headerStyle === 'dark' ||
    themeSettings.headerStyle === 'brand' ||
    themeSettings.headerStyle === 'colored' ||
    themeSettings.headerStyle === 'gradient';

  const handleToggleDarkMode = () => {
    toggleDeviceDarkMode();
  };

  // Close profile dropdown modal automatically when clicking outside or pressing Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Bank Soal is placed to the left of Kelola Data, and Kelola Data is at the far right
  const navItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'grades', label: 'Penilaian', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'reports', label: 'Rapor', icon: <FileCheck2 className="w-3.5 h-3.5" /> },
    ...(siteSettings.enableBankSoal !== false
      ? [{ id: 'exams' as AppView, label: 'Bank Soal', icon: <FileQuestion className="w-3.5 h-3.5" /> }]
      : []),
    { id: 'attendance', label: 'Absensi', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'teaching', label: 'Jadwal', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'manage', label: 'Kelola Data', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  const headerStyle = getHeaderStyles(themeSettings, themeClasses, isDeviceDarkMode);
  const stickyClass = themeSettings.stickyHeader !== false ? 'sticky top-0 z-30' : 'relative z-30';

  return (
    <header className={`${stickyClass} transition-colors ${headerStyle.wrapper}`}>
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Sidebar Toggle & Brand Wordmark */}
          <div className="flex items-center gap-3">
            {themeSettings.layout === 'sidebar' && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-black/10 dark:border-white/15 opacity-90 hover:opacity-100 hover:bg-black/10 transition-colors cursor-pointer shrink-0"
                title="Buka Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <BrandLogoIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
              <div className="leading-tight">
                <span className={`text-sm sm:text-base font-bold tracking-tight block ${headerStyle.brandText}`}>
                  {siteSettings.appName}
                </span>
                <span className={`text-[11px] sm:text-xs font-semibold ${headerStyle.subText} hidden sm:inline-block`}>
                  {siteSettings.schoolName}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Only shown when Layout === 'topbar' on Desktop) */}
          {themeSettings.layout === 'topbar' && (
            <nav className="hidden lg:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10">
              {navItems.map((item) => {
                const isActive =
                  currentView === item.id ||
                  (item.id === 'grades' &&
                    (currentView === 'tahfidz' || currentView === 'form-uas'));
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive ? headerStyle.navActive : headerStyle.navInactive
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zone 3: Actions & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="navbar" isDarkBg={isHeaderDarkBg} />

            {/* Quick Mode Malam / Mode Terang Toggle */}
            <button
              type="button"
              onClick={handleToggleDarkMode}
              className={`h-9 w-9 md:w-auto md:px-3 rounded-lg text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 border transition-colors cursor-pointer shrink-0 ${
                isHeaderDarkBg
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80'
              }`}
              title={
                isDarkSurface
                  ? 'Beralih ke Mode Terang (Khusus Perangkat Ini)'
                  : 'Aktifkan Mode Malam (Khusus Perangkat Ini)'
              }
            >
              {isDarkSurface ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden md:inline">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-current opacity-85 shrink-0" />
                  <span className="hidden md:inline">Mode Malam</span>
                </>
              )}
            </button>

            {/* Database Connection Status & Instant Sync Trigger */}
            <button
              type="button"
              onClick={() => forceSyncAllToCloud()}
              disabled={isSyncing}
              className={`h-9 w-9 sm:w-auto sm:px-3 rounded-lg text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 select-none border transition-all cursor-pointer disabled:opacity-70 shrink-0 ${
                isHeaderDarkBg
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/25'
                  : 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-800 border-emerald-200/80'
              }`}
              title={
                isCloudSynced
                  ? `Cloud Firestore Realtime Aktif${lastSyncedAt ? ` · Tersinkron (${lastSyncedAt})` : ''} — Klik untuk sinkronisasi penuh`
                  : `Terhubung DB Lokal & Cloud${lastSyncedAt ? ` · (${lastSyncedAt})` : ''} — Klik untuk hubungkan / sinkronkan ke Cloud Firestore`
              }
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 hidden sm:inline-block ${
                  isSyncing
                    ? 'bg-amber-400 animate-ping'
                    : isHeaderDarkBg
                      ? 'bg-emerald-400'
                      : 'bg-emerald-500'
                }`}
              />
              <Database className="w-3.5 h-3.5 text-current opacity-85 shrink-0" />
              <span className="whitespace-nowrap hidden sm:inline">
                {isSyncing
                  ? 'Sinkron DB...'
                  : isCloudSynced
                    ? 'Realtime DB Aktif'
                    : 'Sinkron DB'}
              </span>
            </button>

            {/* Academic Year Selector (Top Bar layout only) */}
            {themeSettings.layout === 'topbar' && (
              <div className="hidden sm:flex items-center h-9 text-xs opacity-90 bg-black/5 dark:bg-white/10 px-2.5 rounded-lg border border-black/10 dark:border-white/10">
                <span className="opacity-60 mr-1.5 font-medium">T.A:</span>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer"
                >
                  <option value="2025/2026" className="text-slate-900 bg-white">2025/2026</option>
                  <option value="2024/2025" className="text-slate-900 bg-white">2024/2025</option>
                  <option value="2026/2027" className="text-slate-900 bg-white">2026/2027</option>
                </select>
              </div>
            )}

            {/* Profile Dropdown Modal */}
            {currentUser && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className={`h-9 w-9 sm:w-auto flex items-center justify-center gap-2 sm:pl-1.5 sm:pr-2.5 rounded-lg border transition-all focus:outline-none cursor-pointer relative z-50 shrink-0 ${
                    isHeaderDarkBg
                      ? 'hover:bg-white/10 border-white/15'
                      : 'hover:bg-black/5 border-black/10'
                  }`}
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/40"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden sm:block text-left">
                    <span className={`text-xs font-semibold block truncate max-w-[110px] leading-tight ${headerStyle.brandText}`}>
                      {currentUser.fullName}
                    </span>
                    <span className={`text-[10px] block leading-tight opacity-70 ${headerStyle.brandText}`}>
                      @{currentUser.username}
                    </span>
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    {/* Transparent full-screen backdrop so clicking anywhere else closes the profile modal immediately */}
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div
                      className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                        isDarkSurface
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : 'bg-white text-slate-800 border-slate-200'
                      }`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div
                        className={`px-4 py-2.5 border-b ${
                          isDarkSurface ? 'border-slate-800' : 'border-slate-100'
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold ${
                            isDarkSurface ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {currentUser.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">@{currentUser.username}</p>
                        <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider font-bold ${themeClasses.badgeBg} ${themeClasses.badgeText} px-2 py-0.5 rounded-md`}>
                          {isSuperAdmin ? 'Super Administrator' : currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'wali_kelas' ? 'Wali Kelas' : 'Tenaga Pendidik'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('profile');
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                          isDarkSurface
                            ? 'text-slate-200 hover:bg-slate-800'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profil & Pengaturan Akun</span>
                      </button>

                      <div onClick={(e) => e.stopPropagation()}>
                        <PWAInstallButton
                          variant="menu"
                          isDarkBg={isDarkSurface}
                          onAfterClick={() => setDropdownOpen(false)}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDarkMode();
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                          isDarkSurface
                            ? 'text-slate-200 hover:bg-slate-800'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {isDarkSurface ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-slate-400" />
                          )}
                          <span>Mode Malam (Dark Mode)</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isDarkSurface
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isDarkSurface ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentView('manage');
                              setManageTab('superadmin');
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold ${themeClasses.primaryText} ${
                              isDarkSurface ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                            } text-left transition-colors cursor-pointer`}
                          >
                            <Settings className="w-4 h-4 text-current" />
                            <span>Pengaturan Super Admin (Kelola)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              resetToSampleData();
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                              isDarkSurface
                                ? 'text-slate-200 hover:bg-slate-800'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <RotateCcw className="w-4 h-4 text-slate-400" />
                            <span>Reset Data Sampel Awal</span>
                          </button>
                        </>
                      )}

                      <div
                        className={`border-t mt-1 pt-1 ${
                          isDarkSurface ? 'border-slate-800' : 'border-slate-100'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                            isDarkSurface
                              ? 'text-rose-400 hover:bg-rose-500/15'
                              : 'text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <LogOut className="w-4 h-4 text-current" />
                          <span>Keluar (Logout)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
