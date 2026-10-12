import { ThemeColor, ThemeSettings, ReportBorderStyle, CustomPdfFrameConfig } from '../types';

export interface ThemeClasses {
  // Brand colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryText: string;
  primaryLightBg: string;
  primaryBorder: string;
  primaryRing: string;
  focusRing: string;
  gradientHeader: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  accentBar: string;
  sidebarActive: string;
  tabActive: string;
}

const UNIVERSAL_BRAND_CLASSES: ThemeClasses = {
  primary: 'bg-brand-custom',
  primaryHover: 'hover:bg-brand-custom-hover',
  primaryActive: 'active:bg-brand-custom-active',
  primaryText: 'text-brand-custom',
  primaryLightBg: 'bg-brand-custom-light',
  primaryBorder: 'border-brand-custom',
  primaryRing: 'focus:ring-brand-custom',
  focusRing: 'focus:ring-brand-custom',
  gradientHeader: 'gradient-brand-custom',
  badge: 'bg-brand-custom-light badge-text-brand-custom border-brand-custom',
  badgeBg: 'bg-brand-custom-light',
  badgeText: 'badge-text-brand-custom',
  accentBar: 'bg-brand-custom',
  sidebarActive: 'sidebar-active-custom',
  tabActive: 'tab-active-custom',
};

export const THEME_PALETTES: Record<
  ThemeColor,
  {
    name: string;
    shortName: string;
    description: string;
    hexPrimary: string;
    hexSecondary: string;
    classes: ThemeClasses;
  }
> = {
  emerald: {
    name: 'Hijau Zamrud (Emerald)',
    shortName: 'Emerald',
    description: 'Nuansa Islami klasik madrasah, sejuk dan berwibawa.',
    hexPrimary: '#047857',
    hexSecondary: '#022c22',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  forest: {
    name: 'Hijau Hutan Nabawi (Forest)',
    shortName: 'Forest',
    description: 'Hijau daun alami yang teduh, asri, dan menenangkan.',
    hexPrimary: '#15803d',
    hexSecondary: '#052e16',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  olive: {
    name: 'Hijau Zaitun (Olive)',
    shortName: 'Olive',
    description: 'Hangat, organik, dan bernuansa pesantren salafiyah.',
    hexPrimary: '#4d7c0f',
    hexSecondary: '#1a2e05',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  mint: {
    name: 'Hijau Mint Segar (Mint)',
    shortName: 'Mint',
    description: 'Cerah, modern, dan bersih untuk antarmuka ringan.',
    hexPrimary: '#059669',
    hexSecondary: '#064e3b',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  teal: {
    name: 'Toska Bahari (Teal)',
    shortName: 'Teal',
    description: 'Segar, jernih, dan dinamis untuk pendidikan.',
    hexPrimary: '#0f766e',
    hexSecondary: '#042f2e',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  cyan: {
    name: 'Biru Samudra (Cyan)',
    shortName: 'Ocean Cyan',
    description: 'Cerah, komunikatif, dan menenangkan mata.',
    hexPrimary: '#0e7490',
    hexSecondary: '#083344',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  sky: {
    name: 'Biru Langit (Sky)',
    shortName: 'Sky Blue',
    description: 'Terbuka, ringan, dan mencerminkan wawasan luas.',
    hexPrimary: '#0284c7',
    hexSecondary: '#082f49',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  blue: {
    name: 'Biru Safir (Sapphire)',
    shortName: 'Sapphire',
    description: 'Modern, tenang, dan profesional institusional.',
    hexPrimary: '#1d4ed8',
    hexSecondary: '#172554',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  navy: {
    name: 'Biru Dongker (Navy)',
    shortName: 'Academic Navy',
    description: 'Formal, tegas, dan berwibawa tinggi.',
    hexPrimary: '#1e3a8a',
    hexSecondary: '#0f172a',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  cobalt: {
    name: 'Biru Kobalt (Cobalt)',
    shortName: 'Cobalt',
    description: 'Teknologi pendidikan modern dan presisi tinggi.',
    hexPrimary: '#2563eb',
    hexSecondary: '#1e1b4b',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  indigo: {
    name: 'Ungu Indigo (Royal)',
    shortName: 'Indigo',
    description: 'Elegan, kontemporer, dan berkelas tinggi.',
    hexPrimary: '#4338ca',
    hexSecondary: '#1e1b4b',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  violet: {
    name: 'Ungu Royal (Violet)',
    shortName: 'Violet',
    description: 'Anggun, visioner, dan berkarakter akademis modern.',
    hexPrimary: '#6d28d9',
    hexSecondary: '#2e1065',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  purple: {
    name: 'Ungu Mulia (Purple)',
    shortName: 'Royal Purple',
    description: 'Eksklusif, kreatif, dan beridentitas kuat.',
    hexPrimary: '#7e22ce',
    hexSecondary: '#3b0764',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  fuchsia: {
    name: 'Magenta Akademia (Fuchsia)',
    shortName: 'Fuchsia',
    description: 'Kontemporer, ekspresif, dan energik.',
    hexPrimary: '#a21caf',
    hexSecondary: '#4a044e',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  pink: {
    name: 'Merah Muda Mawar (Pink)',
    shortName: 'Rose Pink',
    description: 'Ramah, lembut, dan hangat untuk madrasah putri.',
    hexPrimary: '#be185d',
    hexSecondary: '#500724',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  rose: {
    name: 'Merah Delima (Ruby)',
    shortName: 'Rose Ruby',
    description: 'Penuh semangat, tajam, dan penuh estetika.',
    hexPrimary: '#be123c',
    hexSecondary: '#4c0519',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  crimson: {
    name: 'Merah Marun (Crimson)',
    shortName: 'Crimson',
    description: 'Klasik universitas dunia, tegas dan prestisius.',
    hexPrimary: '#991b1b',
    hexSecondary: '#450a0a',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  terracotta: {
    name: 'Merah Bata (Terracotta)',
    shortName: 'Terracotta',
    description: 'Hangat, membumi, dan kaya nuansa arsitektur klasik.',
    hexPrimary: '#c2410c',
    hexSecondary: '#431407',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  amber: {
    name: 'Emas Ambar (Amber)',
    shortName: 'Amber Gold',
    description: 'Hangat, kharismatik, dan bernuansa mulia.',
    hexPrimary: '#b45309',
    hexSecondary: '#451a03',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  gold: {
    name: 'Emas Sultan (Royal Gold)',
    shortName: 'Royal Gold',
    description: 'Kemuliaan ilmu, kitab kuning, dan tradisi keilmuan.',
    hexPrimary: '#a16207',
    hexSecondary: '#422006',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  bronze: {
    name: 'Cokelat Perunggu (Bronze)',
    shortName: 'Bronze',
    description: 'Klasik turats pesantren, hangat dan bersejarah.',
    hexPrimary: '#78350f',
    hexSecondary: '#271206',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  espresso: {
    name: 'Cokelat Kopi (Espresso)',
    shortName: 'Espresso',
    description: 'Netral hangat, tenang, dan nyaman dipandang lama.',
    hexPrimary: '#57534e',
    hexSecondary: '#1c1917',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  slate: {
    name: 'Abu Monokrom (Slate)',
    shortName: 'Monochrome',
    description: 'Monokromatik mutlak, bersih, dan ultra-minimalis.',
    hexPrimary: '#1e293b',
    hexSecondary: '#090d16',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  charcoal: {
    name: 'Hitam Grafit (Charcoal)',
    shortName: 'Charcoal',
    description: 'Kontras tinggi, modern, dan ketajaman tipografi maksimal.',
    hexPrimary: '#18181b',
    hexSecondary: '#09090b',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
  custom: {
    name: 'Warna Kustom (Bebas Hex)',
    shortName: 'Kustom Hex',
    description: 'Pilih kombinasi warna bebas sesuai identitas lembaga.',
    hexPrimary: '#047857',
    hexSecondary: '#0f172a',
    classes: UNIVERSAL_BRAND_CLASSES,
  },
};

export function normalizeHex(hex: string, fallback = '#047857'): string {
  const clean = (hex || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
    return (
      '#' +
      clean[1] +
      clean[1] +
      clean[2] +
      clean[2] +
      clean[3] +
      clean[3]
    );
  }
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const valid = normalizeHex(hex);
  const num = parseInt(valid.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function mixHex(hex1: string, hex2: string, weight: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    c1.r * (1 - w) + c2.r * w,
    c1.g * (1 - w) + c2.g * w,
    c1.b * (1 - w) + c2.b * w
  );
}

export function isDeviceDarkModeActive(isDeviceDarkOverride?: boolean | null): boolean {
  if (typeof isDeviceDarkOverride === 'boolean') {
    return isDeviceDarkOverride;
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('bw_device_dark_mode');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  }
  return false;
}

export function isDarkSurfaceMode(
  theme?: ThemeSettings,
  isDeviceDarkOverride?: boolean | null
): boolean {
  if (typeof isDeviceDarkOverride === 'boolean') {
    return isDeviceDarkOverride;
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('bw_device_dark_mode');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
  }
  if (theme?.surfaceMode === 'dark_elevated' || theme?.surfaceThemeMode === 'dark_slate') {
    return true;
  }
  return false;
}

export function normalizeThemeSettings(theme: ThemeSettings): ThemeSettings {
  const font = (theme.fontFamily || theme.webFontFamily || 'jakarta') as NonNullable<ThemeSettings['fontFamily']>;
  const tracking = (theme.headingLetterSpacing || theme.letterSpacingStyle || 'tight') as NonNullable<ThemeSettings['headingLetterSpacing']>;
  const lh = (theme.lineHeight || theme.lineHeightStyle || 'normal') as NonNullable<ThemeSettings['lineHeight']>;
  const card = (theme.cardStyle || theme.cardSurfaceStyle || 'bordered') as NonNullable<ThemeSettings['cardStyle']>;
  const tbl = (theme.tableStyle || theme.webTableStyle || 'clean') as NonNullable<ThemeSettings['tableStyle']>;
  const pat = (theme.bgPattern || theme.pagePattern || 'none') as NonNullable<ThemeSettings['bgPattern']>;
  const inp = (theme.inputStyle || theme.inputFieldStyle || 'outlined') as NonNullable<ThemeSettings['inputStyle']>;
  const navInd = (theme.activeTabIndicator || theme.navActiveIndicator || 'pill') as NonNullable<ThemeSettings['activeTabIndicator']>;
  const anim = (theme.animationStyle || theme.animationSpeed || 'fade') as NonNullable<ThemeSettings['animationStyle']>;
  const surf = (theme.surfaceMode ||
    (theme.surfaceThemeMode === 'dark_slate'
      ? 'dark_elevated'
      : theme.surfaceThemeMode === 'soft_sepia'
      ? 'sepia_warm'
      : 'light')) as NonNullable<ThemeSettings['surfaceMode']>;
  const surfLegacy: NonNullable<ThemeSettings['surfaceThemeMode']> =
    surf === 'dark_elevated'
      ? 'dark_slate'
      : surf === 'sepia_warm'
      ? 'soft_sepia'
      : 'light';

  return {
    ...theme,
    surfaceMode: surf,
    surfaceThemeMode: surfLegacy,
    fontFamily: font,
    webFontFamily: font as ThemeSettings['webFontFamily'],
    headingLetterSpacing: tracking,
    letterSpacingStyle: tracking as ThemeSettings['letterSpacingStyle'],
    lineHeight: lh,
    lineHeightStyle: lh as ThemeSettings['lineHeightStyle'],
    cardStyle: card,
    cardSurfaceStyle: card as ThemeSettings['cardSurfaceStyle'],
    tableStyle: tbl,
    webTableStyle: tbl as ThemeSettings['webTableStyle'],
    bgPattern: pat,
    pagePattern: pat as ThemeSettings['pagePattern'],
    inputStyle: inp,
    inputFieldStyle: inp as ThemeSettings['inputFieldStyle'],
    activeTabIndicator: navInd,
    navActiveIndicator: navInd as ThemeSettings['navActiveIndicator'],
    animationStyle: anim,
    animationSpeed: anim as ThemeSettings['animationSpeed'],
  };
}

export function applyThemeCssVariables(
  theme: ThemeSettings,
  isDeviceDarkOverride?: boolean | null
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const paletteObj = THEME_PALETTES[theme.colorTheme] || THEME_PALETTES.emerald;
  const isDark = isDarkSurfaceMode(theme, isDeviceDarkOverride);

  const rawBaseHex =
    theme.colorTheme === 'custom'
      ? normalizeHex(theme.customPrimaryHex || '#047857')
      : paletteObj.hexPrimary;

  const baseHex =
    theme.accentSaturation === 'minimal'
      ? mixHex(rawBaseHex, '#475569', 0.32)
      : rawBaseHex;

  const rawSecondaryHex =
    theme.colorTheme === 'custom'
      ? normalizeHex(theme.customSecondaryHex || '#0f172a', '#0f172a')
      : paletteObj.hexSecondary || '#0f172a';

  const secondaryHex =
    theme.accentSaturation === 'minimal'
      ? mixHex(rawSecondaryHex, '#334155', 0.25)
      : rawSecondaryHex;

  const hoverHex = mixHex(baseHex, '#000000', 0.16);
  const activeHex = mixHex(baseHex, '#000000', 0.28);

  const textHex = isDark
    ? mixHex(baseHex, '#ffffff', 0.42)
    : mixHex(baseHex, '#000000', 0.08);
  const badgeTextHex = isDark
    ? mixHex(baseHex, '#ffffff', 0.56)
    : mixHex(baseHex, '#000000', 0.24);
  const lightHex = isDark
    ? mixHex(baseHex, '#0f172a', 0.78)
    : theme.accentSaturation === 'minimal'
    ? mixHex(baseHex, '#f8fafc', 0.93)
    : mixHex(baseHex, '#ffffff', 0.91);
  const glowHex = isDark
    ? mixHex(baseHex, '#0f172a', 0.84)
    : mixHex(baseHex, '#ffffff', 0.85);
  const borderHex = isDark
    ? mixHex(baseHex, '#1e293b', 0.52)
    : mixHex(baseHex, '#ffffff', 0.68);

  let pageBg = '#f8fafc';
  const bgStyle = theme.pageBgStyle || 'clean';
  if (theme.customPageBgHex && /^#[0-9a-fA-F]{3,6}$/.test(theme.customPageBgHex.trim())) {
    pageBg = normalizeHex(theme.customPageBgHex, '#f8fafc');
  } else if (bgStyle === 'warm') {
    pageBg = '#fafaf9';
  } else if (bgStyle === 'paper' || bgStyle === 'cream') {
    pageBg = '#fefdf8';
  } else if (bgStyle === 'mint_breeze' || bgStyle === 'sage') {
    pageBg = '#f2fbf7';
  } else if (bgStyle === 'cool_slate' || bgStyle === 'cool_gray') {
    pageBg = '#f1f5f9';
  } else if (bgStyle === 'pure') {
    pageBg = '#ffffff';
  } else if (bgStyle === 'tinted') {
    pageBg = mixHex(baseHex, '#ffffff', 0.93);
  } else if (bgStyle === 'mesh') {
    pageBg = mixHex(baseHex, '#f8fafc', 0.95);
  }

  const surfaceMode = isDark
    ? 'dark_elevated'
    : theme.surfaceMode || theme.surfaceThemeMode || 'light';

  if (surfaceMode === 'sepia_warm' || surfaceMode === 'soft_sepia') {
    pageBg = '#f9f5eb';
  } else if (surfaceMode === 'soft_tinted') {
    pageBg = mixHex(baseHex, '#ffffff', 0.94);
  } else if (surfaceMode === 'slate_dim') {
    pageBg = '#e2e8f0';
  } else if (isDark) {
    pageBg = '#0b1120';
  }

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.setProperty('--brand-primary', baseHex);
  root.style.setProperty('--brand-primary-hover', hoverHex);
  root.style.setProperty('--brand-primary-active', activeHex);
  root.style.setProperty('--brand-primary-text', textHex);
  root.style.setProperty('--brand-badge-text', badgeTextHex);
  root.style.setProperty('--brand-primary-light', lightHex);
  root.style.setProperty('--brand-glow', glowHex);
  root.style.setProperty('--brand-primary-border', borderHex);
  root.style.setProperty('--brand-secondary', secondaryHex);
  root.style.setProperty('--page-bg', pageBg);

  // Typography & Spacing Settings (1G)
  const fontMap: Record<string, string> = {
    jakarta: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    inter: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    poppins: '"Poppins", "Plus Jakarta Sans", system-ui, sans-serif',
    nunito: '"Nunito", "Plus Jakarta Sans", system-ui, sans-serif',
    serif: '"Amiri", Georgia, Cambria, "Times New Roman", Times, serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };
  const bodyFontKey = theme.fontFamily || theme.webFontFamily || 'jakarta';
  const bodyFontStack = fontMap[bodyFontKey] || fontMap.jakarta;
  root.style.setProperty('--web-font-family', bodyFontStack);

  const headingFontKey = theme.headingFontFamily || 'inherit';
  const headingFontStack =
    headingFontKey === 'inherit' ? bodyFontStack : fontMap[headingFontKey] || bodyFontStack;
  root.style.setProperty('--heading-font-family', headingFontStack);

  const scaleMap: Record<string, string> = {
    small: '14.75px',
    normal: '16px',
    large: '17px',
    xlarge: '18px',
  };
  root.style.fontSize = scaleMap[theme.fontScale || 'normal'] || '16px';

  const trackingMap: Record<string, string> = {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
  };
  const trackingKey = theme.headingLetterSpacing || theme.letterSpacingStyle || 'tight';
  root.style.setProperty('--web-letter-spacing', trackingMap[trackingKey] || '-0.015em');

  const lineHeightMap: Record<string, string> = {
    tight: '1.35',
    snug: '1.35',
    normal: '1.5',
    relaxed: '1.68',
  };
  const lineHeightKey = theme.lineHeight || theme.lineHeightStyle || 'normal';
  root.style.setProperty('--web-line-height', lineHeightMap[lineHeightKey] || '1.5');

  // Set comprehensive HTML data attributes for live CSS styling (1B - 1H)
  root.setAttribute('data-surface-mode', surfaceMode);
  root.setAttribute('data-page-bg-style', bgStyle);
  root.setAttribute('data-page-pattern', theme.bgPattern || theme.pagePattern || 'none');
  root.setAttribute('data-scrollbar-style', theme.scrollbarStyle || 'default');

  root.setAttribute('data-card-style', theme.cardStyle || theme.cardSurfaceStyle || 'bordered');
  root.setAttribute('data-card-accent', theme.cardAccentBar || 'none');
  root.setAttribute('data-card-hover', theme.cardHoverEffect || 'lift');
  root.setAttribute('data-shadow-intensity', theme.shadowIntensity || 'subtle');
  root.setAttribute('data-border-width', theme.borderWidth || 'normal');
  root.setAttribute('data-border-contrast', theme.borderContrast || 'normal');
  root.setAttribute('data-border-radius', theme.borderRadius || 'modern');

  root.setAttribute('data-table-style', theme.tableStyle || theme.webTableStyle || 'clean');
  root.setAttribute('data-hero-style', theme.heroBannerStyle || 'gradient_brand');
  root.setAttribute('data-stats-style', theme.statsCardStyle || 'modern_elevated');
  root.setAttribute('data-button-style', theme.buttonStyle || 'solid');
  root.setAttribute('data-input-style', theme.inputStyle || theme.inputFieldStyle || 'outlined');
  root.setAttribute('data-badge-style', theme.badgeStyle || 'soft');
  root.setAttribute('data-modal-backdrop', theme.modalBackdropStyle || 'blur_dark');

  root.setAttribute(
    'data-nav-indicator',
    theme.activeTabIndicator || theme.navActiveIndicator || 'pill'
  );
  root.setAttribute('data-section-spacing', theme.sectionSpacing || 'normal');
  root.setAttribute('data-heading-weight', theme.headingWeight || 'bold');
  root.setAttribute('data-heading-tracking', trackingKey);

  root.setAttribute('data-animation-style', theme.animationStyle || theme.animationSpeed || 'fade');
  root.setAttribute(
    'data-table-hover',
    theme.tableRowHoverHighlight !== false ? 'true' : 'false'
  );
  root.setAttribute(
    'data-glassmorphism',
    theme.enableGlassmorphism !== false ? 'true' : 'false'
  );
  root.setAttribute(
    'data-animated-gradients',
    theme.enableAnimatedGradients ? 'true' : 'false'
  );
  root.setAttribute(
    'data-high-contrast-text',
    theme.highContrastText ? 'true' : 'false'
  );
  root.setAttribute(
    'data-compact-mobile-nav',
    theme.compactMobileNav ? 'true' : 'false'
  );

  // Inject or update custom CSS snippet from Superadmin
  const customStyleId = 'superadmin-custom-web-css';
  let customStyleEl = document.getElementById(customStyleId) as HTMLStyleElement | null;
  const snippet = (theme.customCssSnippet || '').trim();
  if (snippet) {
    if (!customStyleEl) {
      customStyleEl = document.createElement('style');
      customStyleEl.id = customStyleId;
      document.head.appendChild(customStyleEl);
    }
    customStyleEl.textContent = snippet;
  } else if (customStyleEl) {
    customStyleEl.textContent = '';
  }

  // Keep browser toolbar theme-color and favicon in sync with active theme & logo
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', baseHex);
  }
}

export interface ReportThemeStyles {
  primaryHex: string;
  lightBgHex: string;
  borderHex: string;
  textHex: string;
  borderStyle: ReportBorderStyle;
  customFrameConfig?: CustomPdfFrameConfig;
  headerStyle: 'dual_logo' | 'left_logo' | 'centered' | 'split';
  showLeftLogo: boolean;
  showRightLogo: boolean;
  logoSize: 'sm' | 'md' | 'lg';
  logoShape: 'clean' | 'rounded' | 'circle' | 'bordered';
  kopDividerStyle: 'double' | 'single' | 'triple' | 'accent';
  fontStyle: 'serif' | 'sans' | 'poppins' | 'classic' | 'modern';
  fontSize: 'sm' | 'md' | 'lg';
  tableStyle: 'tinted' | 'striped' | 'clean' | 'bold_grid' | 'bordered_bold';
  rowDensity: 'tight' | 'compact' | 'normal' | 'relaxed';
  paperSize: 'A4' | 'F4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginSize: 'none' | 'narrow' | 'normal' | 'wide';
  pdfQuality: 'standard' | 'high' | 'ultra';
  singlePageFit: boolean;
  watermarkOpacity: 'subtle' | 'medium' | 'strong';
  showWatermark: boolean;
  showBismillah: boolean;
  showRank: boolean;
  showTahfidz: boolean;
  showAttitude: boolean;
  showEkskul: boolean;
  showAttendance: boolean;
  showKkm: boolean;
  showPredicate: boolean;
  showTerbilang: boolean;
  showTeacherNotes: boolean;
  showParentSignature: boolean;
  showClassTeacherSignature: boolean;
  showHeadmasterSignature: boolean;
  showSeal: boolean;
  signatureHeight: 'compact' | 'normal' | 'spacious';
  showFooterMeta: boolean;
}

export function getReportThemeStyles(theme: ThemeSettings): ReportThemeStyles {
  const reportColor = theme.reportThemeColor || theme.colorTheme || 'emerald';
  let primaryHex = '#047857';

  if (reportColor === 'classic_black') {
    primaryHex = '#0f172a';
  } else if (reportColor === 'custom') {
    primaryHex = normalizeHex(
      theme.reportCustomHex || theme.customPrimaryHex || '#047857',
      '#047857'
    );
  } else {
    primaryHex = THEME_PALETTES[reportColor]?.hexPrimary || '#047857';
  }

  // Default to dual_logo (left & right kop logos) unless explicitly set to another layout
  const rawHeader = theme.reportHeaderStyle;
  const resolvedHeaderStyle: ReportThemeStyles['headerStyle'] =
    rawHeader === 'centered' || rawHeader === 'split'
      ? rawHeader
      : rawHeader === 'left_logo' && theme.reportShowRightLogo === false
      ? 'left_logo'
      : 'dual_logo';

  return {
    primaryHex,
    lightBgHex: mixHex(primaryHex, '#ffffff', 0.91),
    borderHex: mixHex(primaryHex, '#ffffff', 0.65),
    textHex: mixHex(primaryHex, '#000000', 0.25),
    borderStyle: theme.reportBorderStyle || 'double',
    customFrameConfig: theme.customFrameConfig,
    headerStyle: resolvedHeaderStyle,
    showLeftLogo: theme.reportShowLeftLogo !== false,
    showRightLogo:
      resolvedHeaderStyle === 'dual_logo' ? theme.reportShowRightLogo !== false : Boolean(theme.reportShowRightLogo),
    logoSize: theme.reportLogoSize || 'md',
    logoShape: theme.reportLogoShape || 'rounded',
    kopDividerStyle: theme.reportKopDividerStyle || 'double',
    fontStyle: theme.reportFontStyle || 'sans',
    fontSize: theme.reportFontSize || 'md',
    tableStyle: theme.reportTableStyle || 'tinted',
    rowDensity: theme.reportRowDensity || 'compact',
    paperSize: theme.reportPaperSize || 'A4',
    orientation: theme.reportOrientation || 'portrait',
    marginSize: theme.reportMarginSize || 'narrow',
    pdfQuality: theme.reportPdfQuality || 'high',
    singlePageFit: theme.reportSinglePageFit !== false,
    watermarkOpacity: theme.reportWatermarkOpacity || 'subtle',
    showWatermark: theme.reportShowWatermark !== false,
    showBismillah: theme.reportShowBismillah !== false,
    showRank: theme.reportShowRank !== false,
    showTahfidz: theme.reportShowTahfidz !== false,
    showAttitude: theme.reportShowAttitude !== false,
    showEkskul: theme.reportShowEkskul !== false,
    showAttendance: theme.reportShowAttendance !== false,
    showKkm: theme.reportShowKkm !== false,
    showPredicate: theme.reportShowPredicate !== false,
    showTerbilang: theme.reportShowTerbilang !== false,
    showTeacherNotes: theme.reportShowTeacherNotes !== false,
    showParentSignature: theme.reportShowParentSignature !== false,
    showClassTeacherSignature: theme.reportShowClassTeacherSignature !== false,
    showHeadmasterSignature: theme.reportShowHeadmasterSignature !== false,
    showSeal: theme.reportShowSeal !== false,
    signatureHeight: theme.reportSignatureHeight || 'normal',
    showFooterMeta: theme.reportShowFooterMeta !== false,
  };
}

export async function compressImageFileToDataUrl(
  file: File,
  maxDim = 280,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      if (file.type === 'image/svg+xml' || rawDataUrl.length < 65000) {
        resolve(rawDataUrl);
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const pngData = canvas.toDataURL('image/png');
        if (pngData.length <= 95000) {
          resolve(pngData);
        } else {
          resolve(canvas.toDataURL('image/webp', quality));
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function getThemeClasses(theme: ThemeSettings): ThemeClasses {
  return THEME_PALETTES[theme.colorTheme]?.classes || THEME_PALETTES.emerald.classes;
}

export function getHeaderStyles(
  theme: ThemeSettings,
  palette: ThemeClasses,
  isDeviceDarkOverride?: boolean | null
): {
  wrapper: string;
  brandText: string;
  subText: string;
  navActive: string;
  navInactive: string;
  iconBg: string;
} {
  const isDarkSurface = isDarkSurfaceMode(theme, isDeviceDarkOverride);
  const effectiveHeaderStyle =
    isDarkSurface &&
    (!theme.headerStyle ||
      theme.headerStyle === 'light' ||
      theme.headerStyle === 'glass' ||
      theme.headerStyle === 'minimal' ||
      theme.headerStyle === 'minimal_border')
      ? 'dark'
      : theme.headerStyle;

  switch (effectiveHeaderStyle) {
    case 'dark':
      return {
        wrapper: 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm',
        brandText: 'text-slate-100',
        subText: 'text-slate-400',
        navActive: `${palette.primary} text-white font-bold shadow-xs nav-active-item`,
        navInactive: 'text-slate-400 hover:text-white hover:bg-slate-800/80',
        iconBg: 'bg-slate-800 ring-1 ring-slate-700',
      };
    case 'gradient':
      return {
        wrapper: `${palette.gradientHeader} border-b ${palette.primaryBorder} text-white shadow-sm`,
        brandText: 'text-white',
        subText: 'text-white/80',
        navActive: 'bg-white/20 text-white ring-1 ring-white/30 font-bold backdrop-blur-xs nav-active-item',
        navInactive: 'text-white/85 hover:text-white hover:bg-white/10',
        iconBg: 'bg-white/20 ring-1 ring-white/30',
      };
    case 'colored':
    case 'brand':
      return {
        wrapper: `${palette.primary} border-b ${palette.primaryBorder} text-white shadow-sm`,
        brandText: 'text-white',
        subText: 'text-white/80',
        navActive: 'bg-black/20 text-white ring-1 ring-white/20 font-bold nav-active-item',
        navInactive: 'text-white/85 hover:text-white hover:bg-black/10',
        iconBg: 'bg-white/20 ring-1 ring-white/30',
      };
    case 'glass':
      return {
        wrapper: 'bg-white/70 backdrop-blur-xl border-b border-slate-200/70 text-slate-900 shadow-2xs',
        brandText: 'text-slate-900',
        subText: palette.primaryText,
        navActive: `${palette.tabActive} ring-1 ring-slate-200 font-bold nav-active-item`,
        navInactive: 'text-slate-600 hover:text-slate-900 hover:bg-white/60',
        iconBg: 'bg-slate-50 ring-1 ring-slate-200',
      };
    case 'minimal_border':
    case 'minimal':
      return {
        wrapper: 'bg-white border-b-[3px] border-brand-custom text-slate-900 shadow-2xs',
        brandText: 'text-slate-900',
        subText: palette.primaryText,
        navActive: `${palette.tabActive} ring-1 ring-slate-200 font-bold nav-active-item`,
        navInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        iconBg: 'bg-white ring-1 ring-slate-200',
      };
    case 'light':
    default:
      return {
        wrapper: 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-2xs',
        brandText: 'text-slate-900',
        subText: palette.primaryText,
        navActive: `${palette.tabActive} ring-1 ring-slate-200 font-bold nav-active-item`,
        navInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
        iconBg: 'bg-slate-50 ring-1 ring-slate-200',
      };
  }
}

export function getSidebarStyles(
  theme: ThemeSettings,
  palette: ThemeClasses,
  isDeviceDarkOverride?: boolean | null
): {
  aside: string;
  headerBorder: string;
  brandText: string;
  subText: string;
  sectionTitle: string;
  itemActive: string;
  itemInactive: string;
  profileBg: string;
} {
  const isDarkSurface = isDarkSurfaceMode(theme, isDeviceDarkOverride);
  const effectiveSidebarStyle =
    isDarkSurface &&
    (!theme.sidebarStyle ||
      theme.sidebarStyle === 'light' ||
      theme.sidebarStyle === 'glass' ||
      theme.sidebarStyle === 'tinted' ||
      theme.sidebarStyle === 'bordered_clean')
      ? 'dark'
      : theme.sidebarStyle;

  switch (effectiveSidebarStyle) {
    case 'dark':
      return {
        aside: 'bg-slate-900/95 backdrop-blur-md border-r border-slate-800 text-slate-100',
        headerBorder: 'border-slate-800',
        brandText: 'text-slate-100',
        subText: 'text-slate-400',
        sectionTitle: 'text-slate-500',
        itemActive: `${palette.primary} text-white shadow-xs font-bold nav-active-item`,
        itemInactive: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/75 font-medium',
        profileBg: 'bg-slate-950/70 border-slate-800 text-slate-200',
      };
    case 'gradient':
      return {
        aside: `${palette.gradientHeader} border-r border-black/20 text-white`,
        headerBorder: 'border-white/15',
        brandText: 'text-white',
        subText: 'text-white/75',
        sectionTitle: 'text-white/60',
        itemActive: 'bg-white/20 text-white ring-1 ring-white/30 font-bold shadow-xs nav-active-item',
        itemInactive: 'text-white/80 hover:text-white hover:bg-white/10 font-medium',
        profileBg: 'bg-black/20 border-white/15 text-white',
      };
    case 'colored':
    case 'brand':
      return {
        aside: 'bg-slate-900 border-r border-slate-800 text-white',
        headerBorder: 'border-slate-800',
        brandText: 'text-white',
        subText: 'text-slate-300',
        sectionTitle: 'text-slate-400',
        itemActive: `${palette.primary} text-white shadow-xs font-bold nav-active-item`,
        itemInactive: 'text-slate-300 hover:text-white hover:bg-slate-800 font-medium',
        profileBg: 'bg-slate-950/60 border-slate-800 text-white',
      };
    case 'tinted':
      return {
        aside: `${palette.primaryLightBg} border-r ${palette.primaryBorder} text-slate-800`,
        headerBorder: palette.primaryBorder,
        brandText: 'text-slate-900',
        subText: palette.primaryText,
        sectionTitle: 'text-slate-500',
        itemActive: `${palette.primary} text-white shadow-xs font-bold nav-active-item`,
        itemInactive: 'text-slate-700 hover:text-slate-900 hover:bg-white/70 font-medium',
        profileBg: 'bg-white/80 border-slate-200 text-slate-800',
      };
    case 'bordered_clean':
      return {
        aside: 'bg-white border-r-[3px] border-brand-custom text-slate-800 shadow-xs',
        headerBorder: 'border-slate-200',
        brandText: 'text-slate-900',
        subText: palette.primaryText,
        sectionTitle: 'text-slate-500',
        itemActive: `${palette.sidebarActive} shadow-xs ring-1 ${palette.primaryBorder} nav-active-item`,
        itemInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium',
        profileBg: 'bg-slate-50 border-slate-200 text-slate-800',
      };
    case 'glass':
      return {
        aside: 'bg-white/75 backdrop-blur-xl border-r border-slate-200/80 text-slate-800',
        headerBorder: 'border-slate-200/60',
        brandText: 'text-slate-900',
        subText: 'text-slate-500',
        sectionTitle: 'text-slate-400',
        itemActive: `${palette.sidebarActive} shadow-xs ring-1 ${palette.primaryBorder} nav-active-item`,
        itemInactive: 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-medium',
        profileBg: 'bg-white/80 border-slate-200/70 text-slate-800',
      };
    case 'light':
    default:
      return {
        aside: 'bg-white border-r border-slate-200 text-slate-800',
        headerBorder: 'border-slate-100',
        brandText: 'text-slate-900',
        subText: 'text-slate-500',
        sectionTitle: 'text-slate-400',
        itemActive: `${palette.sidebarActive} shadow-xs ring-1 ${palette.primaryBorder} nav-active-item`,
        itemInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium',
        profileBg: 'bg-slate-50/70 border-slate-100 text-slate-800',
      };
  }
}

export function getRadiusClass(radius: ThemeSettings['borderRadius']): {
  card: string;
  button: string;
  input: string;
} {
  switch (radius) {
    case 'sharp':
      return { card: 'rounded-none', button: 'rounded-none', input: 'rounded-none' };
    case 'subtle':
      return { card: 'rounded-lg', button: 'rounded-md', input: 'rounded-md' };
    case 'rounded':
      return { card: 'rounded-3xl', button: 'rounded-2xl', input: 'rounded-xl' };
    case 'pill':
      return { card: 'rounded-3xl', button: 'rounded-full', input: 'rounded-2xl' };
    case 'modern':
    default:
      return { card: 'rounded-2xl', button: 'rounded-xl', input: 'rounded-xl' };
  }
}

function integerToWordsId(n: number): string {
  const words = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];
  const val = Math.floor(Math.abs(n));
  if (val === 0) return 'Nol';
  if (val < 12) return words[val];
  if (val < 20) return `${integerToWordsId(val - 10)} Belas`;
  if (val < 100) {
    const tens = Math.floor(val / 10);
    const rem = val % 10;
    return `${words[tens]} Puluh${rem > 0 ? ' ' + words[rem] : ''}`;
  }
  if (val === 100) return 'Seratus';
  if (val < 200) return `Seratus ${integerToWordsId(val - 100)}`;
  if (val < 1000) {
    const hundreds = Math.floor(val / 100);
    const rem = val % 100;
    return `${words[hundreds]} Ratus${rem > 0 ? ' ' + integerToWordsId(rem) : ''}`;
  }
  return String(val);
}

/**
 * Converts a numeric grade (e.g., 85 or 82.5) into Indonesian words ("Delapan Puluh Lima", "Delapan Puluh Dua Koma Lima")
 */
export function angkaTerbilang(score: number | string): string {
  const num = typeof score === 'number' ? score : parseFloat(String(score));
  if (isNaN(num)) return '-';
  const rounded = Math.round(num * 10) / 10;
  const intPart = Math.floor(rounded);
  const decDigit = Math.round((rounded - intPart) * 10);

  const baseWords = integerToWordsId(intPart);
  if (decDigit > 0) {
    return `${baseWords} Koma ${integerToWordsId(decDigit)}`;
  }
  return baseWords;
}
