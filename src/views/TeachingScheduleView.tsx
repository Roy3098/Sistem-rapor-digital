import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TeachingAssignment, Subject } from '../types';
import { getRadiusClass } from '../utils/theme';
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Printer,
  Sparkles,
  BookMarked,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';

export const TeachingScheduleView: React.FC = () => {
  const {
    subjects,
    classes,
    users,
    teachingAssignments,
    saveTeachingAssignment,
    deleteTeachingAssignment,
    academicYear,
    themeClasses,
    themeSettings,
    showToast,
  } = useApp();

  const radius = getRadiusClass(themeSettings.borderRadius);

  // View Mode: 'list' (Daftar Pengajaran) vs 'schedule' (Roster Mingguan)
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>('list');

  // Filters for List Mode
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter for Schedule Mode
  const [scheduleClassId, setScheduleClassId] = useState<string>(() => {
    return classes.length > 0 ? String(classes[0].id) : 'all';
  });

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<TeachingAssignment | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    subjectId: number;
    subjectName: string;
    category: Subject['category'];
    classId: number;
    className: string;
    teacherName: string;
    hoursPerWeek: number;
    day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad';
    timeSlot: string;
    room: string;
    referenceBook: string;
    targetCompetence: string;
  }>({
    id: '',
    subjectId: subjects.length > 0 ? subjects[0].id : 1,
    subjectName: subjects.length > 0 ? subjects[0].name : 'Fiqih',
    category: 'Diniyah',
    classId: classes.length > 0 ? classes[0].id : 1,
    className: classes.length > 0 ? classes[0].name : 'Aliyah 1',
    teacherName: 'Ust. Saeful Ridwan',
    hoursPerWeek: 3,
    day: 'Senin',
    timeSlot: '07:30 - 09:00',
    room: 'Kelas Utama',
    referenceBook: 'Safinatun Najah',
    targetCompetence: 'Penguasaan materi fiqih dasar dan praktik ibadah',
  });

  const handleOpenAddModal = () => {
    const firstSubject = subjects[0] || { id: 1, name: 'Fiqih', category: 'Diniyah' };
    const firstClass = classes[0] || { id: 1, name: 'Aliyah 1' };
    setEditingAssignment(null);
    setFormData({
      id: `ta-${Date.now()}`,
      subjectId: firstSubject.id,
      subjectName: firstSubject.name,
      category: firstSubject.category || 'Diniyah',
      classId: firstClass.id,
      className: firstClass.name,
      teacherName: 'Ust. Saeful Ridwan',
      hoursPerWeek: 3,
      day: 'Senin',
      timeSlot: '07:30 - 09:00',
      room: `Ruang ${firstClass.name}`,
      referenceBook: 'Kitab / Buku Panduan',
      targetCompetence: 'Capaian kompetensi pembelajaran semester',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (assignment: TeachingAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      id: assignment.id,
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName,
      category: assignment.category,
      classId: assignment.classId,
      className: assignment.className,
      teacherName: assignment.teacherName,
      hoursPerWeek: assignment.hoursPerWeek,
      day: assignment.day,
      timeSlot: assignment.timeSlot,
      room: assignment.room || '',
      referenceBook: assignment.referenceBook || '',
      targetCompetence: assignment.targetCompetence || '',
    });
    setIsModalOpen(true);
  };

  const handleSubjectSelect = (subIdStr: string) => {
    const subId = Number(subIdStr);
    const sub = subjects.find((s) => s.id === subId);
    if (sub) {
      setFormData((prev) => ({
        ...prev,
        subjectId: sub.id,
        subjectName: sub.name,
        category: sub.category,
      }));
    }
  };

  const handleClassSelect = (clsIdStr: string) => {
    const clsId = Number(clsIdStr);
    const cls = classes.find((c) => c.id === clsId);
    if (cls) {
      setFormData((prev) => ({
        ...prev,
        classId: cls.id,
        className: cls.name,
        room: `Ruang ${cls.name}`,
      }));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignmentToSave: TeachingAssignment = {
      ...formData,
      id: formData.id || `ta-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    saveTeachingAssignment(assignmentToSave);
    setIsModalOpen(false);
  };

  // Filtered Assignments for List View
  const filteredAssignments = useMemo(() => {
    return teachingAssignments.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (classFilter !== 'all' && a.classId !== Number(classFilter)) return false;
      if (teacherFilter !== 'all' && !a.teacherName.toLowerCase().includes(teacherFilter.toLowerCase()))
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.subjectName.toLowerCase().includes(q);
        const matchTeacher = a.teacherName.toLowerCase().includes(q);
        const matchBook = a.referenceBook?.toLowerCase().includes(q);
        if (!matchName && !matchTeacher && !matchBook) return false;
      }
      return true;
    });
  }, [teachingAssignments, categoryFilter, classFilter, teacherFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalSubjects = subjects.length;
    const assignedSubjectsCount = new Set(teachingAssignments.map((a) => a.subjectId)).size;
    const totalHours = teachingAssignments.reduce((acc, a) => acc + (a.hoursPerWeek || 0), 0);
    const uniqueTeachers = new Set(teachingAssignments.map((a) => a.teacherName)).size;
    const diniyahCount = teachingAssignments.filter((a) => a.category === 'Diniyah').length;
    return {
      totalSubjects,
      assignedSubjectsCount,
      totalHours,
      uniqueTeachers,
      diniyahCount,
    };
  }, [subjects, teachingAssignments]);

  // Weekly Schedule Grid
  const days: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad'> = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
    'Ahad',
  ];

  const scheduleByDay = useMemo(() => {
    const map: Record<string, TeachingAssignment[]> = {};
    days.forEach((d) => (map[d] = []));
    teachingAssignments.forEach((a) => {
      if (scheduleClassId === 'all' || a.classId === Number(scheduleClassId)) {
        if (map[a.day]) {
          map[a.day].push(a);
        }
      }
    });
    // Sort assignments in each day by timeSlot
    days.forEach((d) => {
      map[d].sort((x, y) => x.timeSlot.localeCompare(y.timeSlot));
    });
    return map;
  }, [teachingAssignments, scheduleClassId, days]);

  const printSchedule = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. MASTER HEADER                                                          */}
      {/* ========================================================================= */}
      <div
        className={`bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-7 ${radius} shadow-lg relative overflow-hidden`}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold backdrop-blur-xs border border-teal-400/30">
              <BookMarked className="w-3.5 h-3.5 text-teal-300" />
              <span>Manajemen Kurikulum & Jadwal Pembelajaran</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Pelajaran yang Diajarkan</span>
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Daftar mata pelajaran yang diajarkan di madrasah dan pesantren, penetapan guru pengampu (asatidz), beban jam pelajaran (JP), kitab/buku rujukan, dan roster jadwal mingguan santri.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <span className="text-[11px] text-teal-200/90 block font-medium">Mata Pelajaran</span>
              <span className="text-lg sm:text-xl font-black text-white">{metrics.totalSubjects}</span>
              <span className="text-[10px] text-teal-300 block">{metrics.assignedSubjectsCount} Aktif Diajar</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <span className="text-[11px] text-teal-200/90 block font-medium">Guru Pengampu</span>
              <span className="text-lg sm:text-xl font-black text-white">{metrics.uniqueTeachers}</span>
              <span className="text-[10px] text-teal-300 block">Dewan Asatidz</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <span className="text-[11px] text-teal-200/90 block font-medium">Beban Belajar</span>
              <span className="text-lg sm:text-xl font-black text-teal-300">{metrics.totalHours} JP</span>
              <span className="text-[10px] text-teal-200 block">Jam per Minggu</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <span className="text-[11px] text-teal-200/90 block font-medium">Mapel Diniyah</span>
              <span className="text-lg sm:text-xl font-black text-emerald-300">{metrics.diniyahCount}</span>
              <span className="text-[10px] text-teal-200 block">Kitab Kuning</span>
            </div>
          </div>
        </div>

        {/* View Switcher: List vs Schedule */}
        <div className="mt-6 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`btn-precision w-full sm:w-auto px-3 sm:px-4 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-teal-950 shadow-md ring-2 ring-teal-300'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Daftar Pelajaran</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  viewMode === 'list' ? 'bg-teal-100 text-teal-900' : 'bg-white/20 text-white'
                }`}
              >
                {teachingAssignments.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('schedule')}
              className={`btn-precision w-full sm:w-auto px-3 sm:px-4 rounded-xl transition-all ${
                viewMode === 'schedule'
                  ? 'bg-white text-teal-950 shadow-md ring-2 ring-teal-300'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Jadwal Mingguan</span>
            </button>
          </div>

          <div
            className={`grid ${
              viewMode === 'schedule' ? 'grid-cols-2' : 'grid-cols-1'
            } sm:flex items-center gap-2 w-full sm:w-auto`}
          >
            {viewMode === 'schedule' && (
              <button
                type="button"
                onClick={printSchedule}
                className="btn-precision w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Cetak Roster</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn-precision w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah Jadwal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MODE 1: DAFTAR PELAJARAN & GURU PENGAMPU                               */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5 sm:gap-3 w-full md:w-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  KATEGORI MAPEL
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-control w-full sm:w-auto"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="Diniyah">Diniyah (Kitab / Agama)</option>
                  <option value="Umum">Umum (Kemendikbud)</option>
                  <option value="Bahasa">Bahasa (Arab / Inggris)</option>
                  <option value="Keterampilan">Keterampilan / Vokasi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  KELAS
                </label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="filter-control w-full sm:w-auto"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 relative sm:min-w-[220px]">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  PENCARIAN
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nama mapel, guru, kitab..."
                    className="filter-control w-full pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium pt-1 md:pt-0">
              Menampilkan <strong>{filteredAssignments.length}</strong> dari {teachingAssignments.length} penugasan
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Tidak Ada Penugasan Pelajaran Ditemukan
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Silakan sesuaikan filter atau tambahkan penugasan mata pelajaran baru untuk rombel kelas ini.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="mt-4 btn-precision bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Jadwal</span>
                </button>
              </div>
            ) : (
              filteredAssignments.map((item) => {
                const categoryBadgeColor =
                  item.category === 'Diniyah'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                    : item.category === 'Bahasa'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300'
                    : item.category === 'Umum'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${categoryBadgeColor}`}
                        >
                          {item.category}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.className}
                        </span>
                      </div>

                      {/* Title & Teacher */}
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {item.subjectName}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>Guru: <strong>{item.teacherName}</strong></span>
                      </div>

                      {/* Day & Time Slot */}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {item.day}, {item.timeSlot} ({item.hoursPerWeek} JP)
                        </span>
                      </div>

                      {/* Reference Book / Kitab */}
                      {item.referenceBook && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400 font-semibold block text-[10px]">KITAB / BUKU RUJUKAN:</span>
                          <span className="font-medium text-emerald-700 dark:text-emerald-400 italic">
                            {item.referenceBook}
                          </span>
                        </div>
                      )}

                      {/* Competence Target */}
                      {item.targetCompetence && (
                        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.targetCompetence}
                        </p>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.room || item.className}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                          title="Ubah Penugasan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus penugasan ${item.subjectName} di kelas ${item.className}?`)) {
                              deleteTeachingAssignment(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Hapus Penugasan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODE 2: ROSTER JADWAL MINGGUAN (SENIN - AHAD)                          */}
      {/* ========================================================================= */}
      {viewMode === 'schedule' && (
        <div className="space-y-4">
          {/* Class Filter Bar for Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                JADWAL KELAS:
              </label>
              <select
                value={scheduleClassId}
                onChange={(e) => setScheduleClassId(e.target.value)}
                className="filter-control"
              >
                <option value="all">Seluruh Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.teacher || 'Wali Kelas'})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Tahun Ajaran: <strong>{academicYear}</strong>
            </div>
          </div>

          {/* Roster Grid Day by Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {days.map((day) => {
              const dayAssignments = scheduleByDay[day] || [];
              const isWeekend = day === 'Jumat' || day === 'Ahad';

              return (
                <div
                  key={day}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col ${
                    isWeekend ? 'ring-1 ring-emerald-400/30' : ''
                  }`}
                >
                  <div
                    className={`p-3 text-center border-b font-extrabold text-xs uppercase tracking-wider ${
                      day === 'Jumat'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : isWeekend
                        ? 'bg-teal-700 text-white border-teal-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{day}</span>
                    <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                      {dayAssignments.length} Mapel
                    </span>
                  </div>

                  <div className="p-2 space-y-2 flex-1">
                    {dayAssignments.length === 0 ? (
                      <div className="py-8 text-center text-slate-300 dark:text-slate-600 text-[11px] italic">
                        Tidak ada jam
                      </div>
                    ) : (
                      dayAssignments.map((a) => {
                        const borderCat =
                          a.category === 'Diniyah'
                            ? 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                            : a.category === 'Bahasa'
                            ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                            : a.category === 'Umum'
                            ? 'border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                            : 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20';

                        return (
                          <div
                            key={a.id}
                            className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 ${borderCat} text-xs`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                              <span>{a.timeSlot}</span>
                              <span className="font-bold text-slate-600 dark:text-slate-400">{a.className}</span>
                            </div>
                            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                              {a.subjectName}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                              {a.teacherName}
                            </div>
                            {a.referenceBook && (
                              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 italic truncate mt-1">
                                📖 {a.referenceBook}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: TAMBAH / UBAH PENUGASAN PELAJARAN                               */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>{editingAssignment ? 'Ubah Penugasan Pelajaran' : 'Tambah Penugasan Pelajaran Baru'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    PILIH MATA PELAJARAN
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => handleSubjectSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    ROMBEL KELAS
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => handleClassSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  GURU PENGAMPU (ASATIDZ)
                </label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="Contoh: Ust. Saeful Ridwan..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    HARI
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    JAM BELAJAR
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    placeholder="07:30 - 09:00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                    ALOKASI JP
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  KITAB / BUKU RUJUKAN
                </label>
                <input
                  type="text"
                  value={formData.referenceBook}
                  onChange={(e) => setFormData({ ...formData, referenceBook: e.target.value })}
                  placeholder="Contoh: Safinatun Najah, Matan Al-Jurumiyah, Durusul Lughah..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">
                  TARGET CAPAIAN PEMBELAJARAN
                </label>
                <textarea
                  rows={2}
                  value={formData.targetCompetence}
                  onChange={(e) => setFormData({ ...formData, targetCompetence: e.target.value })}
                  placeholder="Target kompetensi materi semester ini..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-precision w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
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
