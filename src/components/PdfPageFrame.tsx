import React from 'react';
import {
  ReportBorderStyle,
  CustomPdfFrameConfig,
  FrameCornerOrnament,
  FrameEdgeAccent,
} from '../types';
import { ReportThemeStyles } from '../utils/theme';

export interface PdfFramePresetMeta {
  id: ReportBorderStyle;
  label: string;
  shortLabel: string;
  category: 'formal' | 'islami' | 'sertifikat' | 'modern' | 'custom';
  desc: string;
  config: CustomPdfFrameConfig;
}

export const DEFAULT_CUSTOM_FRAME_CONFIG: CustomPdfFrameConfig = {
  id: 'default_custom',
  name: 'Bingkai Kustom Madrasah',
  outerLineStyle: 'double',
  outerWidth: 4,
  innerLineStyle: 'solid',
  innerWidth: 1,
  innerGap: 6,
  cornerRadius: 8,
  cornerOrnament: 'islamic_star',
  cornerOrnamentSize: 'md',
  edgeAccent: 'top_bottom_rosette',
  useThemeColor: true,
  primaryColor: '#047857',
  secondaryColor: '#d97706',
  customFrameImageUrl: '',
  customFrameImageOpacity: 85,
  customFrameImageFit: 'stretch',
};

export const PDF_FRAME_PRESETS: PdfFramePresetMeta[] = [
  {
    id: 'double',
    label: 'Garis Ganda Resmi (Double)',
    shortLabel: 'Garis Ganda Resmi',
    category: 'formal',
    desc: 'Bingkai garis ganda klasik standar dokumen rapor resmi madrasah.',
    config: {
      outerLineStyle: 'double',
      outerWidth: 4,
      innerLineStyle: 'none',
      innerWidth: 1,
      innerGap: 5,
      cornerRadius: 10,
      cornerOrnament: 'none',
      cornerOrnamentSize: 'md',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'triple_formal',
    label: 'Garis Rangkap Tiga (Triple Line)',
    shortLabel: 'Rangkap Tiga Resmi',
    category: 'formal',
    desc: 'Bingkai luar ganda dipadukan garis dalam tegas berjarak presisi.',
    config: {
      outerLineStyle: 'double',
      outerWidth: 4,
      innerLineStyle: 'solid',
      innerWidth: 1,
      innerGap: 5,
      cornerRadius: 8,
      cornerOrnament: 'double_bracket',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'islamic_arch',
    label: 'Bintang Islami & Mihrab (Rub el Hizb)',
    shortLabel: 'Bintang Islami',
    category: 'islami',
    desc: 'Ornamen bintang segi delapan Islami di 4 sudut dengan medali atas-bawah.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2.5,
      innerLineStyle: 'solid',
      innerWidth: 1,
      innerGap: 6,
      cornerRadius: 8,
      cornerOrnament: 'islamic_star',
      cornerOrnamentSize: 'md',
      edgeAccent: 'top_bottom_rosette',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#d97706',
    },
  },
  {
    id: 'pesantren_turats',
    label: 'Kitab Turats Pesantren (Manuskrip)',
    shortLabel: 'Kitab Turats',
    category: 'islami',
    desc: 'Bingkai manuskrip klasik pesantren dengan ornamen kubah & aksen keemasan.',
    config: {
      outerLineStyle: 'double',
      outerWidth: 4,
      innerLineStyle: 'solid',
      innerWidth: 1.5,
      innerGap: 7,
      cornerRadius: 6,
      cornerOrnament: 'crescent_dome',
      cornerOrnamentSize: 'lg',
      edgeAccent: 'all_sides_diamond',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#b45309',
    },
  },
  {
    id: 'geometric_kufi',
    label: 'Geometris Kufi Arsitektural',
    shortLabel: 'Geometris Kufi',
    category: 'islami',
    desc: 'Siku labirin Kufi simetris bergaya arsitektur Timur Tengah modern.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2.5,
      innerLineStyle: 'solid',
      innerWidth: 1,
      innerGap: 5,
      cornerRadius: 4,
      cornerOrnament: 'kufi_step',
      cornerOrnamentSize: 'md',
      edgeAccent: 'dual_side_pillars',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'corner_floral',
    label: 'Sulur Flora Arabesk (Floral Corners)',
    shortLabel: 'Flora Arabesk',
    category: 'islami',
    desc: 'Ukiran daun arabesk anggun di keempat penjuru halaman rapor.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2,
      innerLineStyle: 'dashed',
      innerWidth: 1,
      innerGap: 6,
      cornerRadius: 12,
      cornerOrnament: 'floral_leaf',
      cornerOrnamentSize: 'lg',
      edgeAccent: 'top_bottom_rosette',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'ornate',
    label: 'Ornamen Sertifikat Klasik (Ornate)',
    shortLabel: 'Ornamen Sertifikat',
    category: 'sertifikat',
    desc: 'Bingkai ganda sertifikat dengan ukiran siku klasik di keempat sudut.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2.5,
      innerLineStyle: 'solid',
      innerWidth: 1,
      innerGap: 5,
      cornerRadius: 8,
      cornerOrnament: 'classic_flourish',
      cornerOrnamentSize: 'md',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'royal_gold_seal',
    label: 'Piagam Kehormatan Emas (Royal Gold)',
    shortLabel: 'Piagam Emas',
    category: 'sertifikat',
    desc: 'Perpaduan warna tema madrasah dan garis dalam emas dengan segel berlian.',
    config: {
      outerLineStyle: 'double',
      outerWidth: 4,
      innerLineStyle: 'solid',
      innerWidth: 1.5,
      innerGap: 6,
      cornerRadius: 8,
      cornerOrnament: 'diamond_seal',
      cornerOrnamentSize: 'md',
      edgeAccent: 'all_sides_diamond',
      useThemeColor: false,
      primaryColor: '#047857',
      secondaryColor: '#d97706',
    },
  },
  {
    id: 'vintage_scroll',
    label: 'Filigri Ijazah Berlapis (Vintage)',
    shortLabel: 'Filigri Ijazah',
    category: 'sertifikat',
    desc: 'Bingkai ijazah berlapis dengan siku lipatan ganda & medali sisi.',
    config: {
      outerLineStyle: 'ridge',
      outerWidth: 3.5,
      innerLineStyle: 'double',
      innerWidth: 3,
      innerGap: 6,
      cornerRadius: 4,
      cornerOrnament: 'classic_flourish',
      cornerOrnamentSize: 'lg',
      edgeAccent: 'top_bottom_rosette',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#b45309',
    },
  },
  {
    id: 'modern_accent',
    label: 'Pita Aksen Atas & Bawah (Modern Bar)',
    shortLabel: 'Pita Atas-Bawah',
    category: 'modern',
    desc: 'Pita warna tebal di tepi atas & bawah halaman dengan bingkai bersih.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 1.5,
      innerLineStyle: 'none',
      innerWidth: 1,
      innerGap: 4,
      cornerRadius: 10,
      cornerOrnament: 'double_bracket',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'top_ribbon_bar',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'dashed_coupon',
    label: 'Garis Dalam Putus-Putus (Dashed)',
    shortLabel: 'Garis Putus-Putus',
    category: 'modern',
    desc: 'Garis luar tegas dipadukan garis dalam putus-putus dan siku berlian.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2,
      innerLineStyle: 'dashed',
      innerWidth: 1.5,
      innerGap: 5,
      cornerRadius: 8,
      cornerOrnament: 'diamond_seal',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'dotted_frame',
    label: 'Untaian Manik Titik (Beaded Dotted)',
    shortLabel: 'Manik Titik',
    category: 'modern',
    desc: 'Bingkai untaian titik-titik dekoratif presisi dengan garis dalam tipis.',
    config: {
      outerLineStyle: 'dotted',
      outerWidth: 3,
      innerLineStyle: 'solid',
      innerWidth: 1,
      innerGap: 5,
      cornerRadius: 10,
      cornerOrnament: 'islamic_star',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'shadow_box',
    label: 'Kotak Berlapis 3D (Shadow Frame)',
    shortLabel: 'Kotak 3D Tegas',
    category: 'modern',
    desc: 'Bingkai editorial tegas dengan bayangan siku berlapis tajam.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2.5,
      innerLineStyle: 'solid',
      innerWidth: 1,
      innerGap: 4,
      cornerRadius: 6,
      cornerOrnament: 'double_bracket',
      cornerOrnamentSize: 'md',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#0f172a',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'single',
    label: 'Garis Tunggal Tegas (Single Bold)',
    shortLabel: 'Tunggal Tegas',
    category: 'formal',
    desc: 'Satu garis tegas mengelilingi halaman dokumen secara formal.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 2,
      innerLineStyle: 'none',
      innerWidth: 1,
      innerGap: 4,
      cornerRadius: 8,
      cornerOrnament: 'none',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'none',
      useThemeColor: false,
      primaryColor: '#0f172a',
      secondaryColor: '#0f172a',
    },
  },
  {
    id: 'minimal',
    label: 'Garis Tipis Minimalis (Minimal)',
    shortLabel: 'Tipis Minimalis',
    category: 'formal',
    desc: 'Garis tepi tipis bersih untuk tampilan rapor modern.',
    config: {
      outerLineStyle: 'solid',
      outerWidth: 1,
      innerLineStyle: 'none',
      innerWidth: 1,
      innerGap: 4,
      cornerRadius: 8,
      cornerOrnament: 'none',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'none',
      useThemeColor: false,
      primaryColor: '#cbd5e1',
      secondaryColor: '#cbd5e1',
    },
  },
  {
    id: 'none',
    label: 'Tanpa Bingkai Luar (Polos)',
    shortLabel: 'Tanpa Bingkai',
    category: 'formal',
    desc: 'Halaman putih bersih tanpa garis bingkai tepi.',
    config: {
      outerLineStyle: 'none',
      outerWidth: 0,
      innerLineStyle: 'none',
      innerWidth: 0,
      innerGap: 0,
      cornerRadius: 0,
      cornerOrnament: 'none',
      cornerOrnamentSize: 'sm',
      edgeAccent: 'none',
      useThemeColor: true,
      primaryColor: '#047857',
      secondaryColor: '#047857',
    },
  },
  {
    id: 'custom',
    label: 'Bingkai Kustom Buatan Sendiri',
    shortLabel: 'Kustom Sendiri',
    category: 'custom',
    desc: 'Rancang sendiri kombinasi garis luar, garis dalam, ornamen sudut, warna, atau gambar bingkai.',
    config: DEFAULT_CUSTOM_FRAME_CONFIG,
  },
];

export interface ResolvedPdfFrame {
  config: CustomPdfFrameConfig;
  outerColor: string;
  innerColor: string;
  isShadowBox: boolean;
}

export function resolveEffectiveFrameConfig(
  borderStyle: ReportBorderStyle | undefined,
  primaryHex: string,
  borderHex: string,
  customConfig?: CustomPdfFrameConfig
): ResolvedPdfFrame {
  const styleKey: ReportBorderStyle = borderStyle || 'double';

  if (styleKey === 'custom') {
    const merged: CustomPdfFrameConfig = {
      ...DEFAULT_CUSTOM_FRAME_CONFIG,
      ...(customConfig || {}),
    };
    const outerColor = merged.useThemeColor
      ? primaryHex
      : merged.primaryColor || primaryHex;
    const innerColor = merged.useThemeColor
      ? merged.secondaryColor || borderHex
      : merged.secondaryColor || outerColor;
    return {
      config: merged,
      outerColor,
      innerColor,
      isShadowBox: false,
    };
  }

  const found =
    PDF_FRAME_PRESETS.find((p) => p.id === styleKey) || PDF_FRAME_PRESETS[0];
  const baseCfg = found.config;

  let outerColor = primaryHex;
  let innerColor = primaryHex;

  if (styleKey === 'single') {
    outerColor = '#0f172a';
    innerColor = '#0f172a';
  } else if (styleKey === 'minimal') {
    outerColor = '#cbd5e1';
    innerColor = '#cbd5e1';
  } else if (styleKey === 'royal_gold_seal') {
    outerColor = primaryHex;
    innerColor = '#d97706';
  } else if (styleKey === 'pesantren_turats' || styleKey === 'vintage_scroll') {
    outerColor = primaryHex;
    innerColor = '#b45309';
  } else if (styleKey === 'islamic_arch') {
    outerColor = primaryHex;
    innerColor = '#d97706';
  } else if (styleKey === 'ornate') {
    outerColor = primaryHex;
    innerColor = borderHex;
  }

  return {
    config: baseCfg,
    outerColor,
    innerColor,
    isShadowBox: styleKey === 'shadow_box',
  };
}

export function getPdfSheetBorderStyle(
  reportStyles: ReportThemeStyles,
  fontFamilyInline?: string
): React.CSSProperties {
  const { config, outerColor, isShadowBox } = resolveEffectiveFrameConfig(
    reportStyles.borderStyle,
    reportStyles.primaryHex,
    reportStyles.borderHex,
    reportStyles.customFrameConfig
  );

  if (reportStyles.borderStyle === 'none' || config.outerLineStyle === 'none' || config.outerWidth <= 0) {
    return {
      border: 'none',
      borderRadius: `${config.cornerRadius || 0}px`,
      fontFamily: fontFamilyInline,
    };
  }

  return {
    border: `${config.outerWidth}px ${config.outerLineStyle} ${outerColor}`,
    borderRadius: `${config.cornerRadius}px`,
    boxShadow: isShadowBox ? `4px 4px 0px 0px ${outerColor}` : undefined,
    fontFamily: fontFamilyInline,
  };
}

interface CornerOrnamentSvgProps {
  type: FrameCornerOrnament;
  sizePx: number;
  primaryColor: string;
  secondaryColor: string;
  corner: 'tl' | 'tr' | 'br' | 'bl';
}

export const CornerOrnamentSvg: React.FC<CornerOrnamentSvgProps> = ({
  type,
  sizePx,
  primaryColor,
  secondaryColor,
  corner,
}) => {
  if (type === 'none') return null;

  const rotateClass =
    corner === 'tl'
      ? 'rotate-0'
      : corner === 'tr'
      ? 'rotate-90'
      : corner === 'br'
      ? 'rotate-180'
      : '-rotate-90';

  const posClass =
    corner === 'tl'
      ? 'top-1.5 left-1.5'
      : corner === 'tr'
      ? 'top-1.5 right-1.5'
      : corner === 'br'
      ? 'bottom-1.5 right-1.5'
      : 'bottom-1.5 left-1.5';

  return (
    <div
      className={`absolute ${posClass} ${rotateClass} pointer-events-none select-none`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {type === 'islamic_star' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path
            d="M2 2 H34 M2 2 V34"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M6 6 H26 M6 6 V26"
            stroke={secondaryColor}
            strokeWidth="1.2"
          />
          {/* 8-Pointed Rub el Hizb Star in Corner */}
          <g transform="translate(14, 14)">
            <rect
              x="-7"
              y="-7"
              width="14"
              height="14"
              fill={primaryColor}
              fillOpacity="0.14"
              stroke={primaryColor}
              strokeWidth="1.5"
            />
            <rect
              x="-7"
              y="-7"
              width="14"
              height="14"
              transform="rotate(45)"
              fill={secondaryColor}
              fillOpacity="0.18"
              stroke={secondaryColor}
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="2.6" fill={secondaryColor} />
          </g>
        </svg>
      )}

      {type === 'classic_flourish' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path
            d="M2 2 H40 C32 2, 26 8, 22 14 C18 20, 12 24, 2 24 Z"
            fill={primaryColor}
            fillOpacity="0.1"
          />
          <path
            d="M2 38 V2 H38"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M7 32 V7 H32"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 18 C14 18, 18 14, 18 7"
            stroke={primaryColor}
            strokeWidth="1.8"
            fill="none"
          />
          <circle cx="12" cy="12" r="2.5" fill={secondaryColor} />
          <circle cx="25" cy="7" r="1.8" fill={primaryColor} />
          <circle cx="7" cy="25" r="1.8" fill={primaryColor} />
        </svg>
      )}

      {type === 'kufi_step' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path
            d="M2 36 V2 H36 V10 H10 V36 H2 Z"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />
          <path
            d="M14 26 V14 H26 V20 H20 V26 H14 Z"
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke={secondaryColor}
            strokeWidth="1.6"
          />
          <rect x="4" y="4" width="5" height="5" fill={primaryColor} />
        </svg>
      )}

      {type === 'diamond_seal' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path d="M2 32 V2 H32" stroke={primaryColor} strokeWidth="2.2" />
          <path d="M6 26 V6 H26" stroke={secondaryColor} strokeWidth="1.3" />
          <polygon
            points="13,4 22,13 13,22 4,13"
            fill={secondaryColor}
            fillOpacity="0.18"
            stroke={primaryColor}
            strokeWidth="1.8"
          />
          <polygon points="13,8 18,13 13,18 8,13" fill={secondaryColor} />
        </svg>
      )}

      {type === 'floral_leaf' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path
            d="M3 36 V3 H36"
            stroke={primaryColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 6 C18 6, 24 12, 24 24 C12 24, 6 18, 6 6 Z"
            fill={primaryColor}
            fillOpacity="0.16"
            stroke={primaryColor}
            strokeWidth="1.6"
          />
          <path
            d="M6 6 C22 10, 28 16, 32 32"
            stroke={secondaryColor}
            strokeWidth="1.4"
            strokeDasharray="2 2"
          />
          <circle cx="15" cy="15" r="2.5" fill={secondaryColor} />
        </svg>
      )}

      {type === 'double_bracket' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path d="M2 34 V2 H34" stroke={primaryColor} strokeWidth="3" />
          <path d="M8 26 V8 H26" stroke={secondaryColor} strokeWidth="1.8" />
          <rect x="12" y="12" width="6" height="6" fill={primaryColor} />
        </svg>
      )}

      {type === 'crescent_dome' && (
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <path d="M2 38 V2 H38" stroke={primaryColor} strokeWidth="2.4" />
          <path
            d="M6 30 V14 C6 8, 8 6, 14 6 H30"
            stroke={secondaryColor}
            strokeWidth="1.6"
          />
          <path
            d="M8 8 C18 8, 24 14, 24 24 C14 24, 8 18, 8 8 Z"
            fill={secondaryColor}
            fillOpacity="0.18"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
          <circle cx="14" cy="14" r="3" fill={secondaryColor} />
        </svg>
      )}
    </div>
  );
};

interface PdfPageFrameOverlayProps {
  reportStyles: ReportThemeStyles;
  compact?: boolean;
}

/**
 * Renders the decorative inner borders, corner ornaments, side medallions,
 * and optional custom uploaded frame image inside any PDF sheet or preview box.
 */
export const PdfPageFrameOverlay: React.FC<PdfPageFrameOverlayProps> = ({
  reportStyles,
  compact = false,
}) => {
  const { config, outerColor, innerColor } = resolveEffectiveFrameConfig(
    reportStyles.borderStyle,
    reportStyles.primaryHex,
    reportStyles.borderHex,
    reportStyles.customFrameConfig
  );

  if (reportStyles.borderStyle === 'none') return null;

  const sizeMap = {
    sm: compact ? 16 : 24,
    md: compact ? 22 : 34,
    lg: compact ? 28 : 44,
  };
  const ornamentSizePx = sizeMap[config.cornerOrnamentSize || 'md'] || (compact ? 22 : 34);
  const gapPx = compact ? Math.max(2, Math.round(config.innerGap * 0.6)) : config.innerGap;
  const innerRadiusPx = Math.max(0, (config.cornerRadius || 0) - gapPx);

  return (
    <div className="pointer-events-none select-none absolute inset-0 z-[5] overflow-hidden">
      {/* 1. Custom Uploaded Frame Image (if user uploaded or linked an image frame) */}
      {config.customFrameImageUrl && (
        <img
          src={config.customFrameImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: config.customFrameImageFit === 'contain' ? 'contain' : 'fill',
            opacity: (config.customFrameImageOpacity ?? 85) / 100,
          }}
        />
      )}

      {/* 2. Top & Bottom Ribbon Bar Accent */}
      {config.edgeAccent === 'top_ribbon_bar' && (
        <>
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: compact ? '4px' : '7px',
              background: `linear-gradient(90deg, ${outerColor} 0%, ${innerColor} 50%, ${outerColor} 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: compact ? '4px' : '7px',
              background: `linear-gradient(90deg, ${outerColor} 0%, ${innerColor} 50%, ${outerColor} 100%)`,
            }}
          />
        </>
      )}

      {/* 3. Dual Side Pillars Accent */}
      {config.edgeAccent === 'dual_side_pillars' && (
        <>
          <div
            className="absolute top-6 bottom-6 left-1"
            style={{
              width: compact ? '2px' : '3px',
              backgroundColor: innerColor,
              opacity: 0.45,
            }}
          />
          <div
            className="absolute top-6 bottom-6 right-1"
            style={{
              width: compact ? '2px' : '3px',
              backgroundColor: innerColor,
              opacity: 0.45,
            }}
          />
        </>
      )}

      {/* 4. Inner Line Border */}
      {config.innerLineStyle !== 'none' && config.innerWidth > 0 && (
        <div
          className="absolute"
          style={{
            top: `${gapPx}px`,
            left: `${gapPx}px`,
            right: `${gapPx}px`,
            bottom: `${gapPx}px`,
            border: `${compact ? Math.max(1, config.innerWidth - 0.5) : config.innerWidth}px ${
              config.innerLineStyle
            } ${innerColor}`,
            borderRadius: `${innerRadiusPx}px`,
          }}
        />
      )}

      {/* 5. Top & Bottom Rosette Medallions */}
      {(config.edgeAccent === 'top_bottom_rosette' ||
        config.edgeAccent === 'all_sides_diamond') && (
        <>
          {/* Top Center Medallion */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1"
            style={{ top: `${Math.max(1, gapPx - 3)}px` }}
          >
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '4px' : '6px',
                height: compact ? '4px' : '6px',
                backgroundColor: outerColor,
              }}
            />
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '6px' : '9px',
                height: compact ? '6px' : '9px',
                backgroundColor: innerColor,
                border: `1px solid ${outerColor}`,
              }}
            />
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '4px' : '6px',
                height: compact ? '4px' : '6px',
                backgroundColor: outerColor,
              }}
            />
          </div>

          {/* Bottom Center Medallion */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1"
            style={{ bottom: `${Math.max(1, gapPx - 3)}px` }}
          >
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '4px' : '6px',
                height: compact ? '4px' : '6px',
                backgroundColor: outerColor,
              }}
            />
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '6px' : '9px',
                height: compact ? '6px' : '9px',
                backgroundColor: innerColor,
                border: `1px solid ${outerColor}`,
              }}
            />
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '4px' : '6px',
                height: compact ? '4px' : '6px',
                backgroundColor: outerColor,
              }}
            />
          </div>
        </>
      )}

      {/* Left & Right Center Diamonds when all_sides_diamond */}
      {config.edgeAccent === 'all_sides_diamond' && (
        <>
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ left: `${Math.max(1, gapPx - 3)}px` }}
          >
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '5px' : '7px',
                height: compact ? '5px' : '7px',
                backgroundColor: innerColor,
              }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ right: `${Math.max(1, gapPx - 3)}px` }}
          >
            <span
              className="inline-block rotate-45"
              style={{
                width: compact ? '5px' : '7px',
                height: compact ? '5px' : '7px',
                backgroundColor: innerColor,
              }}
            />
          </div>
        </>
      )}

      {/* 6. Four Corner Vector Ornaments */}
      {config.cornerOrnament !== 'none' && (
        <>
          <CornerOrnamentSvg
            type={config.cornerOrnament}
            sizePx={ornamentSizePx}
            primaryColor={outerColor}
            secondaryColor={innerColor}
            corner="tl"
          />
          <CornerOrnamentSvg
            type={config.cornerOrnament}
            sizePx={ornamentSizePx}
            primaryColor={outerColor}
            secondaryColor={innerColor}
            corner="tr"
          />
          <CornerOrnamentSvg
            type={config.cornerOrnament}
            sizePx={ornamentSizePx}
            primaryColor={outerColor}
            secondaryColor={innerColor}
            corner="br"
          />
          <CornerOrnamentSvg
            type={config.cornerOrnament}
            sizePx={ornamentSizePx}
            primaryColor={outerColor}
            secondaryColor={innerColor}
            corner="bl"
          />
        </>
      )}
    </div>
  );
};

interface PdfFrameThumbnailProps {
  borderStyle: ReportBorderStyle;
  primaryHex: string;
  borderHex: string;
  customConfig?: CustomPdfFrameConfig;
}

/**
 * Miniature visual preview box rendered inside Frame Selector cards
 */
export const PdfFrameThumbnail: React.FC<PdfFrameThumbnailProps> = ({
  borderStyle,
  primaryHex,
  borderHex,
  customConfig,
}) => {
  const dummyReportStyles = {
    primaryHex,
    borderHex,
    borderStyle,
    customFrameConfig: customConfig,
  } as ReportThemeStyles;

  const outerStyle = getPdfSheetBorderStyle(dummyReportStyles);

  return (
    <div
      style={outerStyle}
      className="relative w-full h-14 bg-white overflow-hidden flex flex-col items-center justify-center p-2 shadow-2xs"
    >
      <PdfPageFrameOverlay reportStyles={dummyReportStyles} compact />
      <div className="relative z-10 w-3/4 space-y-1 opacity-55">
        <div
          className="h-1 rounded-full mx-auto w-2/3"
          style={{ backgroundColor: primaryHex }}
        />
        <div className="h-0.5 bg-slate-300 rounded-full w-full" />
        <div className="h-0.5 bg-slate-200 rounded-full w-5/6 mx-auto" />
      </div>
    </div>
  );
};

/**
 * Generates CSS border and inline HTML overlay for .HTML and .DOC exports
 */
export function getHtmlExportFrameMarkup(reportStyles: ReportThemeStyles): {
  borderCss: string;
  borderRadiusCss: string;
  boxShadowCss: string;
} {
  const { config, outerColor, innerColor, isShadowBox } = resolveEffectiveFrameConfig(
    reportStyles.borderStyle,
    reportStyles.primaryHex,
    reportStyles.borderHex,
    reportStyles.customFrameConfig
  );

  if (reportStyles.borderStyle === 'none' || config.outerLineStyle === 'none') {
    return {
      borderCss: 'none',
      borderRadiusCss: '0px',
      boxShadowCss: 'none',
    };
  }

  const borderCss = `${config.outerWidth}px ${config.outerLineStyle} ${outerColor}`;
  const borderRadiusCss = `${config.cornerRadius || 0}px`;
  let boxShadowCss = 'none';

  if (isShadowBox) {
    boxShadowCss = `4px 4px 0px 0px ${outerColor}`;
  } else if (config.innerLineStyle !== 'none' && config.innerWidth > 0) {
    boxShadowCss = `inset 0 0 0 ${config.innerGap}px #ffffff, inset 0 0 0 ${
      config.innerGap + config.innerWidth
    }px ${innerColor}`;
  }

  return {
    borderCss,
    borderRadiusCss,
    boxShadowCss,
  };
}
