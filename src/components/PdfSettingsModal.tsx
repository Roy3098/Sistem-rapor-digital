import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  getReportThemeStyles,
  compressImageFileToDataUrl,
} from '../utils/theme';
import {
  ReportBorderStyle,
  CustomPdfFrameConfig,
  FrameOuterLineStyle,
  FrameInnerLineStyle,
  FrameCornerOrnament,
  FrameEdgeAccent,
} from '../types';
import {
  OfficialKopSurat,
  KOP_EMBLEM_ISLAMIC_STAR,
  KOP_EMBLEM_MADRASAH_SHIELD,
} from './BrandLogoIcon';
import {
  PDF_FRAME_PRESETS,
  DEFAULT_CUSTOM_FRAME_CONFIG,
  getPdfSheetBorderStyle,
  PdfPageFrameOverlay,
  PdfFrameThumbnail,
} from './PdfPageFrame';
import {
  X,
  Image as ImageIcon,
  Upload,
  FileText,
  Palette,
  CheckSquare,
  Check,
  RotateCcw,
  Sparkles,
  Printer,
  Frame,
  Plus,
  Trash2,
  Sliders,
  Wand2,
} from 'lucide-react';

export type PdfSettingsTabId =
  | 'kop_logos'
  | 'frames_studio'
  | 'page_pdf'
  | 'style_font'
  | 'columns_sign';

interface PdfSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PdfSettingsTabId;
}

export const PdfSettingsModal: React.FC<PdfSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'kop_logos',
}) => {
  const {
    siteSettings,
    themeSettings,
    themeClasses,
    updateSchoolConfig,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<PdfSettingsTabId>(initialTab);
  const [frameCategoryFilter, setFrameCategoryFilter] = useState<
    'all' | 'formal' | 'islami' | 'sertifikat' | 'modern' | 'custom'
  >('all');
  const [customFrameNameInput, setCustomFrameNameInput] = useState<string>(
    themeSettings.customFrameConfig?.name || 'Bingkai Kustom Madrasah'
  );

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const reportStyles = getReportThemeStyles(themeSettings);

  const leftLogoUrl =
    themeSettings.customLogoUrl ||
    siteSettings.customLogoUrl ||
    '/src/assets/images/logo_baiturrahman_1791464090153.jpg';

  const rightLogoUrl =
    themeSettings.customRightLogoUrl ||
    siteSettings.customRightLogoUrl ||
    '/src/assets/images/logo_baiturrahman_1791464090153.jpg';

  const activeCustomFrame: CustomPdfFrameConfig = {
    ...DEFAULT_CUSTOM_FRAME_CONFIG,
    ...(themeSettings.customFrameConfig || {}),
  };

  const savedCustomFrames: CustomPdfFrameConfig[] = Array.isArray(
    themeSettings.savedCustomFrames
  )
    ? themeSettings.savedCustomFrames
    : [];

  const handlePatchTheme = (patch: Partial<typeof themeSettings>) => {
    const sitePatch: Partial<typeof siteSettings> = {};
    if (patch.customLogoUrl !== undefined) {
      sitePatch.customLogoUrl = patch.customLogoUrl;
    }
    if (patch.customRightLogoUrl !== undefined) {
      sitePatch.customRightLogoUrl = patch.customRightLogoUrl;
    }
    if (patch.reportCustomTitle !== undefined) {
      sitePatch.reportCustomTitle = patch.reportCustomTitle;
    }
    updateSchoolConfig(
      {
        themeSettings: patch,
        ...(Object.keys(sitePatch).length > 0 ? { siteSettings: sitePatch } : {}),
      },
      { silent: true }
    );
  };

  const handlePatchSite = (patch: Partial<typeof siteSettings>) => {
    updateSchoolConfig(
      {
        siteSettings: patch,
      },
      { silent: true }
    );
  };

  const handlePatchCustomFrame = (patch: Partial<CustomPdfFrameConfig>) => {
    const updatedConfig: CustomPdfFrameConfig = {
      ...activeCustomFrame,
      ...patch,
    };
    handlePatchTheme({
      reportBorderStyle: 'custom',
      customFrameConfig: updatedConfig,
    });
  };

  const handleClonePresetToCustom = (presetId: ReportBorderStyle) => {
    const found =
      PDF_FRAME_PRESETS.find((p) => p.id === presetId) || PDF_FRAME_PRESETS[0];
    const clonedConfig: CustomPdfFrameConfig = {
      ...DEFAULT_CUSTOM_FRAME_CONFIG,
      ...found.config,
      name: `Kustom ${found.shortLabel}`,
      primaryColor: reportStyles.primaryHex,
    };
    setCustomFrameNameInput(clonedConfig.name || 'Bingkai Kustom');
    handlePatchTheme({
      reportBorderStyle: 'custom',
      customFrameConfig: clonedConfig,
    });
    showToast(
      `Gaya "${found.shortLabel}" disalin ke Studio Kustom untuk Anda modifikasi!`,
      'info'
    );
  };

  const handleSaveCurrentCustomFrame = () => {
    const cleanName =
      (customFrameNameInput || activeCustomFrame.name || 'Bingkai Kustom').trim() ||
      'Bingkai Kustom';
    const newSavedItem: CustomPdfFrameConfig = {
      ...activeCustomFrame,
      id: `custom_frame_${Date.now()}`,
      name: cleanName,
    };
    const nextList = [newSavedItem, ...savedCustomFrames].slice(0, 16);
    handlePatchTheme({
      reportBorderStyle: 'custom',
      customFrameConfig: newSavedItem,
      savedCustomFrames: nextList,
    });
    showToast(
      `Bingkai "${cleanName}" berhasil disimpan ke Koleksi Bingkai Anda!`,
      'success'
    );
  };

  const handleDeleteSavedCustomFrame = (idToRemove?: string) => {
    if (!idToRemove) return;
    const nextList = savedCustomFrames.filter((item) => item.id !== idToRemove);
    handlePatchTheme({
      savedCustomFrames: nextList,
    });
    showToast('Bingkai kustom dihapus dari koleksi.', 'info');
  };

  const handleUploadCustomFrameImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 640);
      handlePatchCustomFrame({
        customFrameImageUrl: dataUrl,
      });
      showToast('Gambar bingkai kustom berhasil diterapkan!', 'success');
    } catch {
      showToast('Gagal memuat berkas gambar bingkai.', 'error');
    }
    e.target.value = '';
  };

  const handleUploadLogo = async (
    side: 'left' | 'right',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFileToDataUrl(file, 280);
      if (side === 'left') {
        handlePatchTheme({
          customLogoUrl: dataUrl,
          logoIconType: 'image',
          reportShowLeftLogo: true,
        });
        showToast('Gambar Kop sebelah kiri berhasil diperbarui!', 'success');
      } else {
        handlePatchTheme({
          customRightLogoUrl: dataUrl,
          reportShowRightLogo: true,
          reportHeaderStyle:
            themeSettings.reportHeaderStyle === 'left_logo'
              ? 'dual_logo'
              : themeSettings.reportHeaderStyle || 'dual_logo',
        });
        showToast('Gambar Kop sebelah kanan berhasil diperbarui!', 'success');
      }
    } catch {
      showToast('Gagal memuat berkas gambar.', 'error');
    }
    e.target.value = '';
  };

  const handleResetPdfDefaults = () => {
    handlePatchTheme({
      reportHeaderStyle: 'dual_logo',
      reportShowLeftLogo: true,
      reportShowRightLogo: true,
      reportLogoSize: 'md',
      reportLogoShape: 'rounded',
      reportKopDividerStyle: 'double',
      reportThemeColor: themeSettings.colorTheme || 'emerald',
      reportBorderStyle: 'double',
      reportFontStyle: 'sans',
      reportFontSize: 'md',
      reportTableStyle: 'tinted',
      reportRowDensity: 'compact',
      reportPaperSize: 'A4',
      reportOrientation: 'portrait',
      reportMarginSize: 'narrow',
      reportPdfQuality: 'high',
      reportSinglePageFit: true,
      reportWatermarkOpacity: 'subtle',
      reportShowWatermark: true,
      reportShowBismillah: true,
      reportShowRank: true,
      reportShowTahfidz: true,
      reportShowAttendance: true,
      reportShowKkm: true,
      reportShowPredicate: true,
      reportShowTerbilang: true,
      reportShowTeacherNotes: true,
      reportShowParentSignature: true,
      reportShowClassTeacherSignature: true,
      reportShowHeadmasterSignature: true,
      reportShowSeal: true,
      reportSignatureHeight: 'normal',
      reportShowFooterMeta: true,
    });
    showToast('Pengaturan PDF & Kop dikembalikan ke standar resmi.', 'info');
  };

  const filteredFramePresets = PDF_FRAME_PRESETS.filter((preset) =>
    frameCategoryFilter === 'all' ? true : preset.category === frameCategoryFilter
  );

  const activePresetMeta =
    PDF_FRAME_PRESETS.find((p) => p.id === reportStyles.borderStyle) ||
    PDF_FRAME_PRESETS[0];

  const livePreviewBorderStyle = getPdfSheetBorderStyle(reportStyles);

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl ${themeClasses.primary} text-white flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <Printer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Studio Pengaturan PDF, Kop 2 Gambar & Bingkai Halaman Kustom
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Atur 2 logo kop (kiri-kanan), 17+ gaya bingkai halaman PDF, buat bingkai sendiri, ukuran kertas, dan tanda tangan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/80 flex items-center justify-center text-slate-500 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unified Scrollable Body (Preview Banner + Tabs + Content) so mobile users have full room for the Custom Frame Builder */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Live Kop Surat & Page Frame Preview Banner (Scrolls with page + horizontally/vertically scrollable inside) */}
          <div className="bg-slate-100/90 px-3.5 sm:px-6 py-2.5 border-b border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className={`w-3 h-3 shrink-0 ${themeClasses.primaryText}`} />
                <span>
                  Pratinjau Langsung Bingkai & Kop PDF:{' '}
                  <strong className="text-slate-900">
                    {reportStyles.borderStyle === 'custom'
                      ? activeCustomFrame.name || 'Bingkai Kustom Sendiri'
                      : activePresetMeta.label}
                  </strong>
                </span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Kertas: <strong>{reportStyles.paperSize}</strong> (
                {reportStyles.orientation === 'landscape' ? 'Landscape' : 'Portrait'}) ·
                Margin: <strong>{reportStyles.marginSize}</strong>
              </span>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-56 sm:max-h-none rounded-lg border border-slate-200/80 bg-slate-200/50 p-1.5 sm:p-0 sm:border-0 sm:bg-transparent">
              <div
                style={livePreviewBorderStyle}
                className="relative bg-white px-4 pt-3 pb-2 shadow-2xs overflow-hidden min-w-[500px] sm:min-w-0"
              >
                <PdfPageFrameOverlay reportStyles={reportStyles} compact />
                <div className="relative z-10">
                  <OfficialKopSurat compact />
                </div>
              </div>
            </div>
          </div>

          {/* Precision Navigation Tabs (5 Tabs) */}
          <div className="px-3.5 sm:px-6 py-2.5 bg-white border-b border-slate-200 sm:sticky sm:top-0 z-20 shadow-2xs">
            <div className="filter-group grid grid-cols-2 sm:grid-cols-5 w-full">
              {[
                { id: 'kop_logos', label: '1. Kop 2 Gambar', icon: ImageIcon },
                { id: 'frames_studio', label: '2. Bingkai & Buat Sendiri', icon: Frame },
                { id: 'page_pdf', label: '3. Kertas & PDF', icon: FileText },
                { id: 'style_font', label: '4. Tema & Tabel', icon: Palette },
                { id: 'columns_sign', label: '5. Kolom & TTD', icon: CheckSquare },
              ].map((tab, idx) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as PdfSettingsTabId)}
                    className={`filter-btn w-full ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      active
                        ? `${themeClasses.primary} text-white shadow-2xs`
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="p-3.5 sm:p-6 space-y-5 text-xs">
          {/* ============================================================ */}
          {/* TAB 1: KOP SURAT & 2 GAMBAR (KIRI & KANAN) */}
          {/* ============================================================ */}
          {activeTab === 'kop_logos' && (
            <div className="space-y-5">
              {/* Layout Mode Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Model Tata Letak Kop Surat
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'dual_logo',
                      title: '2 Gambar (Kiri & Kanan)',
                      desc: 'Logo di sebelah kiri & kanan mengapit teks kop',
                    },
                    {
                      id: 'left_logo',
                      title: '1 Gambar di Kiri',
                      desc: 'Logo hanya di sisi kiri kop surat',
                    },
                    {
                      id: 'centered',
                      title: 'Terpusat di Atas',
                      desc: 'Gambar berada di tengah atas kop',
                    },
                    {
                      id: 'split',
                      title: 'Split 2 Kolom',
                      desc: 'Nama di kiri, alamat & logo di kanan',
                    },
                  ].map((item) => {
                    const isSelected = reportStyles.headerStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === 'dual_logo') {
                            handlePatchTheme({
                              reportHeaderStyle: 'dual_logo',
                              reportShowLeftLogo: true,
                              reportShowRightLogo: true,
                            });
                          } else if (item.id === 'left_logo') {
                            handlePatchTheme({
                              reportHeaderStyle: 'left_logo',
                              reportShowLeftLogo: true,
                              reportShowRightLogo: false,
                            });
                          } else {
                            handlePatchTheme({
                              reportHeaderStyle: item.id as any,
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-slate-900">{item.title}</span>
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-snug">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual Image Uploaders: Left Image & Right Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT LOGO CARD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        1. Gambar Kop Sebelah Kiri
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Logo Yayasan / Kemenag / Utama di sisi kiri
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportStyles.showLeftLogo}
                        onChange={(e) =>
                          handlePatchTheme({ reportShowLeftLogo: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="font-semibold text-slate-700">Tampilkan</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 p-1">
                      <img
                        src={leftLogoUrl}
                        alt="Logo Kop Kiri"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/logo_baiturrahman_1791464090153.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <label
                          className={`btn-precision w-full ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                        >
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span>Upload Kiri</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadLogo('left', e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handlePatchTheme({
                              customLogoUrl:
                                '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
                              logoIconType: 'image',
                              reportShowLeftLogo: true,
                            })
                          }
                          className="btn-precision w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          <span>Default</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          leftLogoUrl.startsWith('data:')
                            ? ''
                            : themeSettings.customLogoUrl || ''
                        }
                        onChange={(e) =>
                          handlePatchTheme({
                            customLogoUrl: e.target.value,
                            logoIconType: 'image',
                            reportShowLeftLogo: true,
                          })
                        }
                        placeholder="Atau tempel URL gambar kiri (https://...)"
                        className="filter-control w-full bg-slate-50 text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Quick Emblem Presets for Left Logo */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 mr-1">
                      Preset Cepat:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePatchTheme({
                          customLogoUrl:
                            '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
                          logoIconType: 'image',
                          reportShowLeftLogo: true,
                        })
                      }
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Logo Baiturrahman
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePatchTheme({
                          customLogoUrl: KOP_EMBLEM_ISLAMIC_STAR,
                          logoIconType: 'image',
                          reportShowLeftLogo: true,
                        })
                      }
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Bintang Islami
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePatchTheme({
                          customLogoUrl: KOP_EMBLEM_MADRASAH_SHIELD,
                          logoIconType: 'image',
                          reportShowLeftLogo: true,
                        })
                      }
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Perisai Madrasah
                    </button>
                  </div>
                </div>

                {/* RIGHT LOGO CARD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        2. Gambar Kop Sebelah Kanan
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Logo Madrasah / Unit / Kurikulum di sisi kanan
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportStyles.showRightLogo}
                        onChange={(e) =>
                          handlePatchTheme({
                            reportShowRightLogo: e.target.checked,
                            reportHeaderStyle: e.target.checked
                              ? reportStyles.headerStyle === 'left_logo'
                                ? 'dual_logo'
                                : reportStyles.headerStyle
                              : 'left_logo',
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="font-semibold text-slate-700">Tampilkan</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 p-1">
                      <img
                        src={rightLogoUrl}
                        alt="Logo Kop Kanan"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/logo_baiturrahman_1791464090153.jpg';
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <label
                          className={`btn-precision w-full ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                        >
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span>Upload Kanan</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadLogo('right', e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handlePatchTheme({
                              customRightLogoUrl:
                                '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
                              reportShowRightLogo: true,
                              reportHeaderStyle: 'dual_logo',
                            })
                          }
                          className="btn-precision w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                          <span>Default</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          rightLogoUrl.startsWith('data:')
                            ? ''
                            : themeSettings.customRightLogoUrl || ''
                        }
                        onChange={(e) =>
                          handlePatchTheme({
                            customRightLogoUrl: e.target.value,
                            reportShowRightLogo: true,
                            reportHeaderStyle: 'dual_logo',
                          })
                        }
                        placeholder="Atau tempel URL gambar kanan (https://...)"
                        className="filter-control w-full bg-slate-50 text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Quick Emblem Presets for Right Logo */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] font-semibold text-slate-500 mr-1">
                      Preset Cepat:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePatchTheme({
                          customRightLogoUrl:
                            '/src/assets/images/logo_baiturrahman_1791464090153.jpg',
                          reportShowRightLogo: true,
                          reportHeaderStyle: 'dual_logo',
                        })
                      }
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Logo Baiturrahman
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePatchTheme({
                          customRightLogoUrl: KOP_EMBLEM_ISLAMIC_STAR,
                          reportShowRightLogo: true,
                          reportHeaderStyle: 'dual_logo',
                        })
                      }
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Bintang Islami
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handlePatchTheme({
                          customRightLogoUrl: KOP_EMBLEM_MADRASAH_SHIELD,
                          reportShowRightLogo: true,
                          reportHeaderStyle: 'dual_logo',
                        })
                      }
                      className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 cursor-pointer"
                    >
                      Perisai Madrasah
                    </button>
                  </div>
                </div>
              </div>

              {/* Logo Size, Logo Shape & Kop Divider Line */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Ukuran Gambar di Kop
                  </label>
                  <select
                    value={reportStyles.logoSize}
                    onChange={(e) =>
                      handlePatchTheme({ reportLogoSize: e.target.value as any })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="sm">Kecil Ringkas (48px)</option>
                    <option value="md">Standar Proporsional (60px)</option>
                    <option value="lg">Besar Tegas (72px)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Bingkai Gambar Kop
                  </label>
                  <select
                    value={reportStyles.logoShape}
                    onChange={(e) =>
                      handlePatchTheme({ reportLogoShape: e.target.value as any })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="clean">Transparan Bersih (Tanpa Kotak)</option>
                    <option value="rounded">Kotak Sudut Halus</option>
                    <option value="circle">Lingkaran Penuh</option>
                    <option value="bordered">Bingkai Garis Tegas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Garis Bawah Kop Surat
                  </label>
                  <select
                    value={reportStyles.kopDividerStyle}
                    onChange={(e) =>
                      handlePatchTheme({
                        reportKopDividerStyle: e.target.value as any,
                      })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="double">Garis Ganda Resmi (Double)</option>
                    <option value="triple">Garis Rangkap Tiga (Triple)</option>
                    <option value="single">Garis Tunggal Tebal</option>
                    <option value="accent">Pita Gradasi Warna</option>
                  </select>
                </div>
              </div>

              {/* Editable Kop Text & Document Title */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <span className="font-bold text-slate-800 block">
                  Teks Kop Surat & Judul Dokumen Rapor PDF
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Baris 1: Nama Yayasan / Induk
                    </label>
                    <input
                      type="text"
                      value={siteSettings.foundationName || ''}
                      onChange={(e) =>
                        handlePatchSite({ foundationName: e.target.value })
                      }
                      className="filter-control w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Baris 2: Nama Pesantren / Madrasah
                    </label>
                    <input
                      type="text"
                      value={siteSettings.schoolName || ''}
                      onChange={(e) =>
                        handlePatchSite({ schoolName: e.target.value })
                      }
                      className="filter-control w-full bg-white font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">
                      Baris 3: Alamat Lengkap Kop Surat
                    </label>
                    <input
                      type="text"
                      value={siteSettings.schoolAddress || ''}
                      onChange={(e) =>
                        handlePatchSite({ schoolAddress: e.target.value })
                      }
                      className="filter-control w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Nomor Telepon & Email
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Telepon"
                        value={siteSettings.schoolPhone || ''}
                        onChange={(e) =>
                          handlePatchSite({ schoolPhone: e.target.value })
                        }
                        className="filter-control w-full bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Email"
                        value={siteSettings.schoolEmail || ''}
                        onChange={(e) =>
                          handlePatchSite({ schoolEmail: e.target.value })
                        }
                        className="filter-control w-full bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Nomor Statistik (NSM / NPSN)
                    </label>
                    <input
                      type="text"
                      value={siteSettings.schoolNsmNpsn || ''}
                      onChange={(e) =>
                        handlePatchSite({ schoolNsmNpsn: e.target.value })
                      }
                      className="filter-control w-full bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">
                      Judul Utama Dokumen Rapor (di bawah Kop Surat)
                    </label>
                    <input
                      type="text"
                      value={
                        themeSettings.reportCustomTitle ||
                        siteSettings.reportCustomTitle ||
                        'LAPORAN HASIL EVALUASI BELAJAR SANTRI (RAPOR DIGITAL)'
                      }
                      onChange={(e) =>
                        handlePatchTheme({ reportCustomTitle: e.target.value })
                      }
                      className="filter-control w-full bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: GALERI 17+ GAYA BINGKAI HALAMAN PDF & STUDIO BUAT SENDIRI */}
          {/* ============================================================ */}
          {activeTab === 'frames_studio' && (
            <div className="space-y-6">
              {/* Part A: Preset Frame Gallery */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Frame className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <span>
                        Galeri Gaya Bingkai Halaman PDF ({PDF_FRAME_PRESETS.length} Pilihan Gaya)
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pilih bingkai siap pakai atau klik &ldquo;Modifikasi&rdquo; pada bingkai mana pun untuk merakit bingkai sendiri.
                    </p>
                  </div>

                  {/* Category Filter Buttons */}
                  <div className="filter-group grid grid-cols-3 sm:inline-flex w-full sm:w-auto">
                    {[
                      { id: 'all', label: 'Semua (17)' },
                      { id: 'formal', label: 'Formal' },
                      { id: 'islami', label: 'Islami' },
                      { id: 'sertifikat', label: 'Sertifikat' },
                      { id: 'modern', label: 'Modern' },
                      { id: 'custom', label: 'Kustom' },
                    ].map((cat) => {
                      const active = frameCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFrameCategoryFilter(cat.id as any)}
                          className={`filter-btn w-full sm:w-auto ${
                            active
                              ? `${themeClasses.primary} text-white shadow-2xs`
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid of Frame Presets with Live Visual Miniature */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredFramePresets.map((preset) => {
                    const isSelected = reportStyles.borderStyle === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() =>
                          handlePatchTheme({ reportBorderStyle: preset.id })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <PdfFrameThumbnail
                            borderStyle={preset.id}
                            primaryHex={reportStyles.primaryHex}
                            borderHex={reportStyles.borderHex}
                            customConfig={
                              preset.id === 'custom'
                                ? activeCustomFrame
                                : preset.config
                            }
                          />
                          <div className="flex items-start justify-between gap-1 mt-2">
                            <span className="font-bold text-slate-900 text-[11px] leading-snug">
                              {preset.shortLabel}
                            </span>
                            {isSelected && (
                              <Check
                                className={`w-3.5 h-3.5 shrink-0 ${themeClasses.primaryText}`}
                              />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                            {preset.desc}
                          </p>
                        </div>

                        {preset.id !== 'custom' && preset.id !== 'none' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClonePresetToCustom(preset.id);
                            }}
                            className="w-full h-7 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 inline-flex items-center justify-center gap-1 cursor-pointer"
                            title="Salin pengaturan bingkai ini ke Studio Kustom untuk dimodifikasi"
                          >
                            <Wand2 className="w-3 h-3 shrink-0" />
                            <span>Modifikasi Gaya Ini</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part B: Saved User Custom Frames Collection */}
              {savedCustomFrames.length > 0 && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Koleksi Bingkai Buatan Saya ({savedCustomFrames.length} Tersimpan)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Klik kartu untuk langsung memakai bingkai buatan Anda
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {savedCustomFrames.map((saved) => {
                      const isCurrent =
                        reportStyles.borderStyle === 'custom' &&
                        activeCustomFrame.id === saved.id;
                      return (
                        <div
                          key={saved.id || saved.name}
                          onClick={() => {
                            setCustomFrameNameInput(saved.name || 'Bingkai Kustom');
                            handlePatchTheme({
                              reportBorderStyle: 'custom',
                              customFrameConfig: saved,
                            });
                          }}
                          className={`p-2.5 rounded-xl border bg-white cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                            isCurrent
                              ? `${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <PdfFrameThumbnail
                              borderStyle="custom"
                              primaryHex={reportStyles.primaryHex}
                              borderHex={reportStyles.borderHex}
                              customConfig={saved}
                            />
                            <div className="flex items-center justify-between gap-1 mt-1.5">
                              <span className="font-bold text-slate-900 text-[11px] truncate">
                                {saved.name || 'Bingkai Kustom'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSavedCustomFrame(saved.id);
                                }}
                                className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Hapus dari koleksi"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Part C: Interactive Custom Frame Builder Studio ("Buat Bingkai Sendiri") */}
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-800/15 bg-slate-50/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sliders className={`w-4 h-4 ${themeClasses.primaryText}`} />
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        Studio Buat Bingkai PDF Sendiri (Custom Frame Builder)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rakit bingkai unik Anda: atur garis luar, garis dalam, kelengkungan sudut, ornamen siku, medali sisi, warna, hingga unggah gambar bingkai sendiri.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePatchTheme({ reportBorderStyle: 'custom' })}
                    className={`btn-precision w-full sm:w-auto shrink-0 ${
                      reportStyles.borderStyle === 'custom'
                        ? `${themeClasses.primary} text-white`
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {reportStyles.borderStyle === 'custom'
                        ? 'Bingkai Kustom Aktif'
                        : 'Aktifkan Bingkai Kustom'}
                    </span>
                  </button>
                </div>

                {/* Inline Scrollable Live Frame & Kop Preview inside Studio Builder for Mobile Convenience */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sparkles className={`w-3 h-3 shrink-0 ${themeClasses.primaryText}`} />
                      <span>
                        Pratinjau Langsung Bingkai & Kop PDF:{' '}
                        <strong className="text-slate-900">
                          {reportStyles.borderStyle === 'custom'
                            ? activeCustomFrame.name || 'Bingkai Kustom Sendiri'
                            : activePresetMeta.label}
                        </strong>
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Geser horizontal/vertikal untuk melihat detail sudut
                    </span>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto max-h-52 rounded-lg border border-slate-200/80 bg-slate-100/70 p-2">
                    <div
                      style={livePreviewBorderStyle}
                      className="relative bg-white px-4 pt-3 pb-2 shadow-2xs overflow-hidden min-w-[500px] sm:min-w-0"
                    >
                      <PdfPageFrameOverlay reportStyles={reportStyles} compact />
                      <div className="relative z-10">
                        <OfficialKopSurat compact />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 1: Outer Border Line Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      1. Gaya Garis Luar (Outer Line)
                    </label>
                    <select
                      value={activeCustomFrame.outerLineStyle}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          outerLineStyle: e.target.value as FrameOuterLineStyle,
                        })
                      }
                      className="filter-control w-full bg-slate-50"
                    >
                      <option value="double">Garis Ganda (Double)</option>
                      <option value="solid">Garis Utuh Tegas (Solid)</option>
                      <option value="dashed">Garis Putus-Putus (Dashed)</option>
                      <option value="dotted">Untaian Titik (Dotted)</option>
                      <option value="ridge">Garis Timbul 3D (Ridge)</option>
                      <option value="groove">Garis Cekung (Groove)</option>
                      <option value="none">Tanpa Garis Luar</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Ketebalan Garis Luar
                      </label>
                      <span className="font-mono font-bold text-slate-900">
                        {activeCustomFrame.outerWidth}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={0.5}
                      value={activeCustomFrame.outerWidth}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          outerWidth: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-600 cursor-pointer mt-1.5"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Tipis (1px)</span>
                      <span>Sedang (4px)</span>
                      <span>Tebal (8px)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kelengkungan Sudut Bingkai
                    </label>
                    <select
                      value={activeCustomFrame.cornerRadius}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          cornerRadius: parseInt(e.target.value, 10),
                        })
                      }
                      className="filter-control w-full bg-slate-50"
                    >
                      <option value={0}>Siku Tajam Formal (0px)</option>
                      <option value={4}>Sudut Sedikit Halus (4px)</option>
                      <option value={8}>Sudut Proporsional (8px)</option>
                      <option value={12}>Sudut Melengkung (12px)</option>
                      <option value={16}>Sudut Bulat Modern (16px)</option>
                      <option value={20}>Sudut Ekstra Melengkung (20px)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Inner Border Line & Spacing Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      2. Gaya Garis Dalam (Inner Line)
                    </label>
                    <select
                      value={activeCustomFrame.innerLineStyle}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          innerLineStyle: e.target.value as FrameInnerLineStyle,
                        })
                      }
                      className="filter-control w-full bg-slate-50"
                    >
                      <option value="solid">Garis Dalam Utuh (Solid)</option>
                      <option value="double">Garis Dalam Ganda (Double)</option>
                      <option value="dashed">Garis Dalam Putus-Putus (Dashed)</option>
                      <option value="dotted">Garis Dalam Titik-Titik (Dotted)</option>
                      <option value="none">Tanpa Garis Dalam</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Ketebalan Garis Dalam
                      </label>
                      <span className="font-mono font-bold text-slate-900">
                        {activeCustomFrame.innerWidth}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.5}
                      disabled={activeCustomFrame.innerLineStyle === 'none'}
                      value={activeCustomFrame.innerWidth}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          innerWidth: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-600 cursor-pointer mt-1.5 disabled:opacity-40"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>1px</span>
                      <span>3px</span>
                      <span>5px</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        Jarak Spasi Garis Luar-Dalam
                      </label>
                      <span className="font-mono font-bold text-slate-900">
                        {activeCustomFrame.innerGap}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={14}
                      step={1}
                      value={activeCustomFrame.innerGap}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          innerGap: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-emerald-600 cursor-pointer mt-1.5"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Rapat (2px)</span>
                      <span>Ideal (6px)</span>
                      <span>Lebar (14px)</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Corner Ornaments & Edge Medallions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      3. Ornamen 4 Sudut Halaman
                    </label>
                    <select
                      value={activeCustomFrame.cornerOrnament}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          cornerOrnament: e.target.value as FrameCornerOrnament,
                        })
                      }
                      className="filter-control w-full bg-slate-50"
                    >
                      <option value="islamic_star">Bintang Islami (Rub el Hizb)</option>
                      <option value="classic_flourish">Ukiran Siku Sertifikat Klasik</option>
                      <option value="crescent_dome">Kubah & Bulan Sabit Pesantren</option>
                      <option value="kufi_step">Siku Labirin Geometris Kufi</option>
                      <option value="diamond_seal">Segel Berlian Kehormatan</option>
                      <option value="floral_leaf">Sulur Daun Flora Arabesk</option>
                      <option value="double_bracket">Siku Lapis Ganda Tegas</option>
                      <option value="none">Tanpa Ornamen Sudut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Ukuran Ornamen Sudut
                    </label>
                    <select
                      value={activeCustomFrame.cornerOrnamentSize}
                      disabled={activeCustomFrame.cornerOrnament === 'none'}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          cornerOrnamentSize: e.target.value as 'sm' | 'md' | 'lg',
                        })
                      }
                      className="filter-control w-full bg-slate-50 disabled:opacity-40"
                    >
                      <option value="sm">Kecil Halus (24px)</option>
                      <option value="md">Standar Proporsional (34px)</option>
                      <option value="lg">Besar Megah (44px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Aksen Tengah Sisi Halaman
                    </label>
                    <select
                      value={activeCustomFrame.edgeAccent}
                      onChange={(e) =>
                        handlePatchCustomFrame({
                          edgeAccent: e.target.value as FrameEdgeAccent,
                        })
                      }
                      className="filter-control w-full bg-slate-50"
                    >
                      <option value="top_bottom_rosette">
                        Medali Permata Atas & Bawah
                      </option>
                      <option value="all_sides_diamond">
                        Permata di 4 Sisi (Atas, Bawah, Kiri, Kanan)
                      </option>
                      <option value="top_ribbon_bar">
                        Pita Gradasi Atas & Bawah
                      </option>
                      <option value="dual_side_pillars">
                        Pilar Kembar Sisi Kiri & Kanan
                      </option>
                      <option value="none">Tanpa Aksen Sisi</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Frame Color Customization */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-700">
                      4. Warna Garis Bingkai & Ornamen Sudut
                    </span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeCustomFrame.useThemeColor}
                        onChange={(e) =>
                          handlePatchCustomFrame({
                            useThemeColor: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="font-semibold text-slate-700">
                        Ikuti Warna Tema Rapor Utama ({reportStyles.primaryHex})
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          Warna Garis Luar & Utama
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {activeCustomFrame.useThemeColor
                            ? 'Mengikuti warna tema rapor'
                            : 'Warna kustom bebas'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={
                            activeCustomFrame.useThemeColor
                              ? reportStyles.primaryHex
                              : activeCustomFrame.primaryColor || '#047857'
                          }
                          onChange={(e) =>
                            handlePatchCustomFrame({
                              useThemeColor: false,
                              primaryColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={
                            activeCustomFrame.useThemeColor
                              ? reportStyles.primaryHex
                              : activeCustomFrame.primaryColor || '#047857'
                          }
                          onChange={(e) =>
                            handlePatchCustomFrame({
                              useThemeColor: false,
                              primaryColor: e.target.value,
                            })
                          }
                          className="filter-control w-24 font-mono bg-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">
                          Warna Garis Dalam & Aksen Ornamen
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          {[
                            { hex: '#d97706', title: 'Emas' },
                            { hex: '#047857', title: 'Hijau' },
                            { hex: '#1e3a8a', title: 'Dongker' },
                            { hex: '#78350f', title: 'Turats' },
                            { hex: '#0f172a', title: 'Hitam' },
                          ].map((sw) => (
                            <button
                              key={sw.hex}
                              type="button"
                              onClick={() =>
                                handlePatchCustomFrame({
                                  secondaryColor: sw.hex,
                                })
                              }
                              className="w-4 h-4 rounded-full border border-white shadow-2xs cursor-pointer"
                              style={{ backgroundColor: sw.hex }}
                              title={`Warna Aksen ${sw.title}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={activeCustomFrame.secondaryColor || '#d97706'}
                          onChange={(e) =>
                            handlePatchCustomFrame({
                              secondaryColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={activeCustomFrame.secondaryColor || '#d97706'}
                          onChange={(e) =>
                            handlePatchCustomFrame({
                              secondaryColor: e.target.value,
                            })
                          }
                          className="filter-control w-24 font-mono bg-white text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 5: Optional Custom Frame Border Image Upload (PNG/SVG) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-700 block">
                        5. Gambar Bingkai Kustom Sendiri (Opsional - PNG Transparan / SVG)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Unggah gambar bingkai sertifikat/piagam milik madrasah Anda untuk dilapiskan ke tepi halaman PDF.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <label
                        className={`btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white cursor-pointer`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Gambar Bingkai</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadCustomFrameImage}
                          className="hidden"
                        />
                      </label>
                      {activeCustomFrame.customFrameImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            handlePatchCustomFrame({ customFrameImageUrl: '' })
                          }
                          className="btn-precision bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={
                          activeCustomFrame.customFrameImageUrl?.startsWith('data:')
                            ? ''
                            : activeCustomFrame.customFrameImageUrl || ''
                        }
                        onChange={(e) =>
                          handlePatchCustomFrame({
                            customFrameImageUrl: e.target.value,
                          })
                        }
                        placeholder="Atau tempel URL gambar bingkai PNG/SVG transparan (https://...)"
                        className="filter-control w-full bg-slate-50 text-[11px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                        Opasitas: {activeCustomFrame.customFrameImageOpacity ?? 85}%
                      </span>
                      <input
                        type="range"
                        min={15}
                        max={100}
                        step={5}
                        value={activeCustomFrame.customFrameImageOpacity ?? 85}
                        onChange={(e) =>
                          handlePatchCustomFrame({
                            customFrameImageOpacity: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 6: Save to User's Custom Frame Collection */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-bold text-slate-700 shrink-0">
                      Nama Bingkai:
                    </span>
                    <input
                      type="text"
                      value={customFrameNameInput}
                      onChange={(e) => {
                        setCustomFrameNameInput(e.target.value);
                        handlePatchCustomFrame({ name: e.target.value });
                      }}
                      placeholder="Contoh: Bingkai Ijazah Baiturrahman"
                      className="filter-control w-full bg-slate-50 font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCurrentCustomFrame}
                    className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shrink-0`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Simpan ke Koleksi Bingkai Saya</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: KERTAS, ORIENTASI, MARGIN & KUALITAS PDF */}
          {/* ============================================================ */}
          {activeTab === 'page_pdf' && (
            <div className="space-y-5">
              {/* Paper Size */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Ukuran Kertas Cetak & Unduhan PDF
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'A4', title: 'Kertas A4', sub: '210 × 297 mm (Standar)' },
                    { id: 'F4', title: 'Kertas F4 / Folio', sub: '215 × 330 mm (Madrasah)' },
                    { id: 'Letter', title: 'Kertas Letter', sub: '216 × 279 mm (Kuarto)' },
                    { id: 'Legal', title: 'Kertas Legal', sub: '216 × 356 mm (Panjang)' },
                  ].map((p) => {
                    const active = reportStyles.paperSize === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          handlePatchTheme({ reportPaperSize: p.id as any })
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{p.title}</span>
                          {active && (
                            <Check className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {p.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Orientation & Margin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-2">
                    Orientasi Kertas PDF
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'portrait', label: 'Portrait (Tegak)', sub: 'Rapor vertikal standar' },
                      { id: 'landscape', label: 'Landscape (Mendatar)', sub: 'Rapor melebar horizontal' },
                    ].map((or) => {
                      const active = reportStyles.orientation === or.id;
                      return (
                        <button
                          key={or.id}
                          type="button"
                          onClick={() =>
                            handlePatchTheme({ reportOrientation: or.id as any })
                          }
                          className={`p-3 rounded-xl border text-left cursor-pointer ${
                            active
                              ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold text-slate-900">{or.label}</div>
                          <div className="text-[10px] text-slate-500">{or.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-2">
                    Batas Tepi (Margin) Halaman PDF
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'none', label: 'Tanpa Margin (Penuh)', sub: '0.5 mm tepi kertas' },
                      { id: 'narrow', label: 'Sempit Presisi', sub: '5.5 mm kiri-kanan (Ideal)' },
                      { id: 'normal', label: 'Margin Normal', sub: '9 mm kiri-kanan' },
                      { id: 'wide', label: 'Margin Lebar', sub: '14 mm untuk jilid map' },
                    ].map((m) => {
                      const active = reportStyles.marginSize === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            handlePatchTheme({ reportMarginSize: m.id as any })
                          }
                          className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                            active
                              ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold text-slate-900">{m.label}</div>
                          <div className="text-[10px] text-slate-500">{m.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PDF Render Quality & Single-Page Fit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-slate-800 mb-2">
                    Resolusi & Ketajaman File PDF
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', label: 'Standar', sub: 'Ukuran file hemat' },
                      { id: 'high', label: 'Tinggi (HD)', sub: 'Tajam & cepat' },
                      { id: 'ultra', label: 'Ultra Cetak', sub: 'Resolusi 3.0x' },
                    ].map((q) => {
                      const active = reportStyles.pdfQuality === q.id;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() =>
                            handlePatchTheme({ reportPdfQuality: q.id as any })
                          }
                          className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                            active
                              ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} ring-2 ${themeClasses.primaryRing}`
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold text-slate-900">{q.label}</div>
                          <div className="text-[10px] text-slate-500">{q.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-2">
                    Penyesuaian Otomatis 1 Lembar (Auto-Fit)
                  </label>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Kunci Pas 1 Halaman Penuh
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Menjamin seluruh tabel nilai & tanda tangan tidak terpotong ke halaman ke-2.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={reportStyles.singlePageFit}
                      onChange={(e) =>
                        handlePatchTheme({ reportSinglePageFit: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600 shrink-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: TEMA WARNA, BINGKAI, HURUF & GAYA TABEL PDF */}
          {/* ============================================================ */}
          {activeTab === 'style_font' && (
            <div className="space-y-5">
              {/* Report Theme Color */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Skema Warna Kop, Bingkai & Header Tabel PDF
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'emerald', label: 'Hijau Madrasah', hex: '#047857' },
                    { id: 'forest', label: 'Hijau Nabawi', hex: '#15803d' },
                    { id: 'blue', label: 'Biru Akademik', hex: '#1d4ed8' },
                    { id: 'navy', label: 'Biru Dongker', hex: '#1e3a8a' },
                    { id: 'teal', label: 'Toska Bahari', hex: '#0f766e' },
                    { id: 'indigo', label: 'Ungu Royal', hex: '#4338ca' },
                    { id: 'amber', label: 'Emas Klasik', hex: '#b45309' },
                    { id: 'crimson', label: 'Merah Marun', hex: '#991b1b' },
                    { id: 'bronze', label: 'Cokelat Turats', hex: '#78350f' },
                    { id: 'slate', label: 'Abu Monokrom', hex: '#1e293b' },
                    { id: 'classic_black', label: 'Hitam Formal', hex: '#0f172a' },
                    {
                      id: 'custom',
                      label: 'Kustom Hex',
                      hex: themeSettings.reportCustomHex || '#047857',
                    },
                  ].map((c) => {
                    const currentReportColor =
                      themeSettings.reportThemeColor || themeSettings.colorTheme || 'emerald';
                    const active = currentReportColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          handlePatchTheme({ reportThemeColor: c.id as any })
                        }
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left cursor-pointer ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white font-bold shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-white/40"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate text-[11px]">{c.label}</span>
                      </button>
                    );
                  })}
                </div>

                {(themeSettings.reportThemeColor === 'custom' ||
                  themeSettings.colorTheme === 'custom') && (
                  <div className="mt-2.5 flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700">
                      Pilih Warna Kustom PDF:
                    </span>
                    <input
                      type="color"
                      value={themeSettings.reportCustomHex || '#047857'}
                      onChange={(e) =>
                        handlePatchTheme({
                          reportThemeColor: 'custom',
                          reportCustomHex: e.target.value,
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={themeSettings.reportCustomHex || '#047857'}
                      onChange={(e) =>
                        handlePatchTheme({
                          reportThemeColor: 'custom',
                          reportCustomHex: e.target.value,
                        })
                      }
                      className="filter-control w-28 font-mono bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Border, Font Family, Font Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">
                      Gaya Bingkai Halaman PDF
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('frames_studio')}
                      className={`text-[10px] font-bold underline cursor-pointer ${themeClasses.primaryText}`}
                    >
                      + Buat Sendiri
                    </button>
                  </div>
                  <select
                    value={reportStyles.borderStyle}
                    onChange={(e) =>
                      handlePatchTheme({
                        reportBorderStyle: e.target.value as ReportBorderStyle,
                      })
                    }
                    className="filter-control w-full bg-white"
                  >
                    {PDF_FRAME_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Jenis Huruf (Font) PDF
                  </label>
                  <select
                    value={reportStyles.fontStyle}
                    onChange={(e) =>
                      handlePatchTheme({ reportFontStyle: e.target.value as any })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="sans">Sans Modern (Plus Jakarta Sans)</option>
                    <option value="serif">Serif Klasik (Amiri / Georgia)</option>
                    <option value="poppins">Poppins Akademik</option>
                    <option value="classic">Formal Klasik (Times New Roman)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Ukuran Teks Tabel & Isi
                  </label>
                  <select
                    value={reportStyles.fontSize}
                    onChange={(e) =>
                      handlePatchTheme({ reportFontSize: e.target.value as any })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="sm">Kecil Ringkas (11.5px)</option>
                    <option value="md">Standar Ideal (12.5px)</option>
                    <option value="lg">Besar Jelas (13.5px)</option>
                  </select>
                </div>
              </div>

              {/* Table Style, Row Density, Watermark */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Gaya Tabel Nilai PDF
                  </label>
                  <select
                    value={reportStyles.tableStyle}
                    onChange={(e) =>
                      handlePatchTheme({ reportTableStyle: e.target.value as any })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="tinted">Header Berwarna Lembut</option>
                    <option value="striped">Baris Belang (Zebra Striped)</option>
                    <option value="clean">Putih Bersih Formal</option>
                    <option value="bold_grid">Garis Tabel Hitam Tegas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kerapatan Baris Tabel
                  </label>
                  <select
                    value={reportStyles.rowDensity}
                    onChange={(e) =>
                      handlePatchTheme({ reportRowDensity: e.target.value as any })
                    }
                    className="filter-control w-full bg-white"
                  >
                    <option value="tight">Sangat Rapat (Muat Banyak Mapel)</option>
                    <option value="compact">Rapat Presisi (Standar 1 Halaman)</option>
                    <option value="normal">Normal Proporsional</option>
                    <option value="relaxed">Longgar Nyaman</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Ketebalan Watermark Latar
                  </label>
                  <select
                    value={
                      !reportStyles.showWatermark
                        ? 'off'
                        : reportStyles.watermarkOpacity
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'off') {
                        handlePatchTheme({ reportShowWatermark: false });
                      } else {
                        handlePatchTheme({
                          reportShowWatermark: true,
                          reportWatermarkOpacity: val as any,
                        });
                      }
                    }}
                    className="filter-control w-full bg-white"
                  >
                    <option value="subtle">Tipis Halus (3.5%)</option>
                    <option value="medium">Sedang Jelas (7%)</option>
                    <option value="strong">Tebal Tegas (12%)</option>
                    <option value="off">Sembunyikan Watermark</option>
                  </select>
                </div>
              </div>

              {reportStyles.showWatermark && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Teks Watermark Latar Halaman PDF
                  </label>
                  <input
                    type="text"
                    value={siteSettings.watermarkText || ''}
                    onChange={(e) =>
                      handlePatchSite({ watermarkText: e.target.value })
                    }
                    placeholder="Contoh: DOKUMEN RESMI BAITURRAHMAN"
                    className="filter-control w-full bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: KOLOM TABEL, STEMPEL & TANDA TANGAN PDF */}
          {/* ============================================================ */}
          {activeTab === 'columns_sign' && (
            <div className="space-y-5">
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Komponen & Kolom Tabel yang Ditampilkan di PDF
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {[
                    {
                      key: 'reportShowBismillah',
                      val: reportStyles.showBismillah,
                      label: 'Kalimat Basmalah Arab',
                    },
                    {
                      key: 'reportShowRank',
                      val: reportStyles.showRank,
                      label: 'Peringkat Kelas Santri',
                    },
                    {
                      key: 'reportShowTahfidz',
                      val: reportStyles.showTahfidz,
                      label: 'Baris Nilai Tahfidz (Tabel Agama)',
                    },
                    {
                      key: 'reportShowKkm',
                      val: reportStyles.showKkm,
                      label: 'Kolom KKM Mata Pelajaran',
                    },
                    {
                      key: 'reportShowPredicate',
                      val: reportStyles.showPredicate,
                      label: 'Kolom Predikat (A/B/C/D)',
                    },
                    {
                      key: 'reportShowTerbilang',
                      val: reportStyles.showTerbilang,
                      label: 'Kolom Nilai Terbilang Huruf',
                    },
                    {
                      key: 'reportShowAttendance',
                      val: reportStyles.showAttendance,
                      label: 'Tabel Rekapitulasi Kehadiran',
                    },
                    {
                      key: 'reportShowTeacherNotes',
                      val: reportStyles.showTeacherNotes,
                      label: 'Kotak Catatan Wali Kelas',
                    },
                    {
                      key: 'reportShowFooterMeta',
                      val: reportStyles.showFooterMeta,
                      label: 'Catatan Kaki & Waktu Cetak PDF',
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800">
                        {item.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={item.val}
                        onChange={(e) =>
                          handlePatchTheme({ [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600 shrink-0"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Signatures & Official Stamp Settings */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="font-bold text-slate-800 block">
                  Pengaturan Blok Tanda Tangan & Stempel Pengesahan PDF
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    {
                      key: 'reportShowParentSignature',
                      val: reportStyles.showParentSignature,
                      label: 'TTD Orang Tua / Wali',
                    },
                    {
                      key: 'reportShowClassTeacherSignature',
                      val: reportStyles.showClassTeacherSignature,
                      label: 'TTD Wali Kelas',
                    },
                    {
                      key: 'reportShowHeadmasterSignature',
                      val: reportStyles.showHeadmasterSignature,
                      label: 'TTD Kepala Madrasah',
                    },
                    {
                      key: 'reportShowSeal',
                      val: reportStyles.showSeal,
                      label: 'Stempel / Cap Resmi',
                    },
                  ].map((sig) => (
                    <label
                      key={sig.key}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800">
                        {sig.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={sig.val}
                        onChange={(e) =>
                          handlePatchTheme({ [sig.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-emerald-600 shrink-0"
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Tinggi Ruang Tanda Tangan
                    </label>
                    <select
                      value={reportStyles.signatureHeight}
                      onChange={(e) =>
                        handlePatchTheme({
                          reportSignatureHeight: e.target.value as any,
                        })
                      }
                      className="filter-control w-full bg-white"
                    >
                      <option value="compact">Rapat (54px)</option>
                      <option value="normal">Standar Ideal (76px)</option>
                      <option value="spacious">Luas (94px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Nama Kepala Madrasah Default
                    </label>
                    <input
                      type="text"
                      value={siteSettings.headmasterName || ''}
                      onChange={(e) =>
                        handlePatchSite({ headmasterName: e.target.value })
                      }
                      className="filter-control w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      NIY / NIP Kepala Madrasah
                    </label>
                    <input
                      type="text"
                      value={siteSettings.headmasterNip || ''}
                      onChange={(e) =>
                        handlePatchSite({ headmasterNip: e.target.value })
                      }
                      className="filter-control w-full bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2">
          <button
            type="button"
            onClick={handleResetPdfDefaults}
            className="btn-precision w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white px-5 shadow-2xs`}
          >
            <Check className="w-4 h-4" />
            <span>Selesai & Terapkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
