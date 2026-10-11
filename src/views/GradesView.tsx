import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Grade, TahfidzGrade } from '../types';
import { getRadiusClass } from '../utils/theme';
import {
  GraduationCap,
  BookOpen,
  Save,
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';

export const GradesView: React.FC = () => {
  const {
    currentView,
    subjects,
    classes,
    students,
    grades,
    tahfidzGrades,
    saveBulkGrades,
    updateGrade,
    deleteGrade,
    saveBulkTahfidz,
    updateTahfidzGrade,
    deleteTahfidzGrade,
    setCurrentView,
    academicYear,
    themeClasses,
    themeSettings,
    addToast,
  } = useApp();

  const radius = getRadiusClass(themeSettings.borderRadius);

  // Main Section Tab: 'academic' (Nilai Mapel) vs 'tahfidz' (Hafalan Al-Quran) vs 'combined' (Ringkasan Terpadu)
  const [mainTab, setMainTab] = useState<'academic' | 'tahfidz' | 'combined'>(() =>
    currentView === 'tahfidz' ? 'tahfidz' : 'academic'
  );

  useEffect(() => {
    if (currentView === 'tahfidz') {
      setMainTab('tahfidz');
    }
  }, [currentView]);

  // Academic State
  const [academicMode, setAcademicMode] = useState<'input' | 'view'>('input');
  const [inputSubjectId, setInputSubjectId] = useState<string>('');
  const [inputClassId, setInputClassId] = useState<string>('');
  const [inputSemester, setInputSemester] = useState<1 | 2>(1);
  const [bulkScores, setBulkScores] = useState<Record<number, string>>({});
  const [quickScoreInput, setQuickScoreInput] = useState<string>('');

  // Academic Filter State
  const [filterClassId, setFilterClassId] = useState<string>('');
  const [filterSemester, setFilterSemester] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Tahfidz State
  const [tahfidzMode, setTahfidzMode] = useState<'input' | 'view'>('input');
  const [inputTahfidzClassId, setInputTahfidzClassId] = useState<string>('');
  const [inputTahfidzSemester, setInputTahfidzSemester] = useState<1 | 2>(1);
  const [studentTahfidzRecords, setStudentTahfidzRecords] = useState<
    Record<number, { notes: string; tahfidzScore: string; tajweedScore: string }>
  >({});

  // Tahfidz Filter State
  const [tahfidzFilterClassId, setTahfidzFilterClassId] = useState<string>('');
  const [tahfidzFilterSemester, setTahfidzFilterSemester] = useState<string>('');
  const [tahfidzSearch, setTahfidzSearch] = useState<string>('');

  // Combined Filter State
  const [combinedFilterClassId, setCombinedFilterClassId] = useState<string>('');
  const [combinedSearch, setCombinedSearch] = useState<string>('');

  // Modals
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
    studentId: number;
    studentName: string;
    studentNis: string;
    classId: number;
    className: string;
    semester: 1 | 2;
    grades: Array<Grade & { subjectName: string }>;
  } | null>(null);

  const [editingGrade, setEditingGrade] = useState<{
    id: number;
    subjectName: string;
    studentName: string;
    currentScore: number;
  } | null>(null);
  const [newEditScore, setNewEditScore] = useState<string>('');

  const [tahfidzDetailModal, setTahfidzDetailModal] = useState<{
    grade: TahfidzGrade;
    studentName: string;
    studentNis: string;
    className: string;
  } | null>(null);

  const [editingTahfidzItem, setEditingTahfidzItem] = useState<{
    id: number;
    studentName: string;
    className: string;
    tahfidzScore: number;
    tajweedScore: number;
    notes: string;
    testDate: string;
  } | null>(null);

  const [confirmDeleteGradeId, setConfirmDeleteGradeId] = useState<number | null>(null);
  const [confirmDeleteTahfidzId, setConfirmDeleteTahfidzId] = useState<number | null>(null);
  const [addingSingleSubjectId, setAddingSingleSubjectId] = useState<string>('');
  const [addingSingleScore, setAddingSingleScore] = useState<string>('');

  // 1. ACADEMIC STUDENTS FOR INPUT
  const classStudentsForInput = useMemo(() => {
    if (!inputClassId) return [];
    return students.filter((s) => s.classId === parseInt(inputClassId, 10));
  }, [students, inputClassId]);

  const handleLoadClassForInput = (clsId: string) => {
    setInputClassId(clsId);
    if (!clsId || !inputSubjectId) return;

    const matched = grades.filter(
      (g) =>
        g.classId === parseInt(clsId, 10) &&
        g.subjectId === parseInt(inputSubjectId, 10) &&
        g.semester === inputSemester
    );

    const initialMap: Record<number, string> = {};
    matched.forEach((g) => {
      initialMap[g.studentId] = g.score.toString();
    });
    setBulkScores(initialMap);
  };

  const handleSubjectChange = (subId: string) => {
    setInputSubjectId(subId);
    if (!inputClassId || !subId) return;

    const matched = grades.filter(
      (g) =>
        g.classId === parseInt(inputClassId, 10) &&
        g.subjectId === parseInt(subId, 10) &&
        g.semester === inputSemester
    );

    const initialMap: Record<number, string> = {};
    matched.forEach((g) => {
      initialMap[g.studentId] = g.score.toString();
    });
    setBulkScores(initialMap);
  };

  const handleSemesterChange = (sem: 1 | 2) => {
    setInputSemester(sem);
    if (!inputClassId || !inputSubjectId) return;

    const matched = grades.filter(
      (g) =>
        g.classId === parseInt(inputClassId, 10) &&
        g.subjectId === parseInt(inputSubjectId, 10) &&
        g.semester === sem
    );

    const initialMap: Record<number, string> = {};
    matched.forEach((g) => {
      initialMap[g.studentId] = g.score.toString();
    });
    setBulkScores(initialMap);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSubjectId || !inputClassId) return;

    const numericMap: Record<number, number> = {};
    Object.entries(bulkScores).forEach(([sId, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0 && num <= 100) {
        numericMap[parseInt(sId, 10)] = num;
      }
    });

    saveBulkGrades(
      parseInt(inputSubjectId, 10),
      parseInt(inputClassId, 10),
      inputSemester,
      numericMap
    );
  };

  const applyQuickFill = () => {
    const val = parseFloat(quickScoreInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    const newMap: Record<number, string> = {};
    classStudentsForInput.forEach((s) => {
      newMap[s.id] = quickScoreInput;
    });
    setBulkScores(newMap);
  };

  // 2. TAHFIDZ STUDENTS FOR INPUT
  const classStudentsForTahfidz = useMemo(() => {
    if (!inputTahfidzClassId) return [];
    return students.filter((s) => s.classId === parseInt(inputTahfidzClassId, 10));
  }, [students, inputTahfidzClassId]);

  const handleTahfidzClassSelect = (clsId: string) => {
    setInputTahfidzClassId(clsId);
    if (!clsId) return;

    const matched = tahfidzGrades.filter(
      (t) => t.classId === parseInt(clsId, 10) && t.semester === inputTahfidzSemester
    );

    const initialMap: typeof studentTahfidzRecords = {};
    matched.forEach((t) => {
      initialMap[t.studentId] = {
        notes: t.notes,
        tahfidzScore: t.tahfidzScore.toString(),
        tajweedScore: t.tajweedScore.toString(),
      };
    });
    setStudentTahfidzRecords(initialMap);
  };

  const handleTahfidzSemesterChange = (sem: 1 | 2) => {
    setInputTahfidzSemester(sem);
    if (!inputTahfidzClassId) return;

    const matched = tahfidzGrades.filter(
      (t) => t.classId === parseInt(inputTahfidzClassId, 10) && t.semester === sem
    );

    const initialMap: typeof studentTahfidzRecords = {};
    matched.forEach((t) => {
      initialMap[t.studentId] = {
        notes: t.notes,
        tahfidzScore: t.tahfidzScore.toString(),
        tajweedScore: t.tajweedScore.toString(),
      };
    });
    setStudentTahfidzRecords(initialMap);
  };

  const handleBulkTahfidzSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTahfidzClassId) return;

    const recordsToSave: Array<{
      studentId: number;
      notes: string;
      tahfidzScore: number;
      tajweedScore: number;
    }> = [];

    Object.entries(studentTahfidzRecords).forEach(([sIdStr, record]) => {
      const studentId = parseInt(sIdStr, 10);
      const tfz = parseFloat(record.tahfidzScore);
      const tjw = parseFloat(record.tajweedScore);

      if (!isNaN(tfz) && !isNaN(tjw) && tfz >= 1 && tfz <= 90 && tjw >= 1 && tjw <= 90) {
        recordsToSave.push({
          studentId,
          notes: record.notes.trim(),
          tahfidzScore: tfz,
          tajweedScore: tjw,
        });
      }
    });

    if (recordsToSave.length === 0) {
      addToast('Masukkan minimal 1 nilai tahfidz dan tajwid (skala 1-90).', 'error');
      return;
    }

    saveBulkTahfidz(parseInt(inputTahfidzClassId, 10), inputTahfidzSemester, recordsToSave);
  };

  // Predicates
  const getGradePredicate = (score: number) => {
    if (score >= 86) return { letter: 'A', text: 'Mumtaz', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 81) return { letter: 'B', text: 'Jayyid Jiddan', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (score >= 71) return { letter: 'C', text: 'Jayyid', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (score >= 60) return { letter: 'D', text: 'Maqbul', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { letter: 'E', text: 'Risib', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  // Grouped Academic Grades
  const groupedAcademicGrades = useMemo(() => {
    const filtered = grades.filter((g) => {
      const matchClass = filterClassId ? g.classId === parseInt(filterClassId, 10) : true;
      const matchSemester = filterSemester ? g.semester === parseInt(filterSemester, 10) : true;
      return matchClass && matchSemester;
    });

    const map: Record<
      string,
      {
        studentId: number;
        studentName: string;
        studentNis: string;
        classId: number;
        className: string;
        guardian: string;
        semester: 1 | 2;
        grades: Array<Grade & { subjectName: string }>;
        total: number;
        average: string;
      }
    > = {};

    filtered.forEach((g) => {
      const key = `${g.studentId}_${g.classId}_${g.semester}`;
      if (!map[key]) {
        const st = students.find((s) => s.id === g.studentId);
        const cls = classes.find((c) => c.id === g.classId);
        map[key] = {
          studentId: g.studentId,
          studentName: st ? st.name : `Siswa #${g.studentId}`,
          studentNis: st?.nis || '-',
          classId: g.classId,
          className: cls ? cls.name : `Kelas #${g.classId}`,
          guardian: st?.guardian || '-',
          semester: g.semester,
          grades: [],
          total: 0,
          average: '0.0',
        };
      }

      const sub = subjects.find((s) => s.id === g.subjectId);
      map[key].grades.push({
        ...g,
        subjectName: sub ? sub.name : `Mapel #${g.subjectId}`,
      });
    });

    const results = Object.values(map)
      .map((entry) => {
        const total = entry.grades.reduce((sum, g) => sum + g.score, 0);
        const avg = entry.grades.length > 0 ? (total / entry.grades.length).toFixed(1) : '0.0';
        return { ...entry, total, average: avg };
      })
      .filter((entry) => {
        if (!searchStudent.trim()) return true;
        const q = searchStudent.toLowerCase();
        return (
          entry.studentName.toLowerCase().includes(q) ||
          entry.studentNis.toLowerCase().includes(q)
        );
      });

    // Group results by Class & Semester
    const classGroups: Record<
      string,
      {
        className: string;
        semester: 1 | 2;
        students: typeof results;
        classAverage: string;
      }
    > = {};

    results.forEach((r) => {
      const gKey = `${r.className}_${r.semester}`;
      if (!classGroups[gKey]) {
        classGroups[gKey] = {
          className: r.className,
          semester: r.semester,
          students: [],
          classAverage: '0.0',
        };
      }
      classGroups[gKey].students.push(r);
    });

    Object.values(classGroups).forEach((cg) => {
      const allAvgs = cg.students.map((s) => parseFloat(s.average));
      const mean =
        allAvgs.length > 0 ? (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1) : '0.0';
      cg.classAverage = mean;
      cg.students.sort((a, b) => a.studentName.localeCompare(b.studentName));
    });

    return Object.values(classGroups);
  }, [grades, filterClassId, filterSemester, searchStudent, students, classes, subjects]);

  // Grouped Tahfidz Grades
  const groupedTahfidzGrades = useMemo(() => {
    const filtered = tahfidzGrades.filter((t) => {
      const matchClass = tahfidzFilterClassId ? t.classId === parseInt(tahfidzFilterClassId, 10) : true;
      const matchSemester = tahfidzFilterSemester ? t.semester === parseInt(tahfidzFilterSemester, 10) : true;
      return matchClass && matchSemester;
    });

    const enriched = filtered.map((t) => {
      const st = students.find((s) => s.id === t.studentId);
      const cls = classes.find((c) => c.id === t.classId);
      return {
        ...t,
        studentName: st ? st.name : `Siswa #${t.studentId}`,
        studentNis: st?.nis || '-',
        className: cls ? cls.name : `Kelas #${t.classId}`,
      };
    });

    const searched = enriched.filter((item) => {
      if (!tahfidzSearch.trim()) return true;
      const q = tahfidzSearch.toLowerCase();
      return (
        item.studentName.toLowerCase().includes(q) ||
        item.studentNis.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      );
    });

    const groups: Record<
      string,
      {
        className: string;
        semester: 1 | 2;
        items: typeof searched;
        classAverage: string;
      }
    > = {};

    searched.forEach((item) => {
      const key = `${item.className}_${item.semester}`;
      if (!groups[key]) {
        groups[key] = {
          className: item.className,
          semester: item.semester,
          items: [],
          classAverage: '0.0',
        };
      }
      groups[key].items.push(item);
    });

    Object.values(groups).forEach((g) => {
      const total = g.items.reduce((sum, i) => sum + i.totalScore, 0);
      g.classAverage = g.items.length > 0 ? (total / g.items.length).toFixed(1) : '0.0';
      g.items.sort((a, b) => a.studentName.localeCompare(b.studentName));
    });

    return Object.values(groups);
  }, [tahfidzGrades, tahfidzFilterClassId, tahfidzFilterSemester, tahfidzSearch, students, classes]);

  // Integrated Overview (Combined Tab)
  const combinedSummary = useMemo(() => {
    return students
      .filter((st) => {
        const matchClass = combinedFilterClassId
          ? st.classId === parseInt(combinedFilterClassId, 10)
          : true;
        const q = combinedSearch.trim().toLowerCase();
        const matchSearch = q
          ? st.name.toLowerCase().includes(q) || st.nis.toLowerCase().includes(q)
          : true;
        return matchClass && matchSearch;
      })
      .map((st) => {
        const cls = classes.find((c) => c.id === st.classId);
        const studentGrades = grades.filter((g) => g.studentId === st.id);
        const studentTahfidz = tahfidzGrades.find((t) => t.studentId === st.id);

        const totalAcademic = studentGrades.reduce((sum, g) => sum + g.score, 0);
        const avgAcademic =
          studentGrades.length > 0 ? (totalAcademic / studentGrades.length).toFixed(1) : '-';

        return {
          student: st,
          className: cls ? cls.name : '-',
          academicCount: studentGrades.length,
          academicAverage: avgAcademic,
          tahfidzGrade: studentTahfidz,
        };
      });
  }, [students, classes, grades, tahfidzGrades, combinedFilterClassId, combinedSearch]);

  // CSV Export for Academic Grades
  const handleExportCSV = () => {
    let csv = 'NIS,Nama Siswa,Kelas,Semester,Mata Pelajaran,Nilai,Predikat\n';
    groupedAcademicGrades.forEach((group) => {
      group.students.forEach((st) => {
        st.grades.forEach((g) => {
          const pred = getGradePredicate(g.score);
          csv += `"${st.studentNis}","${st.studentName}","${st.className}","${st.semester}","${g.subjectName}",${g.score},"${pred.letter}"\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_nilai_santri_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Integrated Domain Switcher */}
      <div className={`bg-white ${radius.card} border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className={`w-5 h-5 ${themeClasses.primaryText}`} />
            <span>Pusat Penilaian Terpadu Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan menyeluruh nilai mata pelajaran akademik dan hafalan tahfidz Al-Qur'an dalam satu pintu.
          </p>
        </div>

        {/* 3 Main Categories (Integrated Tabs) */}
        <div className="filter-group grid grid-cols-3 sm:inline-flex w-full md:w-auto">
          <button
            type="button"
            onClick={() => setMainTab('academic')}
            className={`filter-btn w-full sm:w-auto ${
              mainTab === 'academic'
                ? `${themeClasses.primary} text-white shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-current shrink-0" />
            <span className="sm:hidden">Akademik</span>
            <span className="hidden sm:inline">Nilai Akademik</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('tahfidz')}
            className={`filter-btn w-full sm:w-auto ${
              mainTab === 'tahfidz'
                ? `${themeClasses.primary} text-white shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Tahfidz</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('combined')}
            className={`filter-btn w-full sm:w-auto ${
              mainTab === 'combined'
                ? `${themeClasses.primary} text-white shadow-2xs`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Ringkasan</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: NILAI AKADEMIK (MATA PELAJARAN) */}
      {/* ============================================================ */}
      {mainTab === 'academic' && (
        <div className="space-y-5">
          {/* Sub Navigation: Input vs Rekap */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="filter-group grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setAcademicMode('input')}
                className={`filter-btn w-full sm:w-auto ${
                  academicMode === 'input'
                    ? `${themeClasses.primary} text-white shadow-2xs`
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5 text-current shrink-0" />
                <span>Input Nilai</span>
              </button>
              <button
                type="button"
                onClick={() => setAcademicMode('view')}
                className={`filter-btn w-full sm:w-auto ${
                  academicMode === 'view'
                    ? `${themeClasses.primary} text-white shadow-2xs`
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-current shrink-0" />
                <span>Rekap Kelas</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline px-2">
              Tahun Ajaran: <strong className="text-slate-800">{academicYear}</strong>
            </span>
          </div>

          {/* Form Input Massal */}
          {academicMode === 'input' && (
            <div className={`bg-white ${radius.card} border border-slate-200 p-6 shadow-xs`}>
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Formulir Pengisian Nilai Mata Pelajaran</span>
                <span className="text-[11px] font-normal text-slate-500">Skala 0 - 90</span>
              </h2>

              <form onSubmit={handleBulkSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mata Pelajaran <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={inputSubjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 ${radius.input} text-xs font-medium text-slate-800 focus:outline-none`}
                    >
                      <option value="">-- Pilih Mata Pelajaran --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Kelas <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={inputClassId}
                      onChange={(e) => handleLoadClassForInput(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 ${radius.input} text-xs font-medium text-slate-800 focus:outline-none`}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={inputSemester}
                      onChange={(e) => handleSemesterChange(parseInt(e.target.value, 10) as 1 | 2)}
                      required
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 ${radius.input} text-xs font-medium text-slate-800 focus:outline-none`}
                    >
                      <option value="1">Semester 1 (Ganjil)</option>
                      <option value="2">Semester 2 (Genap)</option>
                    </select>
                  </div>
                </div>

                {inputClassId && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Daftar Santri ({classStudentsForInput.length} santri)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Nilai otomatis disimpan ke database nilai rapor santri.
                        </p>
                      </div>

                      {/* Quick Fill Tool */}
                      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="number"
                          min="0"
                          max="90"
                          placeholder="Nilai cepat"
                          value={quickScoreInput}
                          onChange={(e) => setQuickScoreInput(e.target.value)}
                          className="filter-control w-full sm:w-28 text-center tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={applyQuickFill}
                          className="btn-precision w-full sm:w-auto text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>

                    {classStudentsForInput.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500 border border-dashed rounded-xl">
                        Belum ada santri di kelas ini.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {classStudentsForInput.map((st, idx) => {
                          const val = bulkScores[st.id] || '';
                          const numVal = parseFloat(val);
                          const pred = !isNaN(numVal) ? getGradePredicate(numVal) : null;

                          return (
                            <div
                              key={st.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-slate-400 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-5 text-slate-400 font-semibold text-xs tabular-nums">
                                  {idx + 1}.
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                                  <span className="text-[11px] text-slate-500">NIS: {st.nis || '-'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {pred && (
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums border ${pred.color}`}>
                                    {pred.letter}
                                  </span>
                                )}
                                <input
                                  type="number"
                                  min="0"
                                  max="90"
                                  step="0.5"
                                  placeholder="0-90"
                                  value={val}
                                  onChange={(e) =>
                                    setBulkScores((prev) => ({
                                      ...prev,
                                      [st.id]: e.target.value,
                                    }))
                                  }
                                  className="w-24 h-9 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center tabular-nums focus:outline-none"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {classStudentsForInput.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white px-5 ${radius.button} shadow-xs`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Nilai ({classStudentsForInput.length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Rekapitulasi Akademik */}
          {academicMode === 'view' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className={`bg-white ${radius.card} border border-slate-200 p-3.5 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3`}>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 flex-1">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
                    <Filter className={`w-4 h-4 ${themeClasses.primaryText}`} />
                    <span>Filter:</span>
                  </div>

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

                  <div className="filter-group grid grid-cols-3 sm:inline-flex w-full sm:w-auto">
                    {[
                      { id: '', label: 'Semua' },
                      { id: '1', label: 'Semester 1' },
                      { id: '2', label: 'Semester 2' },
                    ].map((sem) => {
                      const active = filterSemester === sem.id;
                      return (
                        <button
                          key={sem.id}
                          type="button"
                          onClick={() => setFilterSemester(sem.id)}
                          className={`filter-btn w-full sm:w-auto ${
                            active
                              ? `${themeClasses.primary} text-white shadow-2xs`
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{sem.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex-1 min-w-[180px] sm:max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari santri / NIS..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="filter-control w-full pl-8"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {(filterClassId || filterSemester || searchStudent) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterClassId('');
                        setFilterSemester('');
                        setSearchStudent('');
                      }}
                      className="filter-reset-btn flex-1 sm:flex-none"
                    >
                      <span>Reset</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="btn-precision flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-current shrink-0" />
                    <span>Ekspor CSV</span>
                  </button>
                </div>
              </div>

              {groupedAcademicGrades.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800">Tidak ada data nilai akademik</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Gunakan tab form input nilai untuk memasukkan nilai santri.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedAcademicGrades.map((group, gIdx) => (
                    <div key={gIdx} className={`bg-white ${radius.card} border border-slate-200 overflow-hidden shadow-xs`}>
                      <div className={`bg-gradient-to-r ${themeClasses.gradientHeader} text-white px-5 py-3.5 flex items-center justify-between`}>
                        <div>
                          <h3 className="text-sm font-bold flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-current opacity-85" />
                            <span>Kelas {group.className} · Semester {group.semester}</span>
                          </h3>
                          <span className="text-[11px] text-slate-300">
                            {group.students.length} santri terdata
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-white tabular-nums">
                            {group.classAverage}
                          </span>
                          <span className="text-[10px] text-slate-300 block">Rata-rata Kelas</span>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.students.map((st) => (
                          <div
                            key={st.studentId}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{st.studentName}</h4>
                                <p className="text-[11px] text-slate-500">
                                  NIS: {st.studentNis} · Wali: {st.guardian}
                                </p>
                                <span className="inline-block mt-1 text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                                  {st.grades.length} mata pelajaran dinilai
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-base font-extrabold text-slate-900 tabular-nums">
                                  {st.average}
                                </div>
                                <span className="text-[10px] text-slate-400">Rata-rata</span>
                              </div>
                            </div>

                            <div className="pt-2 mt-1 border-t border-slate-200/80 flex items-center justify-between text-xs">
                              <button
                                onClick={() => setSelectedStudentDetail(st)}
                                className={`btn-precision-sm ${themeClasses.primaryLightBg} ${themeClasses.primaryText} border ${themeClasses.primaryBorder}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Rincian</span>
                              </button>

                              <button
                                onClick={() => setCurrentView('reports')}
                                className="btn-precision-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                <span>Rapor</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: TAHFIDZ & HAFALAN AL-QUR'AN */}
      {/* ============================================================ */}
      {mainTab === 'tahfidz' && (
        <div className="space-y-5">
          {/* Sub Navigation: Input vs Rekap Tahfidz */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="filter-group grid grid-cols-2 sm:inline-flex w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setTahfidzMode('input')}
                className={`filter-btn w-full sm:w-auto ${
                  tahfidzMode === 'input'
                    ? `${themeClasses.primary} text-white shadow-2xs`
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-current shrink-0" />
                <span>Input Tahfidz</span>
              </button>
              <button
                type="button"
                onClick={() => setTahfidzMode('view')}
                className={`filter-btn w-full sm:w-auto ${
                  tahfidzMode === 'view'
                    ? `${themeClasses.primary} text-white shadow-2xs`
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-current shrink-0" />
                <span>Rekap Tahfidz</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline px-2">
              Standar Hafalan: <strong>Mutqin (1-100)</strong>
            </span>
          </div>

          {/* Form Input Hafalan Massal */}
          {tahfidzMode === 'input' && (
            <div className={`bg-white ${radius.card} border border-slate-200 p-6 shadow-xs`}>
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Pengisian Catatan Hafalan & Penilaian Ujian Tahfidz</span>
                <span className="text-[11px] font-normal text-slate-500">Skala 1 - 90</span>
              </h2>

              <form onSubmit={handleBulkTahfidzSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Kelas <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={inputTahfidzClassId}
                      onChange={(e) => handleTahfidzClassSelect(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 ${radius.input} text-xs font-medium text-slate-800 focus:outline-none`}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={inputTahfidzSemester}
                      onChange={(e) =>
                        handleTahfidzSemesterChange(parseInt(e.target.value, 10) as 1 | 2)
                      }
                      required
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 ${radius.input} text-xs font-medium text-slate-800 focus:outline-none`}
                    >
                      <option value="1">Semester 1 (Ganjil)</option>
                      <option value="2">Semester 2 (Genap)</option>
                    </select>
                  </div>
                </div>

                {inputTahfidzClassId && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="mb-3">
                      <h3 className="text-xs font-bold text-slate-900">
                        Daftar Santri ({classStudentsForTahfidz.length} santri)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Catat juz/surat hafalan santri beserta nilai kelancaran (tahfidz) dan kaidah tajwid.
                      </p>
                    </div>

                    {classStudentsForTahfidz.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-500 border border-dashed rounded-xl">
                        Belum ada santri di kelas ini.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {classStudentsForTahfidz.map((st, idx) => {
                          const rec = studentTahfidzRecords[st.id] || {
                            notes: '',
                            tahfidzScore: '',
                            tajweedScore: '',
                          };

                          return (
                            <div
                              key={st.id}
                              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-400 transition-all space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 text-slate-400 font-semibold text-xs tabular-nums">
                                    {idx + 1}.
                                  </span>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-900">{st.name}</h4>
                                    <span className="text-[11px] text-slate-500">NIS: {st.nis || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                  Informasi Surat / Juz / Ayat yang Disetorkan
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Juz 30 (An-Naba s.d An-Nas) atau Al-Baqarah 1-100"
                                  value={rec.notes}
                                  onChange={(e) =>
                                    setStudentTahfidzRecords((prev) => ({
                                      ...prev,
                                      [st.id]: {
                                        ...rec,
                                        notes: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Nilai Tahfidz / Kelancaran (Maks 90)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    placeholder="1 - 90"
                                    value={rec.tahfidzScore}
                                    onChange={(e) =>
                                      setStudentTahfidzRecords((prev) => ({
                                        ...prev,
                                        [st.id]: {
                                          ...rec,
                                          tahfidzScore: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center tabular-nums text-emerald-800 focus:outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                                    Nilai Tajwid & Makhorijul (Maks 90)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    placeholder="1 - 90"
                                    value={rec.tajweedScore}
                                    onChange={(e) =>
                                      setStudentTahfidzRecords((prev) => ({
                                        ...prev,
                                        [st.id]: {
                                          ...rec,
                                          tajweedScore: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center tabular-nums text-sky-800 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {classStudentsForTahfidz.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white px-5 ${radius.button} shadow-xs`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Tahfidz ({classStudentsForTahfidz.length})</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Rekapitulasi Tahfidz */}
          {tahfidzMode === 'view' && (
            <div className="space-y-4">
              <div className={`bg-white ${radius.card} border border-slate-200 p-3.5 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3`}>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 flex-1">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 mr-1">
                    <Filter className={`w-4 h-4 ${themeClasses.primaryText}`} />
                    <span>Filter:</span>
                  </div>

                  <select
                    value={tahfidzFilterClassId}
                    onChange={(e) => setTahfidzFilterClassId(e.target.value)}
                    className="filter-control w-full sm:w-auto"
                  >
                    <option value="">Semua Kelas ({classes.length})</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Kelas {cls.name}
                      </option>
                    ))}
                  </select>

                  <div className="filter-group grid grid-cols-3 sm:inline-flex w-full sm:w-auto">
                    {[
                      { id: '', label: 'Semua' },
                      { id: '1', label: 'Semester 1' },
                      { id: '2', label: 'Semester 2' },
                    ].map((sem) => {
                      const active = tahfidzFilterSemester === sem.id;
                      return (
                        <button
                          key={sem.id}
                          type="button"
                          onClick={() => setTahfidzFilterSemester(sem.id)}
                          className={`filter-btn w-full sm:w-auto ${
                            active
                              ? `${themeClasses.primary} text-white shadow-2xs`
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{sem.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex-1 min-w-[180px] sm:max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari santri / surat..."
                      value={tahfidzSearch}
                      onChange={(e) => setTahfidzSearch(e.target.value)}
                      className="filter-control w-full pl-8"
                    />
                  </div>
                </div>

                {(tahfidzFilterClassId || tahfidzFilterSemester || tahfidzSearch) && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setTahfidzFilterClassId('');
                        setTahfidzFilterSemester('');
                        setTahfidzSearch('');
                      }}
                      className="filter-reset-btn w-full sm:w-auto"
                    >
                      <span>Reset</span>
                    </button>
                  </div>
                )}
              </div>

              {groupedTahfidzGrades.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">Belum ada data nilai tahfidz</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Silakan gunakan sub-menu input untuk mencatat setoran hafalan santri.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedTahfidzGrades.map((group, idx) => (
                    <div key={idx} className={`bg-white ${radius.card} border border-slate-200 overflow-hidden shadow-xs`}>
                      <div className={`bg-gradient-to-r ${themeClasses.gradientHeader} text-white px-5 py-3.5 flex items-center justify-between`}>
                        <div>
                          <h3 className="text-sm font-bold flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-current opacity-85" />
                            <span>Kelas {group.className} · Semester {group.semester}</span>
                          </h3>
                          <span className="text-[11px] text-slate-300">
                            {group.items.length} santri terdata tahfidz
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-white tabular-nums">
                            {group.classAverage}
                          </span>
                          <span className="text-[10px] text-slate-300 block">Rata-rata Hafalan</span>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.items.map((item) => {
                          const pred = getGradePredicate(item.totalScore);
                          return (
                            <div
                              key={item.id}
                              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-400 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-900">{item.studentName}</h4>
                                    <span className="text-[11px] text-slate-500">NIS: {item.studentNis}</span>
                                  </div>
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${pred.color}`}>
                                    {pred.text} ({item.gradeLetter})
                                  </span>
                                </div>

                                {item.notes && (
                                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 mb-3 text-xs text-slate-800 flex items-start gap-2">
                                    <BookOpen className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${themeClasses.primaryText}`} />
                                    <span className="font-medium">{item.notes}</span>
                                  </div>
                                )}

                                <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg bg-white border border-slate-200 mb-3">
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Tahfidz</span>
                                    <span className="text-xs font-bold text-emerald-800 tabular-nums">
                                      {item.tahfidzScore}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Tajwid</span>
                                    <span className="text-xs font-bold text-sky-800 tabular-nums">
                                      {item.tajweedScore}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-500 block">Total</span>
                                    <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                                      {item.totalScore}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                <button
                                  onClick={() =>
                                    setTahfidzDetailModal({
                                      grade: item,
                                      studentName: item.studentName,
                                      studentNis: item.studentNis,
                                      className: item.className,
                                    })
                                  }
                                  className={`btn-precision-sm ${themeClasses.primaryLightBg} ${themeClasses.primaryText} border ${themeClasses.primaryBorder}`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Rincian</span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  {confirmDeleteTahfidzId === item.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          deleteTahfidzGrade(item.id);
                                          setConfirmDeleteTahfidzId(null);
                                        }}
                                        className="btn-precision-sm bg-rose-600 hover:bg-rose-700 text-white"
                                      >
                                        Hapus
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteTahfidzId(null)}
                                        className="btn-precision-sm bg-slate-200 hover:bg-slate-300 text-slate-700"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingTahfidzItem({
                                            id: item.id,
                                            studentName: item.studentName,
                                            className: item.className,
                                            tahfidzScore: item.tahfidzScore,
                                            tajweedScore: item.tajweedScore,
                                            notes: item.notes,
                                            testDate: item.testDate,
                                          })
                                        }
                                        className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteTahfidzId(item.id)}
                                        className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                                        title="Hapus"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: RINGKASAN TERPADU (AKADEMIK + TAHFIDZ) */}
      {/* ============================================================ */}
      {mainTab === 'combined' && (
        <div className={`bg-white ${radius.card} border border-slate-200 p-6 shadow-xs space-y-4`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Ringkasan Evaluasi Holistik Santri (Akademik & Tahfidz)
              </h2>
              <p className="text-xs text-slate-500">
                Pantau kesiapan capaian santri sebelum dicetak ke dalam Rapor Digital resmi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <select
                value={combinedFilterClassId}
                onChange={(e) => setCombinedFilterClassId(e.target.value)}
                className="filter-control w-full sm:w-auto"
              >
                <option value="">Semua Kelas ({classes.length})</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    Kelas {cls.name}
                  </option>
                ))}
              </select>

              <div className="relative w-full sm:w-52">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama / NIS santri..."
                  value={combinedSearch}
                  onChange={(e) => setCombinedSearch(e.target.value)}
                  className="filter-control w-full pl-8"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(combinedFilterClassId || combinedSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCombinedFilterClassId('');
                      setCombinedSearch('');
                    }}
                    className="filter-reset-btn flex-1 sm:flex-none"
                  >
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentView('reports')}
                  className={`btn-precision flex-1 sm:flex-none ${themeClasses.primary} ${themeClasses.primaryHover} text-white ${radius.button} shadow-2xs`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Buka Rapor</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Santri</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3 text-center">Jml Mapel</th>
                  <th className="py-2.5 px-3 text-center">Rata-rata Akademik</th>
                  <th className="py-2.5 px-3">Capaian Tahfidz</th>
                  <th className="py-2.5 px-3 text-center">Skor Tahfidz</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedSummary.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 tabular-nums text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {item.student.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        NIS: {item.student.nis}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.className}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      <span className="font-semibold">{item.academicCount}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-bold text-slate-900">
                      {item.academicAverage}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">
                      {item.tahfidzGrade?.notes || (
                        <span className="text-slate-400 italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-bold">
                      {item.tahfidzGrade ? (
                        <span className={`${themeClasses.badge} px-2 py-0.5 rounded-md border`}>
                          {item.tahfidzGrade.totalScore} ({item.tahfidzGrade.gradeLetter})
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setCurrentView('reports')}
                        className="btn-precision-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      >
                        <FileCheck2 className="w-3 h-3" />
                        <span>Rapor</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL NILAI MODAL (AKADEMIK) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedStudentDetail.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  Kelas {selectedStudentDetail.className} · Semester {selectedStudentDetail.semester} · NIS:{' '}
                  {selectedStudentDetail.studentNis}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Nilai</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {selectedStudentDetail.grades.reduce((a, b) => a + b.score, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Rata-rata Nilai</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {(
                      selectedStudentDetail.grades.reduce((a, b) => a + b.score, 0) /
                      (selectedStudentDetail.grades.length || 1)
                    ).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Quick Add Single Subject Grade */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800">Tambah / Perbarui Nilai Mapel Santri Ini</h4>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={addingSingleSubjectId}
                    onChange={(e) => setAddingSingleSubjectId(e.target.value)}
                    className="h-9 flex-1 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none"
                  >
                    <option value="">-- Pilih Mapel --</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="0.5"
                    placeholder="Nilai (0-90)"
                    value={addingSingleScore}
                    onChange={(e) => setAddingSingleScore(e.target.value)}
                    className="h-9 w-full sm:w-28 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center tabular-nums focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const subId = parseInt(addingSingleSubjectId, 10);
                      const sc = parseFloat(addingSingleScore);
                      if (isNaN(subId) || isNaN(sc) || sc < 0 || sc > 90) {
                        addToast('Pilih mata pelajaran dan masukkan nilai 0-90', 'error');
                        return;
                      }
                      saveBulkGrades(
                        subId,
                        selectedStudentDetail.classId,
                        selectedStudentDetail.semester,
                        { [selectedStudentDetail.studentId]: sc }
                      );
                      const subObj = subjects.find((s) => s.id === subId);
                      setSelectedStudentDetail((prev) => {
                        if (!prev) return null;
                        const exists = prev.grades.find((item) => item.subjectId === subId);
                        if (exists) {
                          return {
                            ...prev,
                            grades: prev.grades.map((item) =>
                              item.subjectId === subId ? { ...item, score: sc } : item
                            ),
                          };
                        }
                        return {
                          ...prev,
                          grades: [
                            ...prev.grades,
                            {
                              id: Date.now(),
                              studentId: prev.studentId,
                              classId: prev.classId,
                              subjectId: subId,
                              semester: prev.semester,
                              score: sc,
                              testDate: new Date().toISOString().split('T')[0],
                              type: 'regular',
                              subjectName: subObj ? subObj.name : `Mapel #${subId}`,
                            },
                          ],
                        };
                      });
                      setAddingSingleSubjectId('');
                      setAddingSingleScore('');
                    }}
                    className={`h-9 px-3.5 ${themeClasses.primary} ${themeClasses.primaryHover} text-white rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer`}
                  >
                    + Simpan
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Rincian Nilai per Mata Pelajaran</h4>
                {selectedStudentDetail.grades.map((g) => {
                  const pred = getGradePredicate(g.score);
                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{g.subjectName}</span>
                        <span className="text-[11px] text-slate-400 block">{pred.text}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold px-2 py-0.5 rounded-md tabular-nums border ${pred.color}`}>
                          {g.score} ({pred.letter})
                        </span>
                        {confirmDeleteGradeId === g.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                deleteGrade(g.id);
                                setSelectedStudentDetail((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        grades: prev.grades.filter((item) => item.id !== g.id),
                                      }
                                    : null
                                );
                                setConfirmDeleteGradeId(null);
                              }}
                              className="h-6 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold whitespace-nowrap cursor-pointer"
                            >
                              Ya, Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteGradeId(null)}
                              className="h-6 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[10px] font-semibold whitespace-nowrap cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGrade({
                                  id: g.id,
                                  subjectName: g.subjectName,
                                  studentName: selectedStudentDetail.studentName,
                                  currentScore: g.score,
                                });
                                setNewEditScore(g.score.toString());
                              }}
                              className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
                              title="Edit nilai"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteGradeId(g.id)}
                              className="p-1 text-slate-400 hover:text-rose-700 rounded-md cursor-pointer"
                              title="Hapus nilai"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="btn-precision w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT GRADE INLINE MODAL */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Ubah Nilai Mata Pelajaran</h3>
            <p className="text-xs text-slate-500 mb-4">
              Santri: <strong>{editingGrade.studentName}</strong> · Mapel: <strong>{editingGrade.subjectName}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai Baru (0 - 90)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="0.5"
                  value={newEditScore}
                  onChange={(e) => setNewEditScore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-center tabular-nums focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setEditingGrade(null)}
                  className="btn-precision w-full sm:w-auto text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const sc = parseFloat(newEditScore);
                    if (!isNaN(sc) && sc >= 0 && sc <= 90) {
                      updateGrade(editingGrade.id, sc);
                      if (selectedStudentDetail) {
                        setSelectedStudentDetail((prev) =>
                          prev
                            ? {
                                ...prev,
                                grades: prev.grades.map((item) =>
                                  item.id === editingGrade.id ? { ...item, score: sc } : item
                                ),
                              }
                            : null
                        );
                      }
                      setEditingGrade(null);
                    }
                  }}
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} text-white`}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAHFIDZ DETAIL MODAL */}
      {tahfidzDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{tahfidzDetailModal.studentName}</h3>
                <p className="text-xs text-slate-500">
                  Kelas {tahfidzDetailModal.className} · Semester {tahfidzDetailModal.grade.semester} · NIS:{' '}
                  {tahfidzDetailModal.studentNis}
                </p>
              </div>
              <button
                onClick={() => setTahfidzDetailModal(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Nilai Tahfidz</span>
                  <span className="text-2xl font-extrabold text-emerald-800 tabular-nums">
                    {tahfidzDetailModal.grade.tahfidzScore}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Nilai Tajwid</span>
                  <span className="text-2xl font-extrabold text-sky-800 tabular-nums">
                    {tahfidzDetailModal.grade.tajweedScore}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 mt-1">
                  <span className="text-[11px] text-slate-500 block">Total Nilai Rapor</span>
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {tahfidzDetailModal.grade.totalScore}
                  </span>
                  <span className={`text-xs font-bold ${themeClasses.primaryText} block mt-0.5`}>
                    Predikat: {getGradePredicate(tahfidzDetailModal.grade.totalScore).text} ({tahfidzDetailModal.grade.gradeLetter})
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Riwayat & Surat yang Diujikan:</span>
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium">
                  {tahfidzDetailModal.grade.notes || 'Belum ada catatan spesifik.'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setTahfidzDetailModal(null)}
                  className="btn-precision w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAHFIDZ EDIT MODAL */}
      {editingTahfidzItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Edit Catatan & Nilai Tahfidz</h3>
            <p className="text-xs text-slate-500 mb-4">
              Santri: <strong>{editingTahfidzItem.studentName}</strong>
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTahfidzGrade(editingTahfidzItem.id, {
                  tahfidzScore: editingTahfidzItem.tahfidzScore,
                  tajweedScore: editingTahfidzItem.tajweedScore,
                  notes: editingTahfidzItem.notes,
                  testDate: editingTahfidzItem.testDate,
                });
                setEditingTahfidzItem(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahfidz (1-90)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={editingTahfidzItem.tahfidzScore}
                    onChange={(e) =>
                      setEditingTahfidzItem((prev) =>
                        prev ? { ...prev, tahfidzScore: parseFloat(e.target.value) || 0 } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-center tabular-nums focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tajwid (1-90)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={editingTahfidzItem.tajweedScore}
                    onChange={(e) =>
                      setEditingTahfidzItem((prev) =>
                        prev ? { ...prev, tajweedScore: parseFloat(e.target.value) || 0 } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-center tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Hafalan / Surat</label>
                <textarea
                  rows={3}
                  value={editingTahfidzItem.notes}
                  onChange={(e) =>
                    setEditingTahfidzItem((prev) => (prev ? { ...prev, notes: e.target.value } : null))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:flex sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTahfidzItem(null)}
                  className="btn-precision w-full sm:w-auto text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} text-white`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
