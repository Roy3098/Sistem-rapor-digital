import {
  ThemeColor,
  ThemeSettings,
  ReportBorderStyle,
  CustomPdfFrameConfig,
  GradeThresholds,
  HeroBannerStyle,
  StatsCardStyle,
} from '../types';

export type HeroStyleCategory = 'islami' | 'modern' | 'spektakuler' | 'terang';

export interface HeroStyleMeta {
  id: HeroBannerStyle;
  name: string;
  shortName: string;
  category: HeroStyleCategory;
  badge: string;
  description: string;
  previewBg: string;
  previewBorder: string;
  previewAccent: string;
  previewText: string;
  isLight: boolean;
}

export const HERO_STYLES_CATALOG: HeroStyleMeta[] = [
  {
    id: 'gradient_brand',
    name: 'Gradasi Warna Tema',
    shortName: 'Gradasi Tema',
    category: 'modern',
    badge: 'Standar',
    description: 'Gradasi dinamis mengikuti warna utama institusi.',
    previewBg: 'linear-gradient(135deg, var(--brand-primary, #047857) 0%, var(--brand-secondary, #022c22) 100%)',
    previewBorder: 'rgba(255,255,255,0.22)',
    previewAccent: '#ffffff',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'royal_emerald',
    name: 'Zamrud Eksklusif Emas',
    shortName: 'Zamrud Emas',
    category: 'islami',
    badge: 'Mewah',
    description: 'Zamrud pekat berbingkai emas & bintang Rub el Hizb.',
    previewBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 55%, #042f2e 100%)',
    previewBorder: 'rgba(251, 191, 36, 0.55)',
    previewAccent: '#fbbf24',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'nabawi_medina',
    name: 'Hijau Kubah Nabawi Madinah',
    shortName: 'Kubah Nabawi',
    category: 'islami',
    badge: 'Madinah',
    description: 'Hijau Raudhah & Kubah Nabawi dengan ornamen payung pelataran emas.',
    previewBg: 'linear-gradient(135deg, #033a28 0%, #056947 52%, #022c22 100%)',
    previewBorder: 'rgba(253, 224, 71, 0.5)',
    previewAccent: '#fde047',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'kaaba_kiswah',
    name: 'Kiswah Hitam Emas Makkah',
    shortName: 'Kiswah Makkah',
    category: 'islami',
    badge: 'Makkah',
    description: 'Hitam beludru pekat berhias sabuk sulaman emas Kiswah yang khidmat.',
    previewBg: 'linear-gradient(135deg, #09090b 0%, #18181b 55%, #1c1917 100%)',
    previewBorder: 'rgba(245, 158, 11, 0.7)',
    previewAccent: '#f59e0b',
    previewText: '#fef3c7',
    isLight: false,
  },
  {
    id: 'islamic_calligraphy',
    name: 'Kaligrafi Arabesque',
    shortName: 'Kaligrafi',
    category: 'islami',
    badge: 'Tradisi',
    description: 'Nuansa hijau pesantren dengan kaligrafi Bismillah.',
    previewBg: 'linear-gradient(135deg, #062c20 0%, #0f4d3d 55%, #0d3b32 100%)',
    previewBorder: 'rgba(52, 211, 153, 0.45)',
    previewAccent: '#6ee7b7',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'islamic_arch',
    name: 'Kubah Mihrab Islami',
    shortName: 'Mihrab Islami',
    category: 'islami',
    badge: 'Arsitektur',
    description: 'Siluet lengkung mihrab masjid & lentera geometris.',
    previewBg: 'linear-gradient(135deg, #022c22 0%, #0f172a 55%, #042f2e 100%)',
    previewBorder: 'rgba(16, 185, 129, 0.4)',
    previewAccent: '#34d399',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'geometric_mosaic',
    name: 'Mosaik Geometri Emas',
    shortName: 'Mosaik Kufi',
    category: 'islami',
    badge: 'Geometris',
    description: 'Ornamen bintang oktagonal Kufi emas di atas slate.',
    previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1c1917 100%)',
    previewBorder: 'rgba(245, 158, 11, 0.45)',
    previewAccent: '#fbbf24',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'andalusia_alhambra',
    name: 'Istana Alhambra Andalusia',
    shortName: 'Alhambra',
    category: 'islami',
    badge: 'Andalusia',
    description: 'Terakota marmer Cordoba & lengkung muqarnas emas hangat.',
    previewBg: 'linear-gradient(135deg, #431407 0%, #7c2d12 52%, #451a03 100%)',
    previewBorder: 'rgba(251, 191, 36, 0.5)',
    previewAccent: '#fcd34d',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'ottoman_iznik',
    name: 'Keramik Iznik Turki Usmani',
    shortName: 'Iznik Usmani',
    category: 'islami',
    badge: 'Turki',
    description: 'Biru kobalt & pirus keramik Iznik dengan motif bunga klasik.',
    previewBg: 'linear-gradient(135deg, #172554 0%, #0369a1 55%, #0f766e 100%)',
    previewBorder: 'rgba(56, 189, 248, 0.5)',
    previewAccent: '#7dd3fc',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'moroccan_zellige',
    name: 'Zellige Maroko Al-Qarawiyyin',
    shortName: 'Zellige Maroko',
    category: 'islami',
    badge: 'Maroko',
    description: 'Mosaik geometris Zellige zamrud-safir khas madrasah Fes.',
    previewBg: 'linear-gradient(135deg, #042f2e 0%, #115e59 50%, #1e3a8a 100%)',
    previewBorder: 'rgba(45, 212, 191, 0.5)',
    previewAccent: '#5eead4',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'nusantara_batik',
    name: 'Batik Santri Nusantara',
    shortName: 'Batik Sogan',
    category: 'islami',
    badge: 'Nusantara',
    description: 'Cokelat sogan keraton & zamrud dengan motif kawung pesantren.',
    previewBg: 'linear-gradient(135deg, #27170e 0%, #452715 52%, #143627 100%)',
    previewBorder: 'rgba(217, 119, 6, 0.55)',
    previewAccent: '#fbbf24',
    previewText: '#fef3c7',
    isLight: false,
  },
  {
    id: 'golden_minaret',
    name: 'Menara Emas Fajar',
    shortName: 'Menara Fajar',
    category: 'islami',
    badge: 'Fajar',
    description: 'Langit fajar keemasan dengan siluet kubah menara & bulan sabit.',
    previewBg: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 48%, #b45309 100%)',
    previewBorder: 'rgba(251, 191, 36, 0.5)',
    previewAccent: '#fde68a',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'pastel_mint',
    name: 'Mint Sejuk Pesantren',
    shortName: 'Pastel Mint',
    category: 'terang',
    badge: 'Sejuk',
    description: 'Gradasi hijau mint lembut yang teduh & ramah mata.',
    previewBg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 55%, #ccfbf1 100%)',
    previewBorder: '#6ee7b7',
    previewAccent: '#047857',
    previewText: '#0f172a',
    isLight: true,
  },
  {
    id: 'light_clean',
    name: 'Terang Bersih Minimalis',
    shortName: 'Putih Bersih',
    category: 'terang',
    badge: 'Minimalis',
    description: 'Permukaan putih bersih dengan kontras tipografi tajam.',
    previewBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    previewBorder: '#cbd5e1',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
    isLight: true,
  },
  {
    id: 'ivory_gold_leaf',
    name: 'Gading Kertas Emas',
    shortName: 'Gading Emas',
    category: 'terang',
    badge: 'Ningrat',
    description: 'Latar gading terang mewah dengan bingkai garis emas halus.',
    previewBg: 'linear-gradient(135deg, #fffdf7 0%, #fef9e7 55%, #fef3c7 100%)',
    previewBorder: '#d97706',
    previewAccent: '#b45309',
    previewText: '#1c1917',
    isLight: true,
  },
  {
    id: 'sakura_dawn',
    name: 'Embun Pagi Rose Quartz',
    shortName: 'Embun Rose',
    category: 'terang',
    badge: 'Lembut',
    description: 'Gradasi putih ke rose quartz & krem hangat yang menenangkan.',
    previewBg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fef3c7 100%)',
    previewBorder: '#fda4af',
    previewAccent: '#be123c',
    previewText: '#1e293b',
    isLight: true,
  },
  {
    id: 'glass_modern',
    name: 'Kaca Transparan Modern',
    shortName: 'Glass Modern',
    category: 'modern',
    badge: 'Frosted',
    description: 'Panel kaca buram (glassmorphism) berbingkai aksen.',
    previewBg: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.88) 100%)',
    previewBorder: 'var(--brand-primary, #047857)',
    previewAccent: 'var(--brand-primary, #047857)',
    previewText: '#0f172a',
    isLight: true,
  },
  {
    id: 'split_accent',
    name: 'Garis Aksen Samping',
    shortName: 'Split Aksen',
    category: 'terang',
    badge: 'Presisi',
    description: 'Kartu terang dengan pita aksen vertikal tegas di kiri.',
    previewBg: 'linear-gradient(90deg, var(--brand-primary, #047857) 0%, var(--brand-primary, #047857) 12%, #ffffff 12%, #f8fafc 100%)',
    previewBorder: '#cbd5e1',
    previewAccent: 'var(--brand-primary, #047857)',
    previewText: '#0f172a',
    isLight: true,
  },
  {
    id: 'editorial_card',
    name: 'Kartu Editorial Serif',
    shortName: 'Editorial',
    category: 'terang',
    badge: 'Jurnal',
    description: 'Tipografi serif akademik dengan bingkai tegas jurnal.',
    previewBg: 'linear-gradient(135deg, #fcfcf9 0%, #f5f5f0 100%)',
    previewBorder: '#1e293b',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
    isLight: true,
  },
  {
    id: 'vintage_parchment',
    name: 'Naskah Kuno Pergamena',
    shortName: 'Pergamena',
    category: 'terang',
    badge: 'Klasik',
    description: 'Kertas kitab klasik hangat bertekstur titik halus.',
    previewBg: 'linear-gradient(135deg, #fdfbf7 0%, #f5eedc 100%)',
    previewBorder: '#c2a878',
    previewAccent: '#78350f',
    previewText: '#292524',
    isLight: true,
  },
  {
    id: 'nordic_frost',
    name: 'Es Nordik Biru Arktik',
    shortName: 'Nordic Frost',
    category: 'terang',
    badge: 'Arktik',
    description: 'Gradasi biru es kristal ke putih perak yang sejuk & fokus.',
    previewBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 55%, #dbeafe 100%)',
    previewBorder: '#7dd3fc',
    previewAccent: '#0369a1',
    previewText: '#0f172a',
    isLight: true,
  },
  {
    id: 'monochrome_swiss',
    name: 'Monokrom Swiss Grid',
    shortName: 'Swiss Grid',
    category: 'terang',
    badge: 'Arsitektural',
    description: 'Gaya tipografi Swiss hitam-putih dengan kisi garis presisi.',
    previewBg: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)',
    previewBorder: '#18181b',
    previewAccent: '#18181b',
    previewText: '#09090b',
    isLight: true,
  },
  {
    id: 'dark_elegant',
    name: 'Gelap Elegan Eksklusif',
    shortName: 'Gelap Elegan',
    category: 'modern',
    badge: 'Eksklusif',
    description: 'Slate obsidian pekat dengan pendaran cahaya halus.',
    previewBg: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e293b 100%)',
    previewBorder: '#334155',
    previewAccent: '#38bdf8',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'velvet_sapphire',
    name: 'Safir Kerajaan Malam',
    shortName: 'Safir Malam',
    category: 'modern',
    badge: 'Safir',
    description: 'Biru safir kerajaan mendalam dengan kilau perak akademik.',
    previewBg: 'linear-gradient(135deg, #0a192f 0%, #172a45 55%, #1e3a8a 100%)',
    previewBorder: 'rgba(96, 165, 250, 0.5)',
    previewAccent: '#93c5fd',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'forest_canopy',
    name: 'Rimbun Hutan Tropis',
    shortName: 'Hutan Pinus',
    category: 'modern',
    badge: 'Alami',
    description: 'Hijau pinus & dedaunan tropis dengan cahaya embun pagi.',
    previewBg: 'linear-gradient(135deg, #052e16 0%, #14532d 55%, #166534 100%)',
    previewBorder: 'rgba(74, 222, 128, 0.45)',
    previewAccent: '#86efac',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'compact_ribbon',
    name: 'Pita Horisontal Ringkas',
    shortName: 'Pita Ringkas',
    category: 'modern',
    badge: 'Ramping',
    description: 'Desain pita horisontal hemat ruang berlencana resmi.',
    previewBg: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    previewBorder: '#475569',
    previewAccent: '#10b981',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'modern_stacked',
    name: 'Diagonal Modern Bertingkat',
    shortName: 'Stacked Indigo',
    category: 'modern',
    badge: 'Modern',
    description: 'Gradasi indigo-slate dengan mahkota garis atas tegas.',
    previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)',
    previewBorder: '#6366f1',
    previewAccent: '#818cf8',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'ocean_breeze',
    name: 'Samudra Azure & Toska',
    shortName: 'Ocean Breeze',
    category: 'modern',
    badge: 'Segar',
    description: 'Gradasi biru samudra ke toska yang jernih & dinamis.',
    previewBg: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 52%, #0d9488 100%)',
    previewBorder: 'rgba(34, 211, 238, 0.45)',
    previewAccent: '#67e8f9',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'aurora_mesh',
    name: 'Aurora Cahaya Spektrum',
    shortName: 'Aurora Mesh',
    category: 'spektakuler',
    badge: 'Aurora',
    description: 'Pendaran spektrum cahaya multi-warna di atas kanvas gelap.',
    previewBg: 'radial-gradient(circle at 20% 20%, #10b981 0%, transparent 55%), radial-gradient(circle at 80% 30%, #6366f1 0%, transparent 55%), #020617',
    previewBorder: 'rgba(99, 102, 241, 0.45)',
    previewAccent: '#a5b4fc',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'cosmic_galaxy',
    name: 'Galaksi Midnight Violet',
    shortName: 'Galaksi',
    category: 'spektakuler',
    badge: 'Kosmik',
    description: 'Langit malam nebula ungu-biru dengan taburan bintang.',
    previewBg: 'radial-gradient(circle at 25% 25%, rgba(168,85,247,0.45) 0%, transparent 50%), linear-gradient(135deg, #090d16 0%, #1e1136 55%, #0f172a 100%)',
    previewBorder: 'rgba(168, 85, 247, 0.5)',
    previewAccent: '#d8b4fe',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'cyber_academic',
    name: 'Neon Cyber Academic',
    shortName: 'Cyber Neon',
    category: 'spektakuler',
    badge: 'Futuristik',
    description: 'Kisi matriks digital siber dengan pendaran neon cyan.',
    previewBg: 'linear-gradient(135deg, #060b16 0%, #0a1428 60%, #082f49 100%)',
    previewBorder: 'rgba(6, 182, 212, 0.55)',
    previewAccent: '#22d3ee',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'sunset_warmth',
    name: 'Lembayung Senja Hangat',
    shortName: 'Senja Hangat',
    category: 'spektakuler',
    badge: 'Hangat',
    description: 'Gradasi ambar emas ke jingga senja yang penuh semangat.',
    previewBg: 'linear-gradient(135deg, #b45309 0%, #9a3412 52%, #451a03 100%)',
    previewBorder: 'rgba(251, 191, 36, 0.45)',
    previewAccent: '#fde68a',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'crimson_luxury',
    name: 'Marun Beludru & Emas',
    shortName: 'Marun Mewah',
    category: 'spektakuler',
    badge: 'Karismatik',
    description: 'Merah delima beludru berpadu ungu mulia nan prestisius.',
    previewBg: 'linear-gradient(135deg, #4c0519 0%, #881337 52%, #3b0764 100%)',
    previewBorder: 'rgba(251, 113, 133, 0.45)',
    previewAccent: '#fda4af',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'royal_amethyst',
    name: 'Kecubung Ungu Sultan',
    shortName: 'Amethyst',
    category: 'spektakuler',
    badge: 'Sultan',
    description: 'Ungu amethyst kerajaan berpadu mahkota emas berkilau.',
    previewBg: 'linear-gradient(135deg, #2e1065 0%, #581c87 52%, #3b0764 100%)',
    previewBorder: 'rgba(250, 204, 21, 0.55)',
    previewAccent: '#facc15',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'lava_obsidian',
    name: 'Obsidian Magma Emas',
    shortName: 'Obsidian Lava',
    category: 'spektakuler',
    badge: 'Dramatis',
    description: 'Batu obsidian gelap dengan pendaran cahaya magma ambar.',
    previewBg: 'radial-gradient(circle at 85% 20%, rgba(249,115,22,0.35) 0%, transparent 50%), linear-gradient(135deg, #0c0a09 0%, #1c1917 58%, #431407 100%)',
    previewBorder: 'rgba(249, 115, 22, 0.55)',
    previewAccent: '#fb923c',
    previewText: '#ffffff',
    isLight: false,
  },
  {
    id: 'holographic_pearl',
    name: 'Mutiara Holografik Pastel',
    shortName: 'Holografik',
    category: 'spektakuler',
    badge: 'Iridescent',
    description: 'Pelangi pastel mutiara (iridescent) lembut nan modern.',
    previewBg: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 48%, #ccfbf1 100%)',
    previewBorder: '#c084fc',
    previewAccent: '#6366f1',
    previewText: '#0f172a',
    isLight: true,
  },
];

export function getHeroStyleMeta(style?: HeroBannerStyle): HeroStyleMeta {
  return (
    HERO_STYLES_CATALOG.find((item) => item.id === (style || 'gradient_brand')) ||
    HERO_STYLES_CATALOG[0]
  );
}

export type StatsStyleCategory = 'modern' | 'islami' | 'eksklusif' | 'kompak';

export interface StatsStyleMeta {
  id: StatsCardStyle;
  name: string;
  shortName: string;
  category: StatsStyleCategory;
  badge: string;
  description: string;
  previewBg: string;
  previewBorder: string;
  previewAccent: string;
  previewText: string;
  isDark?: boolean;
}

export const STATS_STYLES_CATALOG: StatsStyleMeta[] = [
  {
    id: 'modern_elevated',
    name: 'Modern Elevated Standar',
    shortName: 'Modern Elevated',
    category: 'modern',
    badge: 'Standar',
    description: 'Kartu bersih dengan bayangan halus & lencana warna tema.',
    previewBg: '#ffffff',
    previewBorder: '#e2e8f0',
    previewAccent: '#10b981',
    previewText: '#0f172a',
  },
  {
    id: 'floating_card_3d',
    name: '3D Floating Card',
    shortName: '3D Floating',
    category: 'modern',
    badge: 'Populer',
    description: 'Kartu mengambang mewah dengan pita mahkota warna di atas.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'glass_glow',
    name: 'Kaca Transparan Glow',
    shortName: 'Glass Glow',
    category: 'modern',
    badge: 'Frosted',
    description: 'Efek kaca buram dengan garis pendar cahaya di tepi atas.',
    previewBg: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,245,249,0.85))',
    previewBorder: '#94a3b8',
    previewAccent: '#10b981',
    previewText: '#0f172a',
  },
  {
    id: 'aurora_glass',
    name: 'Aurora Spektrum Glass',
    shortName: 'Aurora Glass',
    category: 'modern',
    badge: 'Spektrum',
    description: 'Kartu kaca modern dengan bola cahaya gradien halus di sudut.',
    previewBg: 'radial-gradient(circle at 90% 15%, rgba(16,185,129,0.22), transparent 55%), #ffffff',
    previewBorder: '#a7f3d0',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'gradient_accent',
    name: 'Soft Gradient Accent',
    shortName: 'Soft Gradient',
    category: 'modern',
    badge: 'Lembut',
    description: 'Gradasi lembut dari putih ke rona warna tema.',
    previewBg: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
    previewBorder: '#a7f3d0',
    previewAccent: '#047857',
    previewText: '#065f46',
  },
  {
    id: 'pastel_soft_tint',
    name: 'Pastel Warna-Warni Lembut',
    shortName: 'Pastel Tint',
    category: 'modern',
    badge: 'Cerah',
    description: 'Setiap kartu metrik memiliki warna pastel lembut tersendiri.',
    previewBg: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 55%, #fffbeb 100%)',
    previewBorder: '#93c5fd',
    previewAccent: '#2563eb',
    previewText: '#1e3a8a',
  },
  {
    id: 'soft_neumorphic',
    name: 'Soft Neumorphic Tactile',
    shortName: 'Neumorphic',
    category: 'modern',
    badge: 'Timbul',
    description: 'Efek bantal timbul halus dengan highlight dalam.',
    previewBg: '#f8fafc',
    previewBorder: '#e2e8f0',
    previewAccent: '#334155',
    previewText: '#0f172a',
  },
  {
    id: 'watermark_icon',
    name: 'Watermark Ikon Raksasa',
    shortName: 'Watermark Ikon',
    category: 'modern',
    badge: 'Visual',
    description: 'Siluet ikon dekoratif raksasa transparan di latar sudut kanan.',
    previewBg: '#ffffff',
    previewBorder: '#e2e8f0',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'islamic_mihrab',
    name: 'Mihrab Emas Pesantren',
    shortName: 'Mihrab Emas',
    category: 'islami',
    badge: 'Pesantren',
    description: 'Kartu berornamen lengkung mihrab & bintang Rub el Hizb.',
    previewBg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    previewBorder: '#d97706',
    previewAccent: '#047857',
    previewText: '#064e3b',
  },
  {
    id: 'royal_gold_border',
    name: 'Bingkai Emas Kerajaan',
    shortName: 'Bingkai Emas',
    category: 'islami',
    badge: 'Mewah',
    description: 'Bingkai ganda emas mewah dengan mahkota sudut & lencana ambar.',
    previewBg: 'linear-gradient(135deg, #fffdf7 0%, #fef3c7 100%)',
    previewBorder: '#f59e0b',
    previewAccent: '#b45309',
    previewText: '#451a03',
  },
  {
    id: 'kiswah_dark_gold',
    name: 'Kiswah Hitam Sulam Emas',
    shortName: 'Kiswah Emas',
    category: 'islami',
    badge: 'Makkah',
    description: 'Kartu hitam beludru dengan sabuk sulaman emas Kiswah.',
    previewBg: 'linear-gradient(135deg, #09090b 0%, #1c1917 100%)',
    previewBorder: '#f59e0b',
    previewAccent: '#fbbf24',
    previewText: '#fef3c7',
    isDark: true,
  },
  {
    id: 'turats_parchment',
    name: 'Kitab Turats Pergamena',
    shortName: 'Kitab Turats',
    category: 'islami',
    badge: 'Klasik',
    description: 'Kertas naskah turats krem hangat dengan garis ganda klasik.',
    previewBg: 'linear-gradient(135deg, #fdfbf7 0%, #f5eedc 100%)',
    previewBorder: '#c2a878',
    previewAccent: '#78350f',
    previewText: '#292524',
  },
  {
    id: 'top_arch_crown',
    name: 'Mahkota Kubah Atas',
    shortName: 'Mahkota Kubah',
    category: 'islami',
    badge: 'Kubah',
    description: 'Pita mahkota melengkung di bagian atas dengan lencana ikon.',
    previewBg: '#ffffff',
    previewBorder: '#10b981',
    previewAccent: '#047857',
    previewText: '#0f172a',
  },
  {
    id: 'split_metric',
    name: 'Split Duotone Header',
    shortName: 'Split Header',
    category: 'eksklusif',
    badge: 'Duotone',
    description: 'Bagian kepala berwarna penuh berpadu badan kartu bersih.',
    previewBg: 'linear-gradient(180deg, #059669 0%, #059669 38%, #ffffff 38%, #ffffff 100%)',
    previewBorder: '#cbd5e1',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'bold_solid_vivid',
    name: 'Blok Warna Solid Penuh',
    shortName: 'Vivid Solid',
    category: 'eksklusif',
    badge: 'Kontras',
    description: 'Kartu blok warna solid/gradasi penuh dengan teks putih tajam.',
    previewBg: 'linear-gradient(135deg, #047857 0%, #0d9488 100%)',
    previewBorder: 'rgba(255,255,255,0.25)',
    previewAccent: '#ffffff',
    previewText: '#ffffff',
    isDark: true,
  },
  {
    id: 'dark_oled_glow',
    name: 'Dark OLED Neon Glow',
    shortName: 'OLED Glow',
    category: 'eksklusif',
    badge: 'OLED',
    description: 'Hitam pekat OLED dengan titik indikator bercahaya neon.',
    previewBg: '#020617',
    previewBorder: '#1e293b',
    previewAccent: '#22d3ee',
    previewText: '#ffffff',
    isDark: true,
  },
  {
    id: 'cyber_matrix',
    name: 'Cyber Matrix Digital',
    shortName: 'Cyber Matrix',
    category: 'eksklusif',
    badge: 'Siber',
    description: 'Kanvas siber berpola kisi matriks dengan siku sudut neon.',
    previewBg: 'linear-gradient(135deg, #060b16 0%, #082f49 100%)',
    previewBorder: '#06b6d4',
    previewAccent: '#22d3ee',
    previewText: '#ecfeff',
    isDark: true,
  },
  {
    id: 'neo_brutalist',
    name: 'Neo-Brutalist 3D Retro',
    shortName: 'Neo-Brutalist',
    category: 'eksklusif',
    badge: 'Tegas',
    description: 'Garis tepi hitam tebal dengan bayangan blok 3D tajam.',
    previewBg: '#ffffff',
    previewBorder: '#0f172a',
    previewAccent: '#fbbf24',
    previewText: '#0f172a',
  },
  {
    id: 'editorial_serif',
    name: 'Jurnal Editorial Serif',
    shortName: 'Jurnal Serif',
    category: 'eksklusif',
    badge: 'Akademik',
    description: 'Gaya jurnal ilmiah dengan angka serif besar & garis indeks.',
    previewBg: '#fcfcf9',
    previewBorder: '#1e293b',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
  },
  {
    id: 'stacked_deck',
    name: 'Tumpukan Kartu Berlapis',
    shortName: 'Stacked Deck',
    category: 'eksklusif',
    badge: 'Berlapis',
    description: 'Efek tumpukan kartu kertas bertingkat di bagian bawah.',
    previewBg: '#ffffff',
    previewBorder: '#94a3b8',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'ribbon_badge',
    name: 'Ribbon Corner Badge',
    shortName: 'Pita Sudut',
    category: 'eksklusif',
    badge: 'Pita',
    description: 'Pita lencana menyilang di sudut kanan atas kartu.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'ticket_perforated',
    name: 'Kupon Tiket Sertifikat',
    shortName: 'Kupon Tiket',
    category: 'eksklusif',
    badge: 'Unik',
    description: 'Desain tiket berlekuk di sisi samping dengan garis putus-putus.',
    previewBg: '#ffffff',
    previewBorder: '#94a3b8',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'kpi_target_gauge',
    name: 'KPI Target & Progres Bar',
    shortName: 'KPI Progres',
    category: 'kompak',
    badge: 'Meteran',
    description: 'Dilengkapi batang indikator persentase capaian target.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#10b981',
    previewText: '#0f172a',
  },
  {
    id: 'bento_compact',
    name: 'Bento Box Grid Kompak',
    shortName: 'Bento Grid',
    category: 'kompak',
    badge: 'Bento',
    description: 'Kotak bento abu-abu lembut yang ringkas & terstruktur.',
    previewBg: '#f8fafc',
    previewBorder: '#cbd5e1',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
  },
  {
    id: 'swiss_grid_mono',
    name: 'Swiss Grid Arsitektural',
    shortName: 'Swiss Grid',
    category: 'kompak',
    badge: 'Presisi',
    description: 'Kotak kisi teknis dengan pembatas sel vertikal & horisontal.',
    previewBg: '#ffffff',
    previewBorder: '#334155',
    previewAccent: '#0f172a',
    previewText: '#0f172a',
  },
  {
    id: 'minimal_bordered',
    name: 'Minimal Garis Aksen Kiri',
    shortName: 'Aksen Kiri',
    category: 'kompak',
    badge: 'Minimalis',
    description: 'Garis aksen tebal di sisi kiri dengan angka tipis elegan.',
    previewBg: '#ffffff',
    previewBorder: '#059669',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'accent_bottom_wave',
    name: 'Garis Pita Aksen Bawah',
    shortName: 'Aksen Bawah',
    category: 'kompak',
    badge: 'Garis Bawah',
    description: 'Kartu bersih dengan balok warna tegas di sepanjang tepi bawah.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'pill_duotone',
    name: 'Pill Duotone Capsule',
    shortName: 'Pill Duotone',
    category: 'kompak',
    badge: 'Kapsul',
    description: 'Susunan horisontal dengan kapsul ikon besar di kiri.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'compact_bar',
    name: 'Compact Bar Horisontal',
    shortName: 'Compact Bar',
    category: 'kompak',
    badge: 'Hemat Ruang',
    description: 'Baris horisontal padat yang sangat hemat ruang di layar HP.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#059669',
    previewText: '#0f172a',
  },
  {
    id: 'circular_badge',
    name: 'Circular Badge Ring',
    shortName: 'Lingkar Cincin',
    category: 'kompak',
    badge: 'Melingkar',
    description: 'Lencana cincin melingkar di sisi kanan angka statistik.',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    previewAccent: '#10b981',
    previewText: '#0f172a',
  },
];

export function getStatsStyleMeta(style?: StatsCardStyle): StatsStyleMeta {
  return (
    STATS_STYLES_CATALOG.find((item) => item.id === (style || 'modern_elevated')) ||
    STATS_STYLES_CATALOG[0]
  );
}

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

export const DEFAULT_GRADE_THRESHOLDS: Required<GradeThresholds> = {
  minA: 86,
  minB: 81,
  minC: 71,
  minD: 60,
  labelA: 'Mumtaz (Istimewa)',
  labelB: 'Jayyid Jiddan (Sangat Baik)',
  labelC: 'Jayyid (Baik)',
  labelD: 'Maqbul (Cukup)',
  labelE: 'Rasib (Kurang)',
};

export function resolveGradeThresholds(
  custom?: Partial<GradeThresholds> | null
): Required<GradeThresholds> {
  const minA =
    typeof custom?.minA === 'number' && !isNaN(custom.minA)
      ? custom.minA
      : DEFAULT_GRADE_THRESHOLDS.minA;
  const minB =
    typeof custom?.minB === 'number' && !isNaN(custom.minB)
      ? custom.minB
      : DEFAULT_GRADE_THRESHOLDS.minB;
  const minC =
    typeof custom?.minC === 'number' && !isNaN(custom.minC)
      ? custom.minC
      : DEFAULT_GRADE_THRESHOLDS.minC;
  const minD =
    typeof custom?.minD === 'number' && !isNaN(custom.minD)
      ? custom.minD
      : DEFAULT_GRADE_THRESHOLDS.minD;

  return {
    minA,
    minB,
    minC,
    minD,
    labelA: custom?.labelA?.trim() || DEFAULT_GRADE_THRESHOLDS.labelA,
    labelB: custom?.labelB?.trim() || DEFAULT_GRADE_THRESHOLDS.labelB,
    labelC: custom?.labelC?.trim() || DEFAULT_GRADE_THRESHOLDS.labelC,
    labelD: custom?.labelD?.trim() || DEFAULT_GRADE_THRESHOLDS.labelD,
    labelE: custom?.labelE?.trim() || DEFAULT_GRADE_THRESHOLDS.labelE,
  };
}

export function evaluateGradePredicate(
  score: number,
  thresholds?: Partial<GradeThresholds> | null
): {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  shortText: string;
  desc: string;
  color: string;
} {
  const t = resolveGradeThresholds(thresholds);
  if (score >= t.minA) {
    return {
      letter: 'A',
      text: t.labelA,
      shortText: t.labelA.replace(/\s*\([^)]*\)/g, '').trim() || 'Mumtaz',
      desc: 'Sangat baik dalam menguasai seluruh kompetensi.',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }
  if (score >= t.minB) {
    return {
      letter: 'B',
      text: t.labelB,
      shortText: t.labelB.replace(/\s*\([^)]*\)/g, '').trim() || 'Jayyid Jiddan',
      desc: 'Baik dalam menguasai kompetensi dasar.',
      color: 'text-sky-700 bg-sky-50 border-sky-200',
    };
  }
  if (score >= t.minC) {
    return {
      letter: 'C',
      text: t.labelC,
      shortText: t.labelC.replace(/\s*\([^)]*\)/g, '').trim() || 'Jayyid',
      desc: 'Cukup dalam menguasai sebagian kompetensi.',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }
  if (score >= t.minD) {
    return {
      letter: 'D',
      text: t.labelD,
      shortText: t.labelD.replace(/\s*\([^)]*\)/g, '').trim() || 'Maqbul',
      desc: 'Memerlukan bimbingan pada beberapa materi.',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
    };
  }
  return {
    letter: 'E',
    text: t.labelE,
    shortText: t.labelE.replace(/\s*\([^)]*\)/g, '').trim() || 'Rasib',
    desc: 'Perlu pengulangan dan remedial intensif.',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  };
}

