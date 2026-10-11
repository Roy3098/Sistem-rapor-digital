import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ExamFile, ExamQuestionsPackage, QuestionItem } from '../types';
import { getRadiusClass, getReportThemeStyles } from '../utils/theme';
import { BrandLogoIcon, OfficialKopSurat } from '../components/BrandLogoIcon';
import { PdfSettingsModal } from '../components/PdfSettingsModal';
import { getPdfSheetBorderStyle, PdfPageFrameOverlay } from '../components/PdfPageFrame';
import { exportElementsToPdf, printElementsInIsolatedFrame } from '../utils/pdfExport';
import {
  FileQuestion,
  Upload,
  PlusCircle,
  FileText,
  Download,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  X,
  Play,
  Printer,
  Edit2,
  FileDown,
  Search,
  Copy,
  Plus,
  Check,
  ArrowUp,
  ArrowDown,
  Sliders,
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const {
    subjects,
    classes,
    examFiles,
    examPackages,
    addExamFile,
    updateExamFile,
    deleteExamFile,
    addExamPackage,
    updateExamPackage,
    deleteExamPackage,
    deleteQuestionFromPackage,
    academicYear,
    siteSettings,
    themeClasses,
    themeSettings,
    showToast,
  } = useApp();

  const radius = getRadiusClass(themeSettings.borderRadius);
  const reportStyles = getReportThemeStyles(themeSettings);

  // Precision Filters
  const [filterClassId, setFilterClassId] = useState<string>('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'file' | 'questions'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline Delete Confirmation States (No window.confirm!)
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState<number | null>(null);
  const [confirmDeletePkgId, setConfirmDeletePkgId] = useState<number | null>(null);
  const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<number | null>(null);

  // Upload / Edit File Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [editingFileId, setEditingFileId] = useState<number | null>(null);
  const [uploadSubjectId, setUploadSubjectId] = useState('');
  const [uploadClassId, setUploadClassId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('145 KB');

  // Create / Edit Question Package Modal State
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);
  const [questionSubjectId, setQuestionSubjectId] = useState('');
  const [questionClassId, setQuestionClassId] = useState('');
  const [questionType, setQuestionType] = useState<'essay' | 'multiple_choice'>('multiple_choice');
  const [questionList, setQuestionList] = useState<
    Array<{
      id: number;
      text: string;
      optionA?: string;
      optionB?: string;
      optionC?: string;
      optionD?: string;
      correctAnswer?: 'A' | 'B' | 'C' | 'D';
    }>
  >([{ id: 1, text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' }]);

  // Detail & Inline Question CRUD Modal State
  const [activePackageId, setActivePackageId] = useState<number | null>(null);
  const [inlineEditingQuestion, setInlineEditingQuestion] = useState<QuestionItem | null>(null);
  const [isAddingInlineQuestion, setIsAddingInlineQuestion] = useState<boolean>(false);
  const [newInlineQuestion, setNewInlineQuestion] = useState<{
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
  }>({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
  });

  // Print / PDF Preview Modal State for Exam Package
  const [printPreviewPkgId, setPrintPreviewPkgId] = useState<number | null>(null);
  const [includeAnswerKeyInPdf, setIncludeAnswerKeyInPdf] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isPdfSettingsOpen, setIsPdfSettingsOpen] = useState<boolean>(false);
  const examSheetContainerRef = useRef<HTMLDivElement>(null);

  // Simulation / Test Taker Modal State
  const [simulationPackage, setSimulationPackage] = useState<ExamQuestionsPackage | null>(null);
  const [simAnswers, setSimAnswers] = useState<Record<number, string>>({});
  const [simSubmitted, setSimSubmitted] = useState<boolean>(false);

  // Active Package derived from state so edits reflect live
  const activePackageDetail = useMemo(
    () => examPackages.find((p) => p.id === activePackageId) || null,
    [examPackages, activePackageId]
  );

  const printPreviewPkg = useMemo(
    () => examPackages.find((p) => p.id === printPreviewPkgId) || null,
    [examPackages, printPreviewPkgId]
  );

  // Filtered lists
  const filteredExamFiles = useMemo(() => {
    if (filterType === 'questions') return [];
    return examFiles.filter((f) => {
      const matchClass = filterClassId ? f.classId === parseInt(filterClassId, 10) : true;
      const matchSubject = filterSubjectId ? f.subjectId === parseInt(filterSubjectId, 10) : true;
      const subName = subjects.find((s) => s.id === f.subjectId)?.name || '';
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.fileName.toLowerCase().includes(q) ||
        subName.toLowerCase().includes(q);
      return matchClass && matchSubject && matchSearch;
    });
  }, [examFiles, filterClassId, filterSubjectId, filterType, searchQuery, subjects]);

  const filteredExamPackages = useMemo(() => {
    if (filterType === 'file') return [];
    return examPackages.filter((p) => {
      const matchClass = filterClassId ? p.classId === parseInt(filterClassId, 10) : true;
      const matchSubject = filterSubjectId ? p.subjectId === parseInt(filterSubjectId, 10) : true;
      const subName = subjects.find((s) => s.id === p.subjectId)?.name || '';
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        subName.toLowerCase().includes(q) ||
        p.questions.some((item) => item.text.toLowerCase().includes(q));
      return matchClass && matchSubject && matchSearch;
    });
  }, [examPackages, filterClassId, filterSubjectId, filterType, searchQuery, subjects]);

  // Open Create Package Modal
  const handleOpenCreatePackage = () => {
    setEditingPackageId(null);
    setQuestionSubjectId(subjects[0]?.id ? String(subjects[0].id) : '');
    setQuestionClassId(classes[0]?.id ? String(classes[0].id) : '');
    setQuestionType('multiple_choice');
    setQuestionList([
      { id: 1, text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' },
    ]);
    setShowQuestionModal(true);
  };

  // Open Edit Package Modal (Full Update CRUD)
  const handleOpenEditPackage = (pkg: ExamQuestionsPackage) => {
    setEditingPackageId(pkg.id);
    setQuestionSubjectId(String(pkg.subjectId));
    setQuestionClassId(String(pkg.classId));
    setQuestionType(pkg.type);
    setQuestionList(
      pkg.questions.length > 0
        ? pkg.questions.map((q, idx) => ({
            id: q.id || idx + 1,
            text: q.text,
            optionA: q.optionA || '',
            optionB: q.optionB || '',
            optionC: q.optionC || '',
            optionD: q.optionD || '',
            correctAnswer: (q.correctAnswer as 'A' | 'B' | 'C' | 'D') || 'A',
          }))
        : [
            {
              id: 1,
              text: '',
              optionA: '',
              optionB: '',
              optionC: '',
              optionD: '',
              correctAnswer: 'A',
            },
          ]
    );
    setShowQuestionModal(true);
  };

  // Open Upload File Modal
  const handleOpenCreateFile = () => {
    setEditingFileId(null);
    setUploadSubjectId(subjects[0]?.id ? String(subjects[0].id) : '');
    setUploadClassId(classes[0]?.id ? String(classes[0].id) : '');
    setUploadTitle('');
    setUploadFileName('');
    setUploadFileSize('145 KB');
    setShowUploadModal(true);
  };

  // Open Edit File Modal
  const handleOpenEditFile = (file: ExamFile) => {
    setEditingFileId(file.id);
    setUploadSubjectId(String(file.subjectId));
    setUploadClassId(String(file.classId));
    setUploadTitle(file.title);
    setUploadFileName(file.fileName);
    setUploadFileSize(file.fileSize || '145 KB');
    setShowUploadModal(true);
  };

  // Handle Add question item to form
  const handleAddQuestionItem = () => {
    if (questionList.length >= 50) {
      showToast('Maksimal 50 butir soal dalam satu paket.', 'error');
      return;
    }
    const nextId = Math.max(0, ...questionList.map((q) => q.id)) + 1;
    setQuestionList((prev) => [
      ...prev,
      {
        id: nextId,
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
      },
    ]);
  };

  const handleDuplicateQuestionItem = (idx: number) => {
    const source = questionList[idx];
    if (!source) return;
    const nextId = Math.max(0, ...questionList.map((q) => q.id)) + 1;
    const copy = { ...source, id: nextId };
    setQuestionList((prev) => [
      ...prev.slice(0, idx + 1),
      copy,
      ...prev.slice(idx + 1),
    ]);
  };

  const handleMoveQuestionItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questionList.length) return;
    setQuestionList((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleRemoveQuestionItem = (idx: number) => {
    if (questionList.length <= 1) {
      showToast('Minimal harus terdapat 1 butir soal dalam paket.', 'error');
      return;
    }
    setQuestionList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSavePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionSubjectId || !questionClassId) {
      showToast('Pilih Mata Pelajaran dan Kelas terlebih dahulu.', 'error');
      return;
    }

    const validQuestions: QuestionItem[] = questionList
      .filter((q) => q.text.trim())
      .map((q, index) => ({
        id: q.id || index + 1,
        text: q.text.trim(),
        optionA: questionType === 'multiple_choice' ? q.optionA?.trim() || '-' : undefined,
        optionB: questionType === 'multiple_choice' ? q.optionB?.trim() || '-' : undefined,
        optionC: questionType === 'multiple_choice' ? q.optionC?.trim() || '-' : undefined,
        optionD: questionType === 'multiple_choice' ? q.optionD?.trim() || '-' : undefined,
        correctAnswer: questionType === 'multiple_choice' ? q.correctAnswer || 'A' : undefined,
      }));

    if (validQuestions.length === 0) {
      showToast('Silakan tulis minimal satu pertanyaan ujian.', 'error');
      return;
    }

    if (editingPackageId !== null) {
      updateExamPackage(editingPackageId, {
        subjectId: parseInt(questionSubjectId, 10),
        classId: parseInt(questionClassId, 10),
        type: questionType,
        questions: validQuestions,
      });
    } else {
      addExamPackage({
        subjectId: parseInt(questionSubjectId, 10),
        classId: parseInt(questionClassId, 10),
        type: questionType,
        questions: validQuestions,
      });
    }

    setShowQuestionModal(false);
    setEditingPackageId(null);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadSubjectId || !uploadClassId) {
      showToast('Pilih Mata Pelajaran dan Kelas terlebih dahulu.', 'error');
      return;
    }

    const finalTitle = uploadTitle.trim() || 'Lembar Naskah Soal Ujian';
    const finalFileName =
      uploadFileName.trim() ||
      `Naskah_Soal_${subjects.find((s) => s.id === parseInt(uploadSubjectId, 10))?.name || 'Ujian'}.pdf`;

    if (editingFileId !== null) {
      updateExamFile(editingFileId, {
        subjectId: parseInt(uploadSubjectId, 10),
        classId: parseInt(uploadClassId, 10),
        title: finalTitle,
        fileName: finalFileName,
        fileSize: uploadFileSize,
      });
    } else {
      addExamFile(
        parseInt(uploadSubjectId, 10),
        parseInt(uploadClassId, 10),
        finalTitle,
        finalFileName,
        uploadFileSize
      );
    }

    setShowUploadModal(false);
    setEditingFileId(null);
    setUploadTitle('');
    setUploadFileName('');
  };

  // Inline Question Save inside Detail Modal
  const handleSaveInlineQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackageDetail || !inlineEditingQuestion) return;
    if (!inlineEditingQuestion.text.trim()) {
      showToast('Teks pertanyaan tidak boleh kosong.', 'error');
      return;
    }

    const updatedQuestions = activePackageDetail.questions.map((q) =>
      q.id === inlineEditingQuestion.id
        ? {
            ...inlineEditingQuestion,
            text: inlineEditingQuestion.text.trim(),
          }
        : q
    );

    updateExamPackage(activePackageDetail.id, { questions: updatedQuestions });
    setInlineEditingQuestion(null);
  };

  // Inline Add New Question inside Detail Modal
  const handleAddInlineQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackageDetail) return;
    if (!newInlineQuestion.text.trim()) {
      showToast('Teks pertanyaan tidak boleh kosong.', 'error');
      return;
    }

    const nextId =
      Math.max(0, ...activePackageDetail.questions.map((q) => q.id)) + 1;
    const created: QuestionItem = {
      id: nextId,
      text: newInlineQuestion.text.trim(),
      optionA:
        activePackageDetail.type === 'multiple_choice'
          ? newInlineQuestion.optionA.trim() || '-'
          : undefined,
      optionB:
        activePackageDetail.type === 'multiple_choice'
          ? newInlineQuestion.optionB.trim() || '-'
          : undefined,
      optionC:
        activePackageDetail.type === 'multiple_choice'
          ? newInlineQuestion.optionC.trim() || '-'
          : undefined,
      optionD:
        activePackageDetail.type === 'multiple_choice'
          ? newInlineQuestion.optionD.trim() || '-'
          : undefined,
      correctAnswer:
        activePackageDetail.type === 'multiple_choice'
          ? newInlineQuestion.correctAnswer
          : undefined,
    };

    updateExamPackage(activePackageDetail.id, {
      questions: [...activePackageDetail.questions, created],
    });
    setNewInlineQuestion({
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
    });
    setIsAddingInlineQuestion(false);
  };

  // Download Question Package as formatted TXT file
  const handleDownloadTxt = (pkg: ExamQuestionsPackage) => {
    const sub = subjects.find((s) => s.id === pkg.subjectId);
    const cls = classes.find((c) => c.id === pkg.classId);

    let content = `====================================================\n`;
    content += `NASKAH SOAL UJIAN - ${siteSettings.schoolName.toUpperCase()}\n`;
    content += `Mata Pelajaran : ${sub?.name || '-'}\n`;
    content += `Kelas          : ${cls?.name || '-'}\n`;
    content += `Tipe Soal      : ${pkg.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay / Uraian'}\n`;
    content += `Tahun Ajaran   : ${academicYear}\n`;
    content += `====================================================\n\n`;

    pkg.questions.forEach((q, idx) => {
      content += `${idx + 1}. ${q.text}\n`;
      if (pkg.type === 'multiple_choice') {
        content += `   A. ${q.optionA || '-'}\n`;
        content += `   B. ${q.optionB || '-'}\n`;
        content += `   C. ${q.optionC || '-'}\n`;
        content += `   D. ${q.optionD || '-'}\n`;
        content += `   [Kunci Jawaban: ${q.correctAnswer || '-'}]\n`;
      }
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Naskah_Soal_${(sub?.name || 'Ujian').replace(/\s+/g, '_')}_Kelas_${cls?.name || 'All'}.txt`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Exam Sheet to PDF
  const handleDownloadExamPdf = async (pkg: ExamQuestionsPackage) => {
    if (!examSheetContainerRef.current || isExportingPdf) return;
    const sheets = Array.from(
      examSheetContainerRef.current.querySelectorAll('.printable-sheet')
    ) as HTMLElement[];
    if (sheets.length === 0) return;

    const sub = subjects.find((s) => s.id === pkg.subjectId);
    const cls = classes.find((c) => c.id === pkg.classId);
    const filename = `Soal_${(sub?.name || 'Ujian').replace(/\s+/g, '_')}_Kelas_${cls?.name || ''}`;

    setIsExportingPdf(true);
    showToast(`Menyusun PDF Naskah Soal (${reportStyles.paperSize})...`, 'info');
    try {
      await exportElementsToPdf(sheets, filename, {
        paperSize: reportStyles.paperSize,
        orientation: reportStyles.orientation,
        marginSize: reportStyles.marginSize,
        quality: reportStyles.pdfQuality,
        singlePageFit: reportStyles.singlePageFit,
      });
      showToast(`PDF Naskah Soal "${filename}.pdf" berhasil diunduh!`, 'success');
    } catch (err) {
      showToast('Gagal mengunduh PDF.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintExamSheet = async (pkg: ExamQuestionsPackage) => {
    if (!examSheetContainerRef.current) return;
    const sheets = Array.from(
      examSheetContainerRef.current.querySelectorAll('.printable-sheet')
    ) as HTMLElement[];
    if (sheets.length === 0) return;
    const sub = subjects.find((s) => s.id === pkg.subjectId);
    await printElementsInIsolatedFrame(sheets, `Naskah Soal ${sub?.name || ''}`, {
      paperSize: reportStyles.paperSize,
      orientation: reportStyles.orientation,
      marginSize: reportStyles.marginSize,
    });
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header & Actions */}
      <div
        className={`bg-white ${radius.card} border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileQuestion className={`w-5 h-5 ${themeClasses.primaryText}`} />
            <span>Bank Soal, Naskah Ujian & Cetak Lembar Soal PDF</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola penuh (Tambah, Edit, Duplikat, Hapus, Simulasi & Cetak PDF) paket soal pilihan ganda, essay, dan berkas ujian.
          </p>
        </div>

        {/* Precision Action Buttons */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsPdfSettingsOpen(true)}
            className={`btn-precision w-full sm:w-auto ${themeClasses.primaryLightBg} hover:opacity-90 ${themeClasses.primaryText} border ${themeClasses.primaryBorder} shadow-2xs`}
            title="Atur format PDF & Kop 2 Gambar (Kiri & Kanan)"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span>Atur PDF & Kop</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateFile}
            className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>Upload Berkas</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreatePackage}
            className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`}
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Buat Soal</span>
          </button>
        </div>
      </div>

      {/* Precision Filter Bar */}
      <div
        className={`bg-white ${radius.card} border border-slate-200 p-3.5 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3`}
      >
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 flex-1">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
            <Filter className={`w-4 h-4 ${themeClasses.primaryText}`} />
            <span>Filter:</span>
          </div>

          <div className="grid grid-cols-2 sm:contents gap-2">
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="filter-control w-full sm:w-auto"
            >
              <option value="">Semua Kelas ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {cls.name}
                </option>
              ))}
            </select>

            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="filter-control w-full sm:w-auto"
            >
              <option value="">Semua Mapel ({subjects.length})</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] sm:max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari mapel atau isi pertanyaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-control w-full pl-8"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="filter-group grid grid-cols-3 sm:inline-flex w-full sm:w-auto">
            {[
              { id: 'all', label: 'Semua', count: examFiles.length + examPackages.length },
              { id: 'questions', label: 'Paket Soal', count: examPackages.length },
              { id: 'file', label: 'Berkas', count: examFiles.length },
            ].map((tp) => {
              const active = filterType === tp.id;
              return (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => setFilterType(tp.id as any)}
                  className={`filter-btn w-full sm:w-auto ${
                    active
                      ? `${themeClasses.primary} text-white shadow-2xs`
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tp.label}</span>
                  <span
                    className={`filter-badge ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tp.count}
                  </span>
                </button>
              );
            })}
          </div>

          {(filterClassId || filterSubjectId || searchQuery || filterType !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setFilterClassId('');
                setFilterSubjectId('');
                setSearchQuery('');
                setFilterType('all');
              }}
              className="filter-reset-btn w-full sm:w-auto"
            >
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Total Result Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Menampilkan <strong>{filteredExamPackages.length}</strong> paket soal interaktif &{' '}
          <strong>{filteredExamFiles.length}</strong> berkas naskah ujian
        </span>
      </div>

      {/* EXAMS LIST */}
      <div className="space-y-5">
        {/* SECTION 1: INTERACTIVE QUESTION PACKAGES */}
        {filteredExamPackages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileQuestion className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
              <span>Paket Soal Ujian Mandiri ({filteredExamPackages.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredExamPackages.map((pkg) => {
                const sub = subjects.find((s) => s.id === pkg.subjectId);
                const cls = classes.find((c) => c.id === pkg.classId);
                const isMC = pkg.type === 'multiple_choice';

                return (
                  <div
                    key={pkg.id}
                    className={`p-4 ${radius.card} border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md border ${
                            isMC
                              ? `${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.primaryBorder}`
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isMC ? 'Pilihan Ganda (A-D)' : 'Soal Essay / Uraian'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {pkg.createdAt}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        Ujian {sub?.name || 'Mata Pelajaran'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Kelas:{' '}
                        <span className="font-semibold text-slate-800">
                          Kelas {cls?.name || '-'}
                        </span>{' '}
                        · Jumlah:{' '}
                        <span className={`font-bold ${themeClasses.primaryText} tabular-nums`}>
                          {pkg.questions.length} Butir Soal
                        </span>
                      </p>

                      <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                        <span className="font-bold text-slate-700">Contoh Soal #1: </span>
                        {pkg.questions[0]?.text || 'Belum ada pertanyaan...'}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2 text-xs">
                      <div className="grid grid-cols-3 sm:flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePackageId(pkg.id);
                            setInlineEditingQuestion(null);
                            setIsAddingInlineQuestion(false);
                          }}
                          className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80"
                          title="Lihat & kelola daftar butir soal"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Butir Soal</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditPackage(pkg)}
                          className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
                          title="Edit Paket Soal"
                        >
                          <Edit2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSimulationPackage(pkg);
                            setSimAnswers({});
                            setSimSubmitted(false);
                          }}
                          className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
                          title="Uji coba kerjakan soal"
                        >
                          <Play className="w-3.5 h-3.5 shrink-0" />
                          <span>Simulasi</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPrintPreviewPkgId(pkg.id);
                            setIncludeAnswerKeyInPdf(false);
                          }}
                          className={`btn-precision flex-1 sm:flex-none ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs`}
                          title="Cetak atau Unduh PDF Naskah Soal"
                        >
                          <Printer className="w-3.5 h-3.5 shrink-0" />
                          <span>Cetak PDF</span>
                        </button>

                        {confirmDeletePkgId === pkg.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                deleteExamPackage(pkg.id);
                                setConfirmDeletePkgId(null);
                              }}
                              className="btn-precision bg-rose-600 hover:bg-rose-700 text-white"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePkgId(null)}
                              className="btn-precision bg-slate-200 hover:bg-slate-300 text-slate-700"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePkgId(pkg.id)}
                            className="h-9 w-9 shrink-0 inline-flex items-center justify-center text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200/70 sm:border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            title="Hapus Paket Soal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: UPLOADED FILES */}
        {filteredExamFiles.length > 0 && (
          <div className="space-y-3 pt-1">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className={`w-3.5 h-3.5 ${themeClasses.primaryText}`} />
              <span>Berkas Naskah Soal Terunggah ({filteredExamFiles.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredExamFiles.map((file) => {
                const sub = subjects.find((s) => s.id === file.subjectId);
                const cls = classes.find((c) => c.id === file.classId);

                return (
                  <div
                    key={file.id}
                    className={`p-4 ${radius.card} border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-1.5">
                        <span
                          className={`text-[10px] uppercase font-bold ${themeClasses.badgeBg} ${themeClasses.badgeText} px-2.5 py-0.5 rounded-md border ${themeClasses.primaryBorder}`}
                        >
                          Berkas Dokumen
                        </span>
                        <span className="text-[11px] text-slate-400">{file.uploadDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {file.title || file.fileName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Mapel:{' '}
                        <span className="font-semibold text-slate-800">{sub?.name || '-'}</span> ·
                        Kelas:{' '}
                        <span className="font-semibold text-slate-800">
                          Kelas {cls?.name || '-'}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Nama File: <span className="font-mono text-slate-600">{file.fileName}</span>{' '}
                        ({file.fileSize})
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="grid grid-cols-2 sm:flex items-center gap-1.5 flex-1 sm:flex-none">
                        <button
                          type="button"
                          onClick={() => {
                            const content = `DOKUMEN NASKAH UJIAN - ${siteSettings.schoolName}\nJudul: ${file.title || file.fileName}\nMata Pelajaran: ${sub?.name || '-'}\nKelas: ${cls?.name || '-'}\nTanggal Unggah: ${file.uploadDate}\n`;
                            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.fileName || 'naskah_ujian.txt';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            showToast(`Mengunduh berkas "${file.fileName}"...`, 'info');
                          }}
                          className={`btn-precision w-full sm:w-auto ${themeClasses.primaryLightBg} ${themeClasses.primaryText} border ${themeClasses.primaryBorder}`}
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span>Unduh</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditFile(file)}
                          className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
                        >
                          <Edit2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Edit</span>
                        </button>
                      </div>

                      {confirmDeleteFileId === file.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              deleteExamFile(file.id);
                              setConfirmDeleteFileId(null);
                            }}
                            className="btn-precision bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteFileId(null)}
                            className="btn-precision bg-slate-200 hover:bg-slate-300 text-slate-700"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteFileId(file.id)}
                          className="h-9 w-9 shrink-0 inline-flex items-center justify-center text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200/70 sm:border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Berkas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredExamFiles.length === 0 && filteredExamPackages.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              Tidak ada paket soal atau berkas pada filter ini
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Gunakan tombol "Buat Paket Soal Baru" atau "Upload Berkas Naskah" di kanan atas untuk menambahkan bank soal.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: UPLOAD / EDIT FILE NASKAH UJIAN */}
      {/* ============================================================ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingFileId !== null ? 'Edit Berkas Naskah Ujian' : 'Upload Berkas Naskah Ujian'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setEditingFileId(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={uploadSubjectId}
                  onChange={(e) => setUploadSubjectId(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl font-medium focus:outline-none"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={uploadClassId}
                  onChange={(e) => setUploadClassId(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl font-medium focus:outline-none"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Kelas {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul / Deskripsi Naskah Ujian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Naskah UAS Fiqih Semester Ganjil"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Berkas dari Perangkat (.pdf, .doc, .docx)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFileName(f.name);
                      const kb = Math.max(1, Math.round(f.size / 1024));
                      setUploadFileSize(
                        kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
                      );
                      if (!uploadTitle.trim()) {
                        setUploadTitle(f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
                      }
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-xl p-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Berkas Tersimpan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Soal_UAS_Fiqih_7A.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setEditingFileId(null);
                  }}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`h-9 px-5 ${themeClasses.primary} ${themeClasses.primaryHover} text-white text-xs font-bold rounded-xl shadow-xs`}
                >
                  {editingFileId !== null ? 'Simpan Perubahan' : 'Simpan & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CREATE / EDIT QUESTIONS PACKAGE MODAL */}
      {/* ============================================================ */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingPackageId !== null
                    ? 'Edit Paket Soal Ujian'
                    : 'Buat Paket Soal Ujian Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Susun pertanyaan, duplikat, urutkan nomor, dan tentukan kunci jawaban.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQuestionModal(false);
                  setEditingPackageId(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSavePackageSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={questionSubjectId}
                    onChange={(e) => setQuestionSubjectId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={questionClassId}
                    onChange={(e) => setQuestionClassId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Kelas {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipe Soal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none"
                  >
                    <option value="multiple_choice">Pilihan Ganda (A-D)</option>
                    <option value="essay">Essay / Uraian</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Daftar Butir Pertanyaan ({questionList.length} Soal)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionItem}
                    className={`h-8 px-3 ${themeClasses.primaryLightBg} ${themeClasses.primaryText} border ${themeClasses.primaryBorder} font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer leading-none`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Soal</span>
                  </button>
                </div>

                {questionList.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 px-2.5 py-1 rounded-md bg-white border border-slate-200">
                        Butir Soal #{qIndex + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={qIndex === 0}
                          onClick={() => handleMoveQuestionItem(qIndex, 'up')}
                          className="h-7 w-7 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Geser ke Atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={qIndex === questionList.length - 1}
                          onClick={() => handleMoveQuestionItem(qIndex, 'down')}
                          className="h-7 w-7 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Geser ke Bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateQuestionItem(qIndex)}
                          className="h-7 px-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 font-semibold cursor-pointer"
                          title="Duplikat Soal Ini"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Duplikat</span>
                        </button>
                        {questionList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionItem(qIndex)}
                            className="h-7 px-2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 inline-flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      required
                      rows={2}
                      placeholder="Tuliskan teks pertanyaan ujian di sini..."
                      value={q.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestionList((prev) =>
                          prev.map((item, idx) => (idx === qIndex ? { ...item, text: val } : item))
                        );
                      }}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                    />

                    {questionType === 'multiple_choice' && (
                      <div className="space-y-2.5 pt-2 border-t border-slate-200/70">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                            const fieldName = `option${optKey}` as
                              | 'optionA'
                              | 'optionB'
                              | 'optionC'
                              | 'optionD';
                            return (
                              <div key={optKey} className="flex items-center gap-1.5">
                                <span
                                  className={`w-7 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                                    q.correctAnswer === optKey
                                      ? `${themeClasses.primary} text-white border-transparent`
                                      : 'bg-white text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {optKey}
                                </span>
                                <input
                                  type="text"
                                  required
                                  placeholder={`Teks Pilihan ${optKey}`}
                                  value={q[fieldName] || ''}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setQuestionList((prev) =>
                                      prev.map((item, idx) =>
                                        idx === qIndex ? { ...item, [fieldName]: v } : item
                                      )
                                    );
                                  }}
                                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-700">
                            Pilih Kunci Jawaban Benar:
                          </span>
                          <div className="filter-group grid grid-cols-4 sm:inline-flex w-full sm:w-auto bg-white">
                            {(['A', 'B', 'C', 'D'] as const).map((ans) => (
                              <button
                                key={ans}
                                type="button"
                                onClick={() =>
                                  setQuestionList((prev) =>
                                    prev.map((item, idx) =>
                                      idx === qIndex ? { ...item, correctAnswer: ans } : item
                                    )
                                  )
                                }
                                className={`filter-btn w-full sm:w-auto h-7 px-2.5 ${
                                  q.correctAnswer === ans
                                    ? `${themeClasses.primary} text-white`
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                Kunci {ans}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddQuestionItem}
                  className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Soal</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingPackageId(null);
                  }}
                  className="btn-precision w-full sm:w-auto text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-xs`}
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan ({questionList.length} Soal)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: DETAIL & INLINE QUESTION CRUD */}
      {/* ============================================================ */}
      {activePackageDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kelola Butir Soal: {subjects.find((s) => s.id === activePackageDetail.subjectId)?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Kelas {classes.find((c) => c.id === activePackageDetail.classId)?.name} ·{' '}
                  {activePackageDetail.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'} ·{' '}
                  {activePackageDetail.questions.length} Butir Soal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const pkg = activePackageDetail;
                    setActivePackageId(null);
                    handleOpenEditPackage(pkg);
                  }}
                  className="h-8 px-3 bg-slate-200/80 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Paket Penuh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePackageId(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Top bar to quickly add a new question directly inside Detail modal */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Daftar Pertanyaan ({activePackageDetail.questions.length} Butir)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingInlineQuestion(!isAddingInlineQuestion);
                    setInlineEditingQuestion(null);
                  }}
                  className={`h-8 px-3 ${themeClasses.primary} ${themeClasses.primaryHover} text-white rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer leading-none`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Soal Baru</span>
                </button>
              </div>

              {/* Inline Add Question Form */}
              {isAddingInlineQuestion && (
                <form
                  onSubmit={handleAddInlineQuestionSubmit}
                  className={`p-4 rounded-xl border-2 ${themeClasses.primaryBorder} ${themeClasses.primaryLightBg} space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Tambah Butir Soal #{activePackageDetail.questions.length + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingInlineQuestion(false)}
                      className="text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Tulis pertanyaan baru..."
                    value={newInlineQuestion.text}
                    onChange={(e) =>
                      setNewInlineQuestion({ ...newInlineQuestion, text: e.target.value })
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg"
                  />
                  {activePackageDetail.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                        <input
                          key={opt}
                          type="text"
                          required
                          placeholder={`Opsi ${opt}`}
                          value={(newInlineQuestion as any)[`option${opt}`]}
                          onChange={(e) =>
                            setNewInlineQuestion({
                              ...newInlineQuestion,
                              [`option${opt}`]: e.target.value,
                            })
                          }
                          className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg"
                        />
                      ))}
                      <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                        <span className="font-bold text-slate-700">Kunci Jawaban:</span>
                        <select
                          value={newInlineQuestion.correctAnswer}
                          onChange={(e) =>
                            setNewInlineQuestion({
                              ...newInlineQuestion,
                              correctAnswer: e.target.value as any,
                            })
                          }
                          className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg font-bold"
                        >
                          <option value="A">Kunci A</option>
                          <option value="B">Kunci B</option>
                          <option value="C">Kunci C</option>
                          <option value="D">Kunci D</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`h-8 px-4 ${themeClasses.primary} text-white font-bold rounded-lg`}
                    >
                      Simpan Soal Baru
                    </button>
                  </div>
                </form>
              )}

              {activePackageDetail.questions.map((q, idx) => {
                const isEditingThis = inlineEditingQuestion?.id === q.id;

                if (isEditingThis && inlineEditingQuestion) {
                  return (
                    <form
                      key={q.id}
                      onSubmit={handleSaveInlineQuestion}
                      className="p-4 rounded-xl border-2 border-slate-900 bg-slate-50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Edit Soal #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInlineEditingQuestion(null)}
                          className="text-slate-500 hover:text-slate-800 font-semibold"
                        >
                          Batal
                        </button>
                      </div>
                      <textarea
                        required
                        rows={2}
                        value={inlineEditingQuestion.text}
                        onChange={(e) =>
                          setInlineEditingQuestion({
                            ...inlineEditingQuestion,
                            text: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg"
                      />
                      {activePackageDetail.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                            <input
                              key={opt}
                              type="text"
                              required
                              placeholder={`Pilihan ${opt}`}
                              value={(inlineEditingQuestion as any)[`option${opt}`] || ''}
                              onChange={(e) =>
                                setInlineEditingQuestion({
                                  ...inlineEditingQuestion,
                                  [`option${opt}`]: e.target.value,
                                })
                              }
                              className="h-8 px-2.5 bg-white border border-slate-300 rounded-lg"
                            />
                          ))}
                          <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                            <span className="font-bold text-slate-700">Kunci Jawaban:</span>
                            <select
                              value={inlineEditingQuestion.correctAnswer || 'A'}
                              onChange={(e) =>
                                setInlineEditingQuestion({
                                  ...inlineEditingQuestion,
                                  correctAnswer: e.target.value as any,
                                })
                              }
                              className="h-8 px-2.5 bg-white border border-slate-300 rounded-lg font-bold"
                            >
                              <option value="A">Kunci A</option>
                              <option value="B">Kunci B</option>
                              <option value="C">Kunci C</option>
                              <option value="D">Kunci D</option>
                            </select>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          type="submit"
                          className={`h-8 px-4 ${themeClasses.primary} text-white font-bold rounded-lg`}
                        >
                          Simpan Soal #{idx + 1}
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                      <span className="font-bold text-slate-900">Soal #{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInlineEditingQuestion({ ...q })}
                          className="h-7 px-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {confirmDeleteQuestionId === q.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                deleteQuestionFromPackage(activePackageDetail.id, q.id);
                                setConfirmDeleteQuestionId(null);
                              }}
                              className="h-7 px-2 bg-rose-600 text-white font-bold rounded-md text-[10px]"
                            >
                              Ya, Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteQuestionId(null)}
                              className="h-7 px-2 bg-slate-200 text-slate-700 font-semibold rounded-md text-[10px]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteQuestionId(q.id)}
                            className="h-7 px-2 rounded-md bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-800 mb-2 leading-relaxed font-medium">{q.text}</p>

                    {activePackageDetail.type === 'multiple_choice' && (
                      <div
                        className={`space-y-1 text-slate-600 pl-2.5 border-l-2 ${themeClasses.primaryBorder}`}
                      >
                        <p className={q.correctAnswer === 'A' ? 'font-bold text-slate-900' : ''}>
                          A. {q.optionA}
                        </p>
                        <p className={q.correctAnswer === 'B' ? 'font-bold text-slate-900' : ''}>
                          B. {q.optionB}
                        </p>
                        <p className={q.correctAnswer === 'C' ? 'font-bold text-slate-900' : ''}>
                          C. {q.optionC}
                        </p>
                        <p className={q.correctAnswer === 'D' ? 'font-bold text-slate-900' : ''}>
                          D. {q.optionD}
                        </p>
                        <p className={`${themeClasses.primaryText} font-bold mt-1`}>
                          Kunci Jawaban: {q.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 grid grid-cols-3 sm:flex sm:flex-wrap justify-between items-center gap-2 bg-slate-50">
              <div className="contents sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTxt(activePackageDetail)}
                  className="btn-precision w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh .TXT</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = activePackageDetail.id;
                    setActivePackageId(null);
                    setPrintPreviewPkgId(id);
                  }}
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setActivePackageId(null)}
                className="btn-precision w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PRATINJAU & CETAK PDF NASKAH SOAL UJIAN RESMI */}
      {/* ============================================================ */}
      {printPreviewPkg && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 printable-card-modal">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 printable-card-modal">
            {/* Top Toolbar */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau & Cetak PDF Naskah Soal Ujian ({reportStyles.paperSize})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Siap cetak di kertas {reportStyles.paperSize} (
                  {reportStyles.orientation === 'landscape' ? 'Landscape' : 'Portrait'}) lengkap dengan Kop 2 Gambar Kiri-Kanan.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsPdfSettingsOpen(true)}
                  className={`btn-precision w-full sm:w-auto border ${themeClasses.primaryLightBg} ${themeClasses.primaryText} ${themeClasses.primaryBorder}`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span>Atur PDF & Kop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeAnswerKeyInPdf(!includeAnswerKeyInPdf)}
                  className={`btn-precision w-full sm:w-auto border ${
                    includeAnswerKeyInPdf
                      ? `${themeClasses.badgeBg} ${themeClasses.badgeText} ${themeClasses.primaryBorder}`
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${includeAnswerKeyInPdf ? 'opacity-100' : 'opacity-40'}`} />
                  <span>Kunci Jawaban</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintExamSheet(printPreviewPkg)}
                  className="btn-precision w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={() => handleDownloadExamPdf(printPreviewPkg)}
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shadow-2xs disabled:opacity-60`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Menyusun PDF...' : `PDF (${reportStyles.paperSize})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintPreviewPkgId(null)}
                  className="btn-precision w-full sm:w-auto col-span-2 sm:col-span-1 text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable Exam Sheet */}
            <div ref={examSheetContainerRef}>
              <div
                style={getPdfSheetBorderStyle(reportStyles)}
                className={`relative p-7 sm:p-10 rounded-xl bg-white text-slate-900 printable-sheet overflow-hidden ${
                  reportStyles.fontStyle === 'serif' || reportStyles.fontStyle === 'classic'
                    ? 'font-serif-report'
                    : 'font-sans'
                }`}
              >
                <PdfPageFrameOverlay reportStyles={reportStyles} />
                <div className="relative z-10">
                {/* Kop Surat Ujian Resmi (Mendukung 2 Gambar Kiri & Kanan) */}
                <OfficialKopSurat
                  subtitlePrefix={`PANITIA UJIAN SEMESTER · TA ${academicYear}`}
                />

                {/* Bismillah */}
                <div className="text-center mb-3">
                  <div className="font-serif-report text-base text-slate-800">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                  <div className="text-xs font-extrabold uppercase tracking-wider underline mt-0.5">
                    LEMBAR NASKAH SOAL UJIAN
                  </div>
                </div>

                {/* Tabel Identitas Ujian */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-300 mb-5 text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1 text-slate-600 font-medium w-[18%]">Mata Pelajaran</td>
                        <td className="py-1 w-[2%]">:</td>
                        <td className="py-1 font-bold text-slate-900 w-[32%]">
                          {subjects.find((s) => s.id === printPreviewPkg.subjectId)?.name || '-'}
                        </td>
                        <td className="py-1 text-slate-600 font-medium w-[18%]">Nama Santri</td>
                        <td className="py-1 w-[2%]">:</td>
                        <td className="py-1 text-slate-700 w-[28%]">...........................................</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600 font-medium">Kelas / Rombel</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-bold text-slate-900">
                          Kelas {classes.find((c) => c.id === printPreviewPkg.classId)?.name || '-'}
                        </td>
                        <td className="py-1 text-slate-600 font-medium">Nomor Ujian / NIS</td>
                        <td className="py-1">:</td>
                        <td className="py-1 text-slate-700">...........................................</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-600 font-medium">Bentuk & Jumlah</td>
                        <td className="py-1">:</td>
                        <td className="py-1 font-semibold text-slate-800">
                          {printPreviewPkg.type === 'multiple_choice'
                            ? 'Pilihan Ganda'
                            : 'Essay / Uraian'}{' '}
                          ({printPreviewPkg.questions.length} Soal)
                        </td>
                        <td className="py-1 text-slate-600 font-medium">Hari / Tanggal</td>
                        <td className="py-1">:</td>
                        <td className="py-1 text-slate-700">{printPreviewPkg.createdAt}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Petunjuk */}
                <div className="mb-4 text-[11px] text-slate-700 italic border-b border-slate-200 pb-2">
                  <strong>Petunjuk Umum:</strong> Bacalah Basmalah sebelum memulai ujian. Kerjakan soal dengan jujur, teliti, dan mandiri.
                </div>

                {/* Daftar Soal */}
                <div className="space-y-3.5 text-xs">
                  {printPreviewPkg.questions.map((q, idx) => (
                    <div key={q.id} className="break-inside-avoid">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-slate-900 w-5 shrink-0 tabular-nums">
                          {idx + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 leading-relaxed mb-1.5">
                            {q.text}
                          </p>
                          {printPreviewPkg.type === 'multiple_choice' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-1 text-slate-800">
                              <div>A. {q.optionA}</div>
                              <div>B. {q.optionB}</div>
                              <div>C. {q.optionC}</div>
                              <div>D. {q.optionD}</div>
                            </div>
                          ) : (
                            <div className="mt-2 border-b border-dotted border-slate-300 h-6" />
                          )}
                          {includeAnswerKeyInPdf && printPreviewPkg.type === 'multiple_choice' && (
                            <div
                              className="mt-1 text-[11px] font-bold"
                              style={{ color: reportStyles.primaryHex }}
                            >
                              Kunci Jawaban: {q.correctAnswer}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: SIMULASI UJIAN (TEST TAKER PREVIEW) */}
      {/* ============================================================ */}
      {simulationPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div
              className={`p-5 border-b border-slate-100 flex items-center justify-between ${themeClasses.gradientHeader} text-white`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-white/75">
                  Mode Simulasi Ujian Interaktif Santri
                </span>
                <h3 className="text-base font-bold">
                  Ujian {subjects.find((s) => s.id === simulationPackage.subjectId)?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSimulationPackage(null)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {simulationPackage.questions.map((q, idx) => {
                const selected = simAnswers[q.id];
                const isCorrect = selected === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <span className="text-xs font-bold text-slate-900">
                      Pertanyaan #{idx + 1}
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{q.text}</p>

                    {simulationPackage.type === 'multiple_choice' ? (
                      <div className="space-y-1.5 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const optText = (q as any)[`option${opt}`];
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                selected === opt
                                  ? `${themeClasses.primaryLightBg} ${themeClasses.primaryBorder} font-semibold text-slate-900`
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`sim-q-${q.id}`}
                                disabled={simSubmitted}
                                checked={selected === opt}
                                onChange={() =>
                                  setSimAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                }
                              />
                              <span>
                                {opt}. {optText}
                              </span>
                            </label>
                          );
                        })}

                        {simSubmitted && (
                          <div className="mt-2 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-white border border-slate-200">
                            {isCorrect ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Jawaban Anda Benar (
                                {q.correctAnswer})
                              </span>
                            ) : (
                              <span className="text-rose-700">
                                Jawaban Kurang Tepat. Kunci jawaban benar: {q.correctAnswer}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        rows={2}
                        disabled={simSubmitted}
                        placeholder="Ketikkan jawaban essay santri di sini..."
                        value={selected || ''}
                        onChange={(e) =>
                          setSimAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {Object.keys(simAnswers).length} dari {simulationPackage.questions.length} soal
                terjawab
              </span>

              <div className="flex items-center gap-2">
                {!simSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setSimSubmitted(true)}
                    className={`btn-precision ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                  >
                    Periksa Jawaban
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSimSubmitted(false);
                      setSimAnswers({});
                    }}
                    className="btn-precision bg-slate-200 hover:bg-slate-300 text-slate-700"
                  >
                    Ulangi
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSimulationPackage(null)}
                  className="btn-precision bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PENGATURAN PDF & KOP SURAT (2 GAMBAR KIRI-KANAN) */}
      <PdfSettingsModal
        isOpen={isPdfSettingsOpen}
        onClose={() => setIsPdfSettingsOpen(false)}
      />
    </div>
  );
};
