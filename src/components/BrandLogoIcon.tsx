import React from 'react';
import { useApp } from '../context/AppContext';
import { getReportThemeStyles } from '../utils/theme';
import {
  BookOpen,
  GraduationCap,
  Award,
  School,
  Sparkles,
} from 'lucide-react';

// Crisp SVG Data-URI emblems that can be used as Left or Right Kop Logo presets
// or fallback alongside uploaded custom PNG/JPG files.
export const KOP_EMBLEM_ISLAMIC_STAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <circle cx="60" cy="60" r="56" fill="#ecfdf5" stroke="#047857" stroke-width="4"/>
  <circle cx="60" cy="60" r="48" fill="none" stroke="#047857" stroke-width="1.5" stroke-dasharray="3 3"/>
  <polygon points="60,14 73,47 106,60 73,73 60,106 47,73 14,60 47,47" fill="#047857" fill-opacity="0.12" stroke="#047857" stroke-width="2.5"/>
  <rect x="35" y="35" width="50" height="50" transform="rotate(45 60 60)" fill="none" stroke="#047857" stroke-width="2"/>
  <path d="M44 68 C44 56, 60 52, 60 64 C60 52, 76 56, 76 68 L76 76 C76 76, 60 71, 60 79 C60 71, 44 76, 44 76 Z" fill="#047857"/>
  <circle cx="60" cy="42" r="5" fill="#d97706"/>
</svg>`);

export const KOP_EMBLEM_MADRASAH_SHIELD =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <path d="M60 10 L102 26 V58 C102 86 84 104 60 112 C36 104 18 86 18 58 V26 L60 10 Z" fill="#f0fdf4" stroke="#15803d" stroke-width="4"/>
  <path d="M60 18 L94 31 V57 C94 80 79 95 60 103 C41 95 26 80 26 57 V31 L60 18 Z" fill="none" stroke="#d97706" stroke-width="2"/>
  <path d="M42 66 L60 56 L78 66 L60 76 Z" fill="#15803d"/>
  <path d="M42 46 C42 36, 60 28, 60 28 C60 28, 78 36, 78 46 H42 Z" fill="#d97706"/>
  <rect x="46" y="78" width="28" height="6" rx="3" fill="#15803d"/>
</svg>`);

interface BrandLogoIconProps {
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'left' | 'right';
  shape?: 'clean' | 'rounded' | 'circle' | 'bordered';
  customUrlOverride?: string;
}

export const BrandLogoIcon: React.FC<BrandLogoIconProps> = ({
  className = 'w-9 h-9',
  imgClassName = 'w-full h-full object-contain',
  size = 'md',
  variant = 'left',
  shape,
  customUrlOverride,
}) => {
  const { themeSettings, siteSettings } = useApp();

  const logoType = themeSettings?.logoIconType || 'image';
  const leftImg =
    themeSettings?.customLogoUrl ||
    siteSettings?.customLogoUrl ||
    '/src/assets/images/logo_baiturrahman_1791464090153.jpg';

  const rightImg =
    themeSettings?.customRightLogoUrl ||
    siteSettings?.customRightLogoUrl ||
    leftImg;

  const activeImg = customUrlOverride || (variant === 'right' ? rightImg : leftImg);

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  if (variant === 'left' && !customUrlOverride) {
    if (logoType === 'book') {
      return (
        <div className={`${className} rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 ring-1 ring-blue-500/20`}>
          <BookOpen className={iconSizes[size]} />
        </div>
      );
    }

    if (logoType === 'graduation') {
      return (
        <div className={`${className} rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 ring-1 ring-indigo-500/20`}>
          <GraduationCap className={iconSizes[size]} />
        </div>
      );
    }

    if (logoType === 'award') {
      return (
        <div className={`${className} rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 ring-1 ring-amber-500/20`}>
          <Award className={iconSizes[size]} />
        </div>
      );
    }

    if (logoType === 'school') {
      return (
        <div className={`${className} rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 ring-1 ring-teal-500/20`}>
          <School className={iconSizes[size]} />
        </div>
      );
    }

    if (logoType === 'sparkles') {
      return (
        <div className={`${className} rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 ring-1 ring-rose-500/20`}>
          <Sparkles className={iconSizes[size]} />
        </div>
      );
    }
  }

  const shapeClass =
    shape === 'clean'
      ? 'bg-transparent'
      : shape === 'circle'
      ? 'rounded-full overflow-hidden ring-1 ring-slate-200/80 bg-white p-0.5'
      : shape === 'bordered'
      ? 'rounded-lg overflow-hidden border border-slate-300 bg-white p-0.5'
      : 'rounded-xl overflow-hidden ring-1 ring-slate-200/80 bg-white shadow-2xs';

  return (
    <div className={`${className} ${shapeClass} flex items-center justify-center shrink-0`}>
      <img
        src={activeImg}
        alt={variant === 'right' ? 'Logo Kanan' : 'Logo Kiri'}
        className={imgClassName}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            '/src/assets/images/logo_baiturrahman_1791464090153.jpg';
        }}
      />
    </div>
  );
};

interface OfficialKopSuratProps {
  subtitlePrefix?: string;
  subtitleOverride?: string;
  reportStyles?: ReturnType<typeof getReportThemeStyles>;
  compact?: boolean;
}

/**
 * Reusable Official Kop Madrasah / Pesantren Header for PDF Report Cards, Exam Sheets & Live Previews.
 * Supports two images (Left Logo & Right Logo), single left logo, centered logo, or split 2-column layout.
 */
export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  subtitlePrefix,
  subtitleOverride,
  reportStyles: propReportStyles,
  compact = false,
}) => {
  const { siteSettings, themeSettings } = useApp();
  const reportStyles = propReportStyles || getReportThemeStyles(themeSettings);
  const resolvedSubtitle = subtitlePrefix || subtitleOverride;

  const sizeMap = {
    sm: compact ? 'w-11 h-11' : 'w-12 h-12',
    md: compact ? 'w-13 h-13' : 'w-15 h-15',
    lg: compact ? 'w-15 h-15' : 'w-18 h-18',
  };
  const logoDimensionClass = sizeMap[reportStyles.logoSize] || sizeMap.md;

  const renderDivider = () => {
    if (reportStyles.kopDividerStyle === 'single') {
      return (
        <div
          className="mb-1.5 mt-1"
          style={{ borderBottom: `2px solid ${reportStyles.primaryHex}` }}
        />
      );
    }
    if (reportStyles.kopDividerStyle === 'triple') {
      return (
        <div className="mb-1.5 mt-1 space-y-[2px]">
          <div style={{ borderBottom: `1px solid ${reportStyles.primaryHex}` }} />
          <div style={{ borderBottom: `2.5px solid ${reportStyles.primaryHex}` }} />
          <div style={{ borderBottom: `1px solid ${reportStyles.primaryHex}` }} />
        </div>
      );
    }
    if (reportStyles.kopDividerStyle === 'accent') {
      return (
        <div
          className="mb-1.5 mt-1 h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${reportStyles.primaryHex} 0%, #0f172a 50%, ${reportStyles.primaryHex} 100%)`,
          }}
        />
      );
    }
    // Default: double formal line
    return (
      <div className="mb-1.5 mt-1 space-y-[2px]">
        <div style={{ borderBottom: `2.5px solid ${reportStyles.primaryHex}` }} />
        <div style={{ borderBottom: `1px solid ${reportStyles.primaryHex}` }} />
      </div>
    );
  };

  if (reportStyles.headerStyle === 'centered') {
    return (
      <div>
        <div className="flex flex-col items-center text-center pb-1">
          <div className="flex items-center justify-center gap-3 mb-1">
            {reportStyles.showLeftLogo && (
              <BrandLogoIcon
                variant="left"
                shape={reportStyles.logoShape}
                className={logoDimensionClass}
                imgClassName="w-full h-full object-contain"
              />
            )}
            {reportStyles.showRightLogo && (
              <BrandLogoIcon
                variant="right"
                shape={reportStyles.logoShape}
                className={logoDimensionClass}
                imgClassName="w-full h-full object-contain"
              />
            )}
          </div>
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700">
            {siteSettings.foundationName || 'YAYASAN PENDIDIKAN ISLAM BAITURRAHMAN'}
          </h3>
          <h2
            className="text-xl sm:text-[21px] font-black uppercase tracking-wide leading-tight"
            style={{ color: reportStyles.primaryHex }}
          >
            {resolvedSubtitle ? `${resolvedSubtitle} — ${siteSettings.schoolName}` : siteSettings.schoolName}
          </h2>
          <p className="text-xs text-slate-700 mt-0.5">{siteSettings.schoolAddress}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 mt-0.5 font-medium">
            <span>Telp: {siteSettings.schoolPhone}</span>
            <span>•</span>
            <span>Email: {siteSettings.schoolEmail}</span>
            <span>•</span>
            <span>{siteSettings.schoolNsmNpsn}</span>
          </div>
        </div>
        {renderDivider()}
      </div>
    );
  }

  if (reportStyles.headerStyle === 'split') {
    return (
      <div>
        <div className="flex items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-3">
            {reportStyles.showLeftLogo && (
              <BrandLogoIcon
                variant="left"
                shape={reportStyles.logoShape}
                className={logoDimensionClass}
                imgClassName="w-full h-full object-contain"
              />
            )}
            <div>
              <h3 className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
                {siteSettings.foundationName || 'YAYASAN PENDIDIKAN ISLAM BAITURRAHMAN'}
              </h3>
              <h2
                className="text-lg sm:text-xl font-black uppercase tracking-tight leading-tight"
                style={{ color: reportStyles.primaryHex }}
              >
                {resolvedSubtitle ? `${resolvedSubtitle} — ${siteSettings.schoolName}` : siteSettings.schoolName}
              </h2>
              <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                {siteSettings.schoolNsmNpsn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-[11px] text-slate-700 space-y-0.5 max-w-xs">
              <p className="font-medium leading-snug">{siteSettings.schoolAddress}</p>
              <p>
                Telp: {siteSettings.schoolPhone} · {siteSettings.schoolEmail}
              </p>
              {siteSettings.schoolWebsite && <p>{siteSettings.schoolWebsite}</p>}
            </div>
            {reportStyles.showRightLogo && (
              <BrandLogoIcon
                variant="right"
                shape={reportStyles.logoShape}
                className={logoDimensionClass}
                imgClassName="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
        {renderDivider()}
      </div>
    );
  }

  // 'dual_logo' (2 Gambar Kop Kiri & Kanan) or 'left_logo' (1 Gambar Kop Kiri)
  const isDual = reportStyles.headerStyle === 'dual_logo' || reportStyles.showRightLogo;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 pb-1">
        {/* Left Logo */}
        {reportStyles.showLeftLogo ? (
          <BrandLogoIcon
            variant="left"
            shape={reportStyles.logoShape}
            className={logoDimensionClass}
            imgClassName="w-full h-full object-contain"
          />
        ) : isDual ? (
          <div className={logoDimensionClass} />
        ) : null}

        {/* Center Institution Identity */}
        <div className="flex-1 text-center px-1">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-700 leading-tight">
            {siteSettings.foundationName || 'YAYASAN PENDIDIKAN ISLAM BAITURRAHMAN'}
          </h3>
          <h2
            className="text-lg sm:text-[21px] font-black uppercase tracking-wide leading-tight mt-0.5"
            style={{ color: reportStyles.primaryHex }}
          >
            {resolvedSubtitle ? `${resolvedSubtitle} — ${siteSettings.schoolName}` : siteSettings.schoolName}
          </h2>
          <p className="text-xs text-slate-700 mt-0.5 leading-snug">
            {siteSettings.schoolAddress ||
              'Jl. Raya Cikancung No. 45, Cikancung, Kabupaten Bandung, Jawa Barat 40396'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-slate-600 mt-0.5 font-medium">
            <span>Telp: {siteSettings.schoolPhone || '(022) 595-8821'}</span>
            <span>•</span>
            <span>Email: {siteSettings.schoolEmail || 'admin@baiturrahman.sch.id'}</span>
            <span>•</span>
            <span>{siteSettings.schoolNsmNpsn || 'NSM: 131232040089 | NPSN: 69982341'}</span>
          </div>
        </div>

        {/* Right Logo */}
        {isDual && reportStyles.showRightLogo ? (
          <BrandLogoIcon
            variant="right"
            shape={reportStyles.logoShape}
            className={logoDimensionClass}
            imgClassName="w-full h-full object-contain"
          />
        ) : isDual && reportStyles.showLeftLogo ? (
          <div className={logoDimensionClass} />
        ) : null}
      </div>
      {renderDivider()}
    </div>
  );
};

