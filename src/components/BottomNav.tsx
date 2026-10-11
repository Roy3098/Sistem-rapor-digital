import React from 'react';
import { useApp, AppView } from '../context/AppContext';
import { isDarkSurfaceMode } from '../utils/theme';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Database,
  FileQuestion,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, themeClasses, themeSettings, siteSettings } = useApp();
  const isDarkSurface = isDarkSurfaceMode(themeSettings);

  const items: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'grades', label: 'Penilaian', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'reports', label: 'Rapor', icon: <FileCheck2 className="w-4 h-4" /> },
    ...(siteSettings.enableBankSoal !== false
      ? [{ id: 'exams' as AppView, label: 'Bank Soal', icon: <FileQuestion className="w-4 h-4" /> }]
      : []),
    { id: 'manage', label: 'Kelola', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t shadow-lg lg:hidden no-print ${
        isDarkSurface
          ? 'bg-slate-900/95 border-slate-800 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-700'
      }`}
    >
      <div className="max-w-lg mx-auto px-2">
        <div className="grid grid-flow-col auto-cols-fr gap-1 py-1.5">
          {items.map((item) => {
            const isActive =
              currentView === item.id || (item.id === 'grades' && currentView === 'tahfidz');
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`h-11 w-full min-w-0 flex flex-col items-center justify-center px-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? `${themeClasses.primaryText} ${themeClasses.primaryLightBg} font-bold`
                    : isDarkSurface
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 font-medium'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
                }`}
              >
                <div
                  className={`${
                    isActive ? 'scale-105' : isDarkSurface ? 'text-slate-400' : 'text-slate-500'
                  } transition-transform shrink-0`}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 leading-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
