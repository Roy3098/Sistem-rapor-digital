import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StudentAttendanceRecord, TeacherAttendanceRecord } from '../types';
import { getRadiusClass } from '../utils/theme';
import {
  Calendar,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Save,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  Briefcase,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    classes,
    students,
    users,
    academicYear,
    siteSettings,
    studentAttendance,
    teacherAttendance,
    saveStudentAttendance,
    saveTeacherAttendance,
    syncAttendanceToReportCards,
    themeClasses,
    themeSettings,
    showToast,
  } = useApp();

  const radius = getRadiusClass(themeSettings.borderRadius);

  // Main Tab: 'students' vs 'teachers'
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');

  // =========================================================================
  // STATE: ABSENSI SANTRI
  // =========================================================================
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedClassId, setSelectedClassId] = useState<number>(() => {
    return classes.length > 0 ? classes[0].id : 1;
  });
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(() =>
    siteSettings.defaultSemester === 2 ? 2 : 1
  );
  React.useEffect(() => {
    setSelectedSemester(siteSettings.defaultSemester === 2 ? 2 : 1);
  }, [siteSettings.defaultSemester]);
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Local draft status for currently active class on the selected date
  const classStudents = useMemo(() => {
    return students.filter((s) => s.id > 0 && s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Map of studentId -> status & notes for the selected date
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<number, { status: 'H' | 'S' | 'I' | 'A'; notes: string }>
  >({});

  // Sync draft when class or date changes
  React.useEffect(() => {
    const draft: Record<number, { status: 'H' | 'S' | 'I' | 'A'; notes: string }> = {};
    classStudents.forEach((student) => {
      const existing = studentAttendance.find(
        (r) => r.studentId === student.id && r.date === selectedDate
      );
      draft[student.id] = {
        status: existing ? existing.status : 'H',
        notes: existing?.notes || '',
      };
    });
    setAttendanceDraft(draft);
  }, [selectedClassId, selectedDate, classStudents, studentAttendance]);

  const handleStatusChange = (studentId: number, status: 'H' | 'S' | 'I' | 'A') => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { notes: '' }),
        status,
      },
    }));
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'H' }),
        notes,
      },
    }));
  };

  const markAllStudentsHadir = () => {
    const updated: Record<number, { status: 'H' | 'S' | 'I' | 'A'; notes: string }> = {};
    classStudents.forEach((st) => {
      updated[st.id] = {
        status: 'H',
        notes: attendanceDraft[st.id]?.notes || '',
      };
    });
    setAttendanceDraft(updated);
    showToast(`Seluruh santri (${classStudents.length}) ditandai HADIR`, 'info');
  };

  const handleSaveStudentAttendance = () => {
    const recordsToSave: StudentAttendanceRecord[] = classStudents.map((st) => {
      const draft = attendanceDraft[st.id] || { status: 'H', notes: '' };
      return {
        id: `att_${st.id}_${selectedDate}`,
        studentId: st.id,
        studentName: st.name,
        classId: selectedClassId,
        date: selectedDate,
        status: draft.status,
        notes: draft.notes,
        recordedBy: 'Dewan Asatidz',
      };
    });

    saveStudentAttendance(recordsToSave);
  };

  const handleSyncToRapor = () => {
    syncAttendanceToReportCards(selectedClassId, selectedSemester);
  };

  // Student Attendance Statistics
  const studentStats = useMemo(() => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    classStudents.forEach((st) => {
      const stStatus = attendanceDraft[st.id]?.status || 'H';
      if (stStatus === 'H') hadir++;
      else if (stStatus === 'S') sakit++;
      else if (stStatus === 'I') izin++;
      else if (stStatus === 'A') alpa++;
    });

    const total = classStudents.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;

    return { hadir, sakit, izin, alpa, total, percentage };
  }, [classStudents, attendanceDraft]);

  const filteredClassStudents = useMemo(() => {
    if (!studentSearch.trim()) return classStudents;
    const q = studentSearch.toLowerCase();
    return classStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)
    );
  }, [classStudents, studentSearch]);

  const currentClassObj = classes.find((c) => c.id === selectedClassId);

  // =========================================================================
  // STATE: ABSENSI GURU
  // =========================================================================
  const [selectedTeacherDate, setSelectedTeacherDate] = useState<string>(todayStr);
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [editingTeacherModal, setEditingTeacherModal] = useState<TeacherAttendanceRecord | null>(null);

  // Active Teachers (combine users that have teacher role with registered teacher attendance)
  const teacherList = useMemo(() => {
    const activeStaff = users.filter((u) => u.role === 'guru' || u.role === 'wali_kelas');
    return activeStaff;
  }, [users]);

  const teacherRecordsForDate = useMemo(() => {
    return teacherAttendance.filter((t) => t.date === selectedTeacherDate);
  }, [teacherAttendance, selectedTeacherDate]);

  const markAllTeachersHadir = () => {
    teacherList.forEach((teacher) => {
      const record: TeacherAttendanceRecord = {
        id: `tatt_${teacher.id}_${selectedTeacherDate}`,
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        date: selectedTeacherDate,
        time: '07:00',
        status: 'hadir',
        notes: 'Hadir mengajar sesuai jadwal pembelajaran',
      };
      saveTeacherAttendance(record);
    });
    showToast(`Presensi ${teacherList.length} asatidz ditandai HADIR`, 'success');
  };

  const teacherStats = useMemo(() => {
    const list = teacherRecordsForDate;
    const hadir = list.filter((r) => r.status === 'hadir').length;
    const izin = list.filter((r) => r.status === 'izin').length;
    const sakit = list.filter((r) => r.status === 'sakit').length;
    const dinas = list.filter((r) => r.status === 'dinas_luar').length;
    const alpa = list.filter((r) => r.status === 'alpa').length;
    return {
      total: teacherList.length,
      tercatat: list.length,
      hadir,
      izin,
      sakit,
      dinas,
      alpa,
    };
  }, [teacherList, teacherRecordsForDate]);

  const handleSaveTeacherEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacherModal) return;
    saveTeacherAttendance(editingTeacherModal);
    setEditingTeacherModal(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. MASTER HEADER: ABSENSI SANTRI & GURU                                   */}
      {/* ========================================================================= */}
      <div
        className={`bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-7 ${radius} shadow-lg relative overflow-hidden`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-xs border border-blue-400/30">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>Modul Presensi & Kehadiran Pesantren</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Absensi Santri & Dewan Guru</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Pencatatan rekapitulasi kehadiran harian santri per rombel kelas serta daftar absensi ustadz dan ustadzah pengampu mata pelajaran. Data kehadiran santri dapat disinkronkan langsung ke Rapor Digital.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/15 text-center sm:min-w-[100px]">
              <span className="text-[10px] sm:text-[11px] text-blue-200/90 block font-medium truncate">Santri Rombel</span>
              <span className="text-base sm:text-xl font-black text-white">{classStudents.length}</span>
              <span className="text-[10px] text-blue-300 block truncate">{currentClassObj?.name || 'Kelas'}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/15 text-center sm:min-w-[100px]">
              <span className="text-[10px] sm:text-[11px] text-blue-200/90 block font-medium truncate">Kehadiran</span>
              <span className="text-base sm:text-xl font-black text-emerald-300">
                {studentStats.percentage}%
              </span>
              <span className="text-[10px] text-blue-200 block truncate">{studentStats.hadir} Hadir</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 border border-white/15 text-center sm:min-w-[100px]">
              <span className="text-[10px] sm:text-[11px] text-blue-200/90 block font-medium truncate">Dewan Asatidz</span>
              <span className="text-base sm:text-xl font-black text-white">{teacherList.length}</span>
              <span className="text-[10px] text-blue-200 block truncate">{teacherStats.hadir} Hadir</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Santri vs Guru */}
        <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`btn-precision w-full sm:w-auto px-3 sm:px-4 rounded-xl transition-all ${
              activeTab === 'students'
                ? 'bg-white text-blue-950 shadow-md ring-2 ring-blue-300'
                : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Presensi Santri</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'students' ? 'bg-blue-100 text-blue-900' : 'bg-white/20 text-white'
              }`}
            >
              {classStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`btn-precision w-full sm:w-auto px-3 sm:px-4 rounded-xl transition-all ${
              activeTab === 'teachers'
                ? 'bg-white text-blue-950 shadow-md ring-2 ring-blue-300'
                : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Presensi Guru</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'teachers' ? 'bg-blue-100 text-blue-900' : 'bg-white/20 text-white'
              }`}
            >
              {teacherList.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1: ABSENSI SANTRI                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5 sm:gap-3 w-full md:w-auto">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  KELAS
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                  className="filter-control w-full sm:w-auto"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.teacher || 'Wali Kelas'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  TANGGAL
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="filter-control w-full sm:w-auto"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  SEMESTER
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value) as 1 | 2)}
                  className="filter-control w-full sm:w-auto"
                >
                  <option value={1}>Semester 1 (Ganjil)</option>
                  <option value={2}>Semester 2 (Genap)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 relative sm:min-w-[200px]">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  CARI SANTRI
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Nama / NIS..."
                    className="filter-control w-full pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-1 md:pt-0 w-full md:w-auto">
              <button
                type="button"
                onClick={markAllStudentsHadir}
                className="btn-precision w-full sm:w-auto bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
                title="Tandai semua santri di kelas ini Hadir"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Semua Hadir</span>
              </button>

              <button
                type="button"
                onClick={handleSyncToRapor}
                className="btn-precision w-full sm:w-auto bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 hover:bg-purple-100"
                title="Kalkulasi total Sakit, Izin, Alpa semester ini dan perbarui ke Rapor Siswa"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Sinkron Rapor</span>
              </button>

              <button
                type="button"
                onClick={handleSaveStudentAttendance}
                className="btn-precision col-span-2 sm:col-span-1 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span>Simpan</span>
              </button>
            </div>
          </div>

          {/* Daily Class Attendance Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                H
              </div>
              <div>
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">HADIR</div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-200">
                  {studentStats.hadir}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                S
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">SAKIT</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-200">
                  {studentStats.sakit}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                I
              </div>
              <div>
                <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300">IZIN</div>
                <div className="text-xl font-black text-blue-700 dark:text-blue-200">
                  {studentStats.izin}
                </div>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300">ALPA</div>
                <div className="text-xl font-black text-rose-700 dark:text-rose-200">
                  {studentStats.alpa}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-slate-500/20 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                %
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">PERSENTASE</div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {studentStats.percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Daftar Presensi: {currentClassObj?.name} ({filteredClassStudents.length} Santri)
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tanggal: <strong>{new Date(selectedDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-28">NIS</th>
                    <th className="py-3 px-4">Nama Santri</th>
                    <th className="py-3 px-4 w-56 text-center">Status Kehadiran</th>
                    <th className="py-3 px-4">Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredClassStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Tidak ada santri yang ditemukan pada rombel kelas ini.
                      </td>
                    </tr>
                  ) : (
                    filteredClassStudents.map((st, idx) => {
                      const current = attendanceDraft[st.id] || { status: 'H', notes: '' };
                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                            {st.nis}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{st.name}</div>
                            <div className="text-[11px] text-slate-400">Wali: {st.guardian}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* H Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'H')}
                                className={`w-9 h-8 rounded-lg font-black text-xs transition-all cursor-pointer ${
                                  current.status === 'H'
                                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 hover:text-emerald-700'
                                }`}
                                title="Hadir"
                              >
                                H
                              </button>

                              {/* S Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'S')}
                                className={`w-9 h-8 rounded-lg font-black text-xs transition-all cursor-pointer ${
                                  current.status === 'S'
                                    ? 'bg-amber-500 text-white shadow-xs scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-amber-100 dark:hover:bg-amber-950/40 hover:text-amber-700'
                                }`}
                                title="Sakit"
                              >
                                S
                              </button>

                              {/* I Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'I')}
                                className={`w-9 h-8 rounded-lg font-black text-xs transition-all cursor-pointer ${
                                  current.status === 'I'
                                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-100 dark:hover:bg-blue-950/40 hover:text-blue-700'
                                }`}
                                title="Izin"
                              >
                                I
                              </button>

                              {/* A Button */}
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'A')}
                                className={`w-9 h-8 rounded-lg font-black text-xs transition-all cursor-pointer ${
                                  current.status === 'A'
                                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-700'
                                }`}
                                title="Alpa (Tanpa Keterangan)"
                              >
                                A
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={current.notes}
                              onChange={(e) => handleNotesChange(st.id, e.target.value)}
                              placeholder="Keterangan sakit / izin (opsional)..."
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Save Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tekan <strong>Simpan</strong> untuk menyimpan data kehadiran santri hari ini.
              </span>
              <button
                type="button"
                onClick={handleSaveStudentAttendance}
                className="btn-precision w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: ABSENSI GURU & ASATIDZ                                          */}
      {/* ========================================================================= */}
      {activeTab === 'teachers' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-end gap-2.5 sm:gap-3 w-full md:w-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  TANGGAL PRESENSI
                </label>
                <input
                  type="date"
                  value={selectedTeacherDate}
                  onChange={(e) => setSelectedTeacherDate(e.target.value)}
                  className="filter-control w-full sm:w-auto"
                />
              </div>

              <div className="relative sm:min-w-[220px]">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  CARI GURU
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Nama ustadz / ustadzah..."
                    className="filter-control w-full pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={markAllTeachersHadir}
                className="btn-precision w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Semua Guru Hadir</span>
              </button>
            </div>
          </div>

          {/* Teacher Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">HADIR</div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-200">
                  {teacherStats.hadir}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-blue-800 dark:text-blue-300">IZIN / CUTI</div>
                <div className="text-xl font-black text-blue-700 dark:text-blue-200">
                  {teacherStats.izin}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">SAKIT</div>
                <div className="text-xl font-black text-amber-700 dark:text-amber-200">
                  {teacherStats.sakit}
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300">DINAS LUAR</div>
                <div className="text-xl font-black text-purple-700 dark:text-purple-200">
                  {teacherStats.dinas}
                </div>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 p-3 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300">ALPA</div>
                <div className="text-xl font-black text-rose-700 dark:text-rose-200">
                  {teacherStats.alpa}
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Attendance Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Daftar Presensi Dewan Asatidz & Tenaga Pendidik
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tanggal: <strong>{new Date(selectedTeacherDate).toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Ustadz / Guru</th>
                    <th className="py-3 px-4 w-32 text-center">Status</th>
                    <th className="py-3 px-4 w-28 text-center">Jam Hadir</th>
                    <th className="py-3 px-4">Mapel / Jadwal Hari Ini</th>
                    <th className="py-3 px-4">Keterangan / Agenda</th>
                    <th className="py-3 px-4 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {teacherList.map((teacher, idx) => {
                    const record = teacherRecordsForDate.find((r) => r.teacherId === teacher.id);
                    const status = record?.status || 'hadir';
                    const time = record?.time || '07:00';

                    return (
                      <tr
                        key={teacher.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                {teacher.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400 capitalize">
                                {teacher.role === 'wali_kelas' ? 'Wali Kelas' : 'Guru Mapel'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                              status === 'hadir'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : status === 'izin'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : status === 'sakit'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : status === 'dinas_luar'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {status === 'dinas_luar' ? 'Dinas Luar' : status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {time} WIB
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {record?.subjectTaught || 'Pendidikan Islam & Pembinaan Santri'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 italic">
                          {record?.notes || 'Hadir dan bertugas di madrasah'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTeacherModal({
                                id: record?.id || `tatt_${teacher.id}_${selectedTeacherDate}`,
                                teacherId: teacher.id,
                                teacherName: teacher.fullName,
                                date: selectedTeacherDate,
                                time: record?.time || '07:00',
                                status: (record?.status || 'hadir') as any,
                                subjectTaught: record?.subjectTaught || '',
                                classRoom: record?.classRoom || '',
                                notes: record?.notes || '',
                              })
                            }
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Edit presensi guru ini"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: EDIT PRESENSI GURU                                              */}
      {/* ========================================================================= */}
      {editingTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Ubah Presensi Guru</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingTeacherModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacherEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nama Ustadz / Guru
                </label>
                <input
                  type="text"
                  disabled
                  value={editingTeacherModal.teacherName}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Status Kehadiran
                  </label>
                  <select
                    value={editingTeacherModal.status}
                    onChange={(e) =>
                      setEditingTeacherModal({
                        ...editingTeacherModal,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="dinas_luar">Dinas Luar</option>
                    <option value="alpa">Alpa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Jam Presensi
                  </label>
                  <input
                    type="time"
                    value={editingTeacherModal.time || '07:00'}
                    onChange={(e) =>
                      setEditingTeacherModal({
                        ...editingTeacherModal,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Mata Pelajaran / Tugas Hari Ini
                </label>
                <input
                  type="text"
                  value={editingTeacherModal.subjectTaught || ''}
                  onChange={(e) =>
                    setEditingTeacherModal({
                      ...editingTeacherModal,
                      subjectTaught: e.target.value,
                    })
                  }
                  placeholder="Contoh: Fiqih Bab Sholat, Bahasa Arab..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Keterangan / Agenda
                </label>
                <textarea
                  rows={2}
                  value={editingTeacherModal.notes || ''}
                  onChange={(e) =>
                    setEditingTeacherModal({
                      ...editingTeacherModal,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Keterangan tambahan (alasan izin, sakit, dinas)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTeacherModal(null)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-precision w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
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
