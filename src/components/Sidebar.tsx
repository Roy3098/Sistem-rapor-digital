import React from 'react';
import { useApp, AppView } from '../context/AppContext';
import { BrandLogoIcon } from './BrandLogoIcon';
import { PWAInstallButton } from './PWAInstallButton';
import { getSidebarStyles } from '../utils/theme';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Database,
  FileQuestion,
  User as UserIcon,
  Palette,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Moon,
  Sun,
  UserCheck,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    currentUser,
    isSuperAdmin,
    currentView,
    setCurrentView,
    siteSettings,
    academicYear,
    setAcademicYear,
    themeSettings,
    themeClasses,
    isDeviceDarkMode,
    toggleDeviceDarkMode,
    setIsThemeModalOpen,
    logout,
  } = useApp();

  const navItems: { id: AppView; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sub: 'Ringkasan & Statistik',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'grades',
      label: 'Penilaian',
      sub: 'Nilai Akademik & Tahfidz',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Rapor',
      sub: 'Cetak & Penerbitan Rapor',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    ...(siteSettings.enableBankSoal !== false
      ? [
          {
            id: 'exams' as AppView,
            label: 'Bank Soal',
            sub: 'Paket Soal & Naskah UAS',
            icon: <FileQuestion className="w-4 h-4" />,
          },
        ]
      : []),
    {
      id: 'attendance',
      label: 'Absensi',
      sub: 'Santri & Dewan Guru',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'teaching',
      label: 'Jadwal',
      sub: 'Mapel, Pengampu & Jadwal',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'manage',
      label: 'Kelola',
      sub: isSuperAdmin ? 'Data & Super Admin' : 'Mapel, Kelas & Siswa',
      icon: <Database className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileOpen(false);
  };

  const sidebarStyle = getSidebarStyles(themeSettings, themeClasses, isDeviceDarkMode);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 ${sidebarStyle.aside} flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b ${sidebarStyle.headerBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <BrandLogoIcon className="w-9 h-9" />
            <div className="leading-tight">
              <span className={`font-bold text-sm tracking-tight block ${sidebarStyle.brandText}`}>
                {siteSettings.appName}
              </span>
              <span className={`text-[11px] font-medium truncate block max-w-[140px] ${sidebarStyle.subText}`}>
                {siteSettings.schoolName}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Year Quick Bar */}
        <div className={`px-4 py-2.5 border-b ${sidebarStyle.headerBorder} flex items-center justify-between text-xs opacity-90 bg-black/5 dark:bg-white/5`}>
          <div className="flex items-center gap-1.5 opacity-70">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Tahun Ajaran:</span>
          </div>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="2025/2026" className="text-slate-900 bg-white">2025/2026</option>
            <option value="2024/2025" className="text-slate-900 bg-white">2024/2025</option>
            <option value="2026/2027" className="text-slate-900 bg-white">2026/2027</option>
          </select>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className={`px-2 pb-1 text-[10px] font-bold uppercase tracking-wider ${sidebarStyle.sectionTitle}`}>
            Menu Utama
          </div>

          {navItems.map((item) => {
            const isActive =
              currentView === item.id ||
              (item.id === 'grades' &&
                (currentView === 'tahfidz' || currentView === 'form-uas'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive ? sidebarStyle.itemActive : sidebarStyle.itemInactive
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={isActive ? 'text-current' : 'opacity-70'}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs block font-semibold leading-tight">{item.label}</span>
                    <span className="text-[10px] opacity-70 block leading-tight">{item.sub}</span>
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>
            );
          })}
        </div>

        {/* PWA Install & Device Dark Mode Toggle */}
        <div className={`px-3 py-2 border-t ${sidebarStyle.headerBorder} space-y-1.5`}>
          <PWAInstallButton
            variant="sidebar"
            onAfterClick={() => setIsMobileOpen(false)}
          />
          <button
            type="button"
            onClick={() => toggleDeviceDarkMode()}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isDeviceDarkMode
                ? 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/30'
                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
            }`}
            title="Ubah Mode Malam (Khusus Perangkat Ini)"
          >
            <div className="flex items-center gap-2">
              {isDeviceDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-current" />
              )}
              <span className="text-[11px]">
                {isDeviceDarkMode ? 'Mode Malam (Aktif)' : 'Mode Malam'}
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-black/10 dark:bg-white/10 opacity-70">
              Lokal
            </span>
          </button>
        </div>

        {/* User Footer Profile */}
        {currentUser && (
          <div className={`p-3 border-t ${sidebarStyle.profileBg}`}>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-white/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold block truncate">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] opacity-70 block truncate">
                    @{currentUser.username} · {isSuperAdmin ? 'Superadmin' : currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'wali_kelas' ? 'Wali Kelas' : 'Guru'}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                title="Keluar"
                className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
