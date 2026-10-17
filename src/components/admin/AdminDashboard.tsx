import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Server,
  Users,
  Layers,
  Sparkles,
  Mail,
  ChevronDown,
  BookOpen,
  Calendar,
  Award,
  Check,
  FileText,
  GraduationCap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/db';

interface AdminDashboardProps {
  currentUserEmail?: string;
  onClose: () => void;
}

const AUTHORIZED_ADMINS = ['imranpermadi@gmail.com'];

type TableName = 
  | 'user_profiles'
  | 'academic_levels'
  | 'exam_cycles'
  | 'curriculum_items'
  | 'content_units'
  | 'murojaah_checklists'
  | 'ibadah_daily_logs'
  | 'sholat_learning_progress'
  | 'fsrs_memory_states'
  | 'mutabaah_logs';

const TABLES: { name: TableName; label: string; description: string }[] = [
  { name: 'user_profiles', label: 'Profil Pengguna', description: 'Data akun siswa & orang tua, streak, saldo bintang' },
  { name: 'academic_levels', label: 'Tingkat Kelas SDIT', description: 'Jenjang kelas 1 sampai 6 SDIT' },
  { name: 'exam_cycles', label: 'Siklus Ujian', description: 'PTS 1/2, MID, dan PAS' },
  { name: 'curriculum_items', label: 'Item Kurikulum', description: 'Materi hafalan Qur\'an, Hadis, Doa, Sholat' },
  { name: 'content_units', label: 'Unit Konten', description: 'Ayat, matan Arab berharakat, terjemahan & dalil' },
  { name: 'murojaah_checklists', label: 'Ceklis Muroja\'ah', description: 'Status hafalan siswa dan verifikasi orang tua' },
  { name: 'ibadah_daily_logs', label: 'Mutaba\'ah Yaumiyah', description: 'Catatan sholat 5 waktu, sunnah & puasa' },
  { name: 'sholat_learning_progress', label: 'Progres 13 Rukun Sholat', description: 'Status belajar gerakan sholat shahih' },
  { name: 'fsrs_memory_states', label: 'State Memori FSRS-6', description: 'Stabilitas & jadwal pengulangan ilmiah' },
  { name: 'mutabaah_logs', label: 'Log Setoran Ujian', description: 'Nilai Lancar (L) / Belum Lancar (BL)' }
];

export function AdminDashboard({ currentUserEmail, onClose }: AdminDashboardProps) {
  const isAuthorized = currentUserEmail && AUTHORIZED_ADMINS.includes(currentUserEmail.toLowerCase());

  const [activeTable, setActiveTable] = useState<TableName>('user_profiles');
  const [records, setRecords] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Create / Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Map of student_id -> email & name
  const userEmailMap = userProfiles.reduce((acc, u) => {
    acc[u.id] = { email: u.email || 'tanpa-email', name: u.full_name || 'Tanpa Nama', role: u.role };
    return acc;
  }, {} as Record<string, { email: string; name: string; role: string }>);

  // Fetch all user profiles for email linking
  const fetchProfiles = async () => {
    try {
      const localProfiles = await db.user_profiles.toArray();
      if (localProfiles.length > 0) {
        setUserProfiles(localProfiles);
      } else if (supabase) {
        const { data } = await supabase.from('user_profiles').select('*');
        if (data) setUserProfiles(data);
      }
    } catch (e) {
      console.warn('Could not fetch profiles for mapping:', e);
    }
  };

  // Fetch data from Cloud or Local Dexie fallback
  const fetchTableData = async (tableName: TableName) => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      let dataToUse: any[] = [];

      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(100);

          if (!error && data && data.length > 0) {
            dataToUse = data;
          }
        } catch (cloudErr) {
          console.warn('Supabase fetch failed, will fallback to local Dexie:', cloudErr);
        }
      }

      // If Supabase returned empty or errored, load from local Dexie table
      if (dataToUse.length === 0) {
        const localData = await (db as any)[tableName].toArray();
        dataToUse = localData;
      }

      setRecords(dataToUse);
    } catch (err: any) {
      console.warn('Error fetching admin table:', err.message);
      setStatusMsg({ type: 'error', text: err.message || 'Gagal memuat data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchProfiles();
      fetchTableData(activeTable);
    }
  }, [activeTable, isAuthorized]);

  // Handle Save (Create or Update)
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg(null);

    try {
      if (editingRecord && editingRecord.id) {
        // UPDATE
        const updatedRecord = { ...editingRecord, ...formData, updated_at: new Date().toISOString() };
        
        if (supabase) {
          try {
            await supabase.from(activeTable).update(updatedRecord).eq('id', editingRecord.id);
          } catch (cloudErr) {
            console.warn('Cloud update failed:', cloudErr);
          }
        }

        await (db as any)[activeTable].put(updatedRecord);
        setStatusMsg({ type: 'success', text: `Data [${editingRecord.id}] berhasil diperbarui!` });
      } else {
        // CREATE
        const newId = formData.id || `${activeTable.slice(0, 4)}-${Date.now()}`;
        const newRecord = { ...formData, id: newId, created_at: new Date().toISOString() };

        if (supabase) {
          try {
            await supabase.from(activeTable).insert(newRecord);
          } catch (cloudErr) {
            console.warn('Cloud insert failed:', cloudErr);
          }
        }

        await (db as any)[activeTable].put(newRecord);
        setStatusMsg({ type: 'success', text: `Data baru berhasil ditambahkan!` });
      }

      setIsEditorOpen(false);
      setEditingRecord(null);
      await fetchTableData(activeTable);
      await fetchProfiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal menyimpan data.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm(`Yakin ingin menghapus data [${recordId}]? Tindakan ini permanen.`)) {
      return;
    }

    setIsLoading(true);
    try {
      if (supabase) {
        try {
          await supabase.from(activeTable).delete().eq('id', recordId);
        } catch (cloudErr) {
          console.warn('Cloud delete failed:', cloudErr);
        }
      }
      await (db as any)[activeTable].delete(recordId);
      setStatusMsg({ type: 'success', text: `Data [${recordId}] berhasil dihapus.` });
      await fetchTableData(activeTable);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal menghapus data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    let defaults: Record<string, any> = {};

    const defaultStudent = userProfiles.find(u => u.role === 'STUDENT') || userProfiles[0];

    if (activeTable === 'user_profiles') {
      defaults = {
        full_name: '',
        email: '',
        role: 'STUDENT',
        gender: 'PUTRA',
        current_grade: 1,
        school_name: 'SDIT Imam Bukhari',
        daily_streak: 1,
        star_points: 0,
        water_drops: 0,
        garden_tree_level: 1,
        prayer_city_name: 'KOTA MEDAN'
      };
    } else if (activeTable === 'murojaah_checklists') {
      defaults = {
        student_id: defaultStudent?.id || '',
        curriculum_title: '',
        category: 'HADITH',
        grade_level: 1,
        target_pass_count: 5,
        completed_pass_count: 0,
        mutabaah_grade: 'BL',
        parent_review_status: 'PENDING',
        arabic_text: '',
        translation: '',
        source: 'Hadis Shahih'
      };
    } else if (activeTable === 'academic_levels') {
      defaults = {
        student_id: defaultStudent?.id || '',
        grade_level: 1,
        academic_year: '2025/2026',
        is_active: true
      };
    } else if (activeTable === 'exam_cycles') {
      defaults = {
        student_id: defaultStudent?.id || '',
        level_id: 'level-grade-1',
        exam_type: 'PTS_1',
        exam_title: 'Ujian Tengah Semester (PTS) Ganjil',
        exam_date: new Date().toISOString().split('T')[0],
        target_retention: 0.90
      };
    } else if (activeTable === 'curriculum_items') {
      defaults = {
        student_id: defaultStudent?.id || '',
        title: '',
        category: 'QURAN',
        is_mastered: false,
        exam_cycle_id: 'cycle-pts-1'
      };
    } else if (activeTable === 'content_units') {
      defaults = {
        curriculum_item_id: 'curr-an-naba',
        sequence_num: 1,
        arabic_uthmani: '',
        latin_text: '',
        translation_id: '',
        dalil_source: 'Al-Qur\'an Juz 30'
      };
    } else if (activeTable === 'ibadah_daily_logs') {
      defaults = {
        student_id: defaultStudent?.id || '',
        log_date: new Date().toISOString().split('T')[0],
        sholat_subuh: 'BERJAMAAH',
        sholat_dzuhur: 'BERJAMAAH',
        sholat_ashar: 'BERJAMAAH',
        sholat_maghrib: 'BERJAMAAH',
        sholat_isya: 'BERJAMAAH',
        puasa_type: 'TIDAK_PUASA',
        parent_review_status: 'PENDING',
        reward_stars_awarded: 0,
        child_notes: ''
      };
    } else if (activeTable === 'sholat_learning_progress') {
      defaults = {
        student_id: defaultStudent?.id || '',
        step_code: 'RUKUN_01_NIAT',
        step_order: 1,
        animation_practiced_count: 1,
        reading_memorized: false,
        quiz_high_score: 100,
        parent_verified_movement: false,
        parent_verified_reading: false,
        parent_notes: ''
      };
    } else if (activeTable === 'fsrs_memory_states') {
      defaults = {
        student_id: defaultStudent?.id || '',
        unit_id: 'unit-an-naba-01',
        track_type: 'SABAQ',
        difficulty: 4.0,
        stability: 2.5,
        retrievability: 0.95,
        next_due: new Date(Date.now() + 86400000).toISOString().split('T')[0]
      };
    } else if (activeTable === 'mutabaah_logs') {
      defaults = {
        student_id: defaultStudent?.id || '',
        logged_by_role: 'PARENT',
        official_mutabaah_status: 'L',
        fsrs_rating: 3,
        parent_verified: true,
        tajwid_makhraj_notes: 'Makhraj huruf & tajwid mutqin',
        created_at: new Date().toISOString()
      };
    } else {
      defaults = {
        student_id: defaultStudent?.id || '',
        created_at: new Date().toISOString()
      };
    }

    setFormData(defaults);
    setIsEditorOpen(true);
  };

  const openEditModal = (rec: any) => {
    setEditingRecord(rec);
    setFormData({ ...rec });
    setIsEditorOpen(true);
  };

  // Filter records based on search query
  const filteredRecords = records.filter(rec => {
    if (!searchQuery) return true;
    const str = JSON.stringify(rec).toLowerCase();
    const linkedEmail = (rec.student_id ? userEmailMap[rec.student_id]?.email : '') || '';
    return str.includes(searchQuery.toLowerCase()) || linkedEmail.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // JIKA BUKAN ADMIN RESMI
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-white max-w-md w-full rounded-3xl p-6 text-center shadow-2xl border-4 border-rose-300 space-y-4">
          <div className="w-16 h-16 mx-auto bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-800">Akses Admin Ditolak</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Halaman Console Admin ini hanya dapat diakses oleh Administrator resmi:
            <span className="block mt-1 font-mono font-bold text-emerald-700 bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-200">
              imranpermadi@gmail.com
            </span>
          </p>
          <p className="text-[11px] text-slate-400">
            Akun yang sedang aktif saat ini: <strong>{currentUserEmail || 'Tamu (Belum Login)'}</strong>
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors shadow-md"
          >
            Kembali ke Aplikasi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                MutabaahKu Data Console
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE CRUD
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-md">
                Admin: <strong className="text-emerald-400">{currentUserEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTableData(activeTable)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>
      </header>

      {/* Mobile Table Selector Dropdown (Shown on mobile devices) */}
      <div className="md:hidden bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <Database className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-400 flex-shrink-0">Tabel:</span>
        <select
          value={activeTable}
          onChange={(e) => setActiveTable(e.target.value as TableName)}
          className="flex-1 bg-slate-950 text-emerald-300 text-xs font-black p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
        >
          {TABLES.map(t => (
            <option key={t.name} value={t.name}>
              {t.label} ({t.name})
            </option>
          ))}
        </select>
      </div>

      {/* Main Admin Workspace (Sidebar on Desktop + Full Responsive Table) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Table Selector Sidebar (Hidden on mobile, visible on md+) */}
        <aside className="hidden md:block w-64 bg-slate-900/60 border-r border-slate-800/80 p-3 overflow-y-auto space-y-1 flex-shrink-0">
          <div className="px-2 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tabel Database (10)</span>
          </div>

          {TABLES.map(t => (
            <button
              key={t.name}
              onClick={() => setActiveTable(t.name)}
              className={`w-full text-left p-2.5 rounded-xl transition-all text-xs font-bold flex flex-col ${
                activeTable === t.name
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              <span className="font-extrabold">{t.label}</span>
              <span className={`text-[10px] font-mono mt-0.5 truncate ${
                activeTable === t.name ? 'text-emerald-100' : 'text-slate-500'
              }`}>
                {t.name}
              </span>
            </button>
          ))}
        </aside>

        {/* Right Content Area: Responsive Data Table */}
        <main className="flex-1 flex flex-col p-3 sm:p-6 overflow-hidden bg-slate-950">
          {/* Status Notifications */}
          {statusMsg && (
            <div className={`mb-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold border ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Table Header & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 flex-shrink-0">
            <div>
              <h2 className="font-black text-base sm:text-lg text-white">
                {TABLES.find(t => t.name === activeTable)?.label}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {activeTable} &bull; <strong className="text-emerald-400">{filteredRecords.length} records</strong>
              </p>
            </div>

            {/* Search Box */}
            <div className="relative flex items-center w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kata / email pengguna..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* TABLE DISPLAY (BERBENTUK TABLE DATA RESMI DENGAN LINKED EMAIL) */}
          <div className="flex-1 overflow-auto border border-slate-800 rounded-2xl bg-slate-900/40">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs font-bold">Mengambil data dari database...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2 p-4 text-center">
                <Database className="w-8 h-8 opacity-40 text-emerald-500" />
                <span className="text-xs font-bold">Tidak ada data di tabel {activeTable}</span>
                <button
                  onClick={openCreateModal}
                  className="mt-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Record Pertama</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[11px] font-mono uppercase tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    {/* Render table columns dynamically based on activeTable */}
                    {activeTable === 'user_profiles' && (
                      <>
                        <th className="py-3 px-4">Nama & Pengguna</th>
                        <th className="py-3 px-4">Email Terdaftar</th>
                        <th className="py-3 px-4">Peran</th>
                        <th className="py-3 px-4">Kelas</th>
                        <th className="py-3 px-4">Streak & Poin</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'murojaah_checklists' && (
                      <>
                        <th className="py-3 px-4">Materi Hafalan</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Kategori / Kelas</th>
                        <th className="py-3 px-4">Progres Ulang</th>
                        <th className="py-3 px-4">Status & Nilai</th>
                        <th className="py-3 px-4">Rekaman Suara</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'curriculum_items' && (
                      <>
                        <th className="py-3 px-4">Judul Kurikulum</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4">Status Master</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'content_units' && (
                      <>
                        <th className="py-3 px-4">No</th>
                        <th className="py-3 px-4">Teks Arab (Uthmani)</th>
                        <th className="py-3 px-4">Terjemahan / Latin</th>
                        <th className="py-3 px-4">Sumber Dalil</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'ibadah_daily_logs' && (
                      <>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Sholat 5 Waktu</th>
                        <th className="py-3 px-4">Puasa</th>
                        <th className="py-3 px-4">Status Paraf</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'academic_levels' && (
                      <>
                        <th className="py-3 px-4">Tingkat Kelas SD</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Tahun Akademik</th>
                        <th className="py-3 px-4">Status Aktif</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'exam_cycles' && (
                      <>
                        <th className="py-3 px-4">Judul Siklus Ujian</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Tipe Ujian</th>
                        <th className="py-3 px-4">Target Retensi %</th>
                        <th className="py-3 px-4">Tanggal Ujian</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'sholat_learning_progress' && (
                      <>
                        <th className="py-3 px-4">Rukun Sholat (13 Rukun)</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Kali Latihan</th>
                        <th className="py-3 px-4">Hafal Bacaan</th>
                        <th className="py-3 px-4">Skor Kuis</th>
                        <th className="py-3 px-4">Verifikasi Ortu</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'fsrs_memory_states' && (
                      <>
                        <th className="py-3 px-4">Unit / Materi ID</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Track Memori</th>
                        <th className="py-3 px-4">Stabilitas (Hari)</th>
                        <th className="py-3 px-4">Retensi %</th>
                        <th className="py-3 px-4">Jadwal Ulang (Due)</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}

                    {activeTable === 'mutabaah_logs' && (
                      <>
                        <th className="py-3 px-4">Waktu Setoran</th>
                        <th className="py-3 px-4">Email Siswa Terkait</th>
                        <th className="py-3 px-4">Penginput</th>
                        <th className="py-3 px-4">Nilai Mutaba'ah</th>
                        <th className="py-3 px-4">Rating FSRS</th>
                        <th className="py-3 px-4">Status Validasi</th>
                        <th className="py-3 px-4">Catatan Tajwid</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80 font-sans text-xs">
                  {filteredRecords.map((rec) => {
                    const linkedUser = rec.student_id ? userEmailMap[rec.student_id] : (rec.email ? { email: rec.email, name: rec.full_name } : null);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* 1. USER PROFILES ROW */}
                        {activeTable === 'user_profiles' && (
                          <>
                            <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                              <span className="text-base">{rec.gender === 'PUTRI' ? '👧' : '👦'}</span>
                              <div>
                                <span>{rec.full_name}</span>
                                <span className="block text-[10px] text-slate-400 font-mono">{rec.id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-emerald-400" />
                                {rec.email || 'tanpa-email'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.role === 'PARENT' ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30' : 'bg-sky-900/60 text-sky-300 border border-sky-500/30'
                              }`}>
                                {rec.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-semibold">
                              {rec.current_grade ? `Kelas ${rec.current_grade} SD` : '-'}
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                              🔥 {rec.daily_streak || 0}d &bull; ⭐ {rec.star_points || 0}
                            </td>
                          </>
                        )}

                        {/* 2. MUROJAAH CHECKLISTS ROW */}
                        {activeTable === 'murojaah_checklists' && (
                          <>
                            <td className="py-3 px-4 font-bold text-white">
                              <div>{rec.curriculum_title}</div>
                              <span className="text-[10px] text-slate-500 font-mono">{rec.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 mr-1">
                                {rec.category}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                Kls {rec.grade_level || 1}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {rec.completed_pass_count} / {rec.target_pass_count}x
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.parent_review_status === 'APPROVED' 
                                  ? 'bg-emerald-900/60 text-emerald-300' 
                                  : 'bg-amber-900/60 text-amber-300'
                              }`}>
                                {rec.parent_review_status} ({rec.mutabaah_grade || 'BL'})
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {rec.audio_record_url ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-400/30">
                                  🎙️ {rec.audio_duration || 15}s
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">-</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* 3. CURRICULUM ITEMS ROW */}
                        {activeTable === 'curriculum_items' && (
                          <>
                            <td className="py-3 px-4 font-bold text-white">
                              {rec.title}
                              <span className="block text-[10px] text-slate-500 font-mono">{rec.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                {rec.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                              {rec.is_mastered ? '✅ Mutqin' : '⏳ Proses'}
                            </td>
                          </>
                        )}

                        {/* 4. CONTENT UNITS ROW */}
                        {activeTable === 'content_units' && (
                          <>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              #{rec.sequence_num}
                            </td>
                            <td className="py-3 px-4 font-arabic text-sm text-emerald-200">
                              {rec.arabic_uthmani}
                            </td>
                            <td className="py-3 px-4 text-slate-300 max-w-sm truncate">
                              <span className="block font-semibold text-white truncate">{rec.translation_id}</span>
                              <span className="text-[10px] text-slate-400 italic">{rec.latin_text}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {rec.dalil_source}
                            </td>
                          </>
                        )}

                        {/* 5. IBADAH DAILY LOGS ROW */}
                        {activeTable === 'ibadah_daily_logs' && (
                          <>
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {rec.log_date}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-300">
                              S:{rec.sholat_subuh?.slice(0,3)} D:{rec.sholat_dzuhur?.slice(0,3)} A:{rec.sholat_ashar?.slice(0,3)} M:{rec.sholat_maghrib?.slice(0,3)} I:{rec.sholat_isya?.slice(0,3)}
                            </td>
                            <td className="py-3 px-4 text-xs font-semibold text-amber-300">
                              {rec.puasa_type}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                                {rec.parent_review_status}
                              </span>
                            </td>
                          </>
                        )}

                        {/* 6. ACADEMIC LEVELS ROW */}
                        {activeTable === 'academic_levels' && (
                          <>
                            <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-emerald-400" />
                              <span>Kelas {rec.grade_level} SD</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-mono font-semibold">
                              {rec.academic_year || '2025/2026'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.is_active ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {rec.is_active ? '✅ Aktif' : 'Non-Aktif'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* 7. EXAM CYCLES ROW */}
                        {activeTable === 'exam_cycles' && (
                          <>
                            <td className="py-3 px-4 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-400" />
                                <span>{rec.exam_title}</span>
                              </div>
                              <span className="block text-[10px] text-slate-500 font-mono">{rec.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-900/60 text-purple-300 border border-purple-500/30">
                                {rec.exam_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {Math.round((rec.target_retention || 0.90) * 100)}%
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              {rec.exam_date || '-'}
                            </td>
                          </>
                        )}

                        {/* 8. SHOLAT LEARNING PROGRESS ROW */}
                        {activeTable === 'sholat_learning_progress' && (
                          <>
                            <td className="py-3 px-4 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span>{rec.step_code?.replace(/_/g, ' ')}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">Urutan #{rec.step_order || 1}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {rec.animation_practiced_count || 0}x Latihan
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.reading_memorized ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {rec.reading_memorized ? '✅ Hafal' : '⏳ Belum'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-300">
                              ⭐ {rec.quiz_high_score || 0}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.parent_verified_movement ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                              }`}>
                                {rec.parent_verified_movement ? '✅ Valid' : '⏳ Pending'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* 9. FSRS MEMORY STATES ROW */}
                        {activeTable === 'fsrs_memory_states' && (
                          <>
                            <td className="py-3 px-4 font-bold font-mono text-emerald-300">
                              {rec.unit_id}
                              <span className="block text-[10px] text-slate-500 font-sans">ID: {rec.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.track_type === 'SABAQ' ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30' :
                                rec.track_type === 'SABQI' ? 'bg-sky-900/60 text-sky-300 border border-sky-500/30' :
                                'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {rec.track_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              {rec.stability ? `${rec.stability} hari` : '2 hari'}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {Math.round((rec.retrievability || 1) * 100)}%
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              {rec.next_due ? rec.next_due.slice(0, 10) : '-'}
                            </td>
                          </>
                        )}

                        {/* 10. MUTABAAH LOGS ROW */}
                        {activeTable === 'mutabaah_logs' && (
                          <>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              {rec.created_at ? new Date(rec.created_at).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">
                                <Mail className="w-3 h-3 text-sky-400" />
                                {linkedUser?.email || rec.student_id}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                {rec.logged_by_role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.official_mutabaah_status === 'L' ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                              }`}>
                                {rec.official_mutabaah_status === 'L' ? 'Lancar (L)' : 'Belum Lancar (BL)'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-amber-300 font-bold">
                              FSRS: {rec.fsrs_rating || 3}/4
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                rec.parent_verified ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {rec.parent_verified ? '✅ Terverifikasi' : '⏳ Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                              {rec.tajwid_makhraj_notes || '-'}
                            </td>
                          </>
                        )}

                        {/* ACTIONS COLUMN */}
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal(rec)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all inline-flex"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            title="Hapus Data"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* FORM MODAL (CREATE / EDIT) - HUMAN-FRIENDLY FORM INPUTS, BUKAN SQL / RAW JSON EDITOR */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl border-2 border-emerald-500/40 p-5 sm:p-6 flex flex-col max-h-[92vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{editingRecord ? `Ubah Data [${activeTable}]` : `Tambah Data Baru [${activeTable}]`}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="my-4 flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
              {/* 1. USER PROFILES FORM */}
              {activeTable === 'user_profiles' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Nama Lengkap Pengguna *</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Email Pengguna (Linked Email) *</label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Peran Pengguna (Role) *</label>
                      <select
                        value={formData.role || 'STUDENT'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="STUDENT">Siswa / Santri (STUDENT)</option>
                        <option value="PARENT">Orang Tua / Wali (PARENT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Jenis Kelamin *</label>
                      <select
                        value={formData.gender || 'PUTRA'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="PUTRA">👦 Putra (Koko & Peci)</option>
                        <option value="PUTRI">👧 Putri (Mukena)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tingkat Kelas SD</label>
                      <select
                        value={formData.current_grade || 1}
                        onChange={(e) => setFormData({ ...formData, current_grade: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>Kelas {g} SD</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nama Sekolah</label>
                      <input
                        type="text"
                        value={formData.school_name || ''}
                        onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 2. MUROJAAH CHECKLISTS FORM */}
              {activeTable === 'murojaah_checklists' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Judul Materi Hafalan *</label>
                    <input
                      type="text"
                      required
                      value={formData.curriculum_title || ''}
                      onChange={(e) => setFormData({ ...formData, curriculum_title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kategori *</label>
                      <select
                        value={formData.category || 'HADITH'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="HADITH">📜 Hadis Nabi</option>
                        <option value="DOA">🤲 Doa Harian</option>
                        <option value="QURAN">📖 Al-Qur'an</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kelas SD</label>
                      <select
                        value={formData.grade_level || 3}
                        onChange={(e) => setFormData({ ...formData, grade_level: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>Kelas {g} SD</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Progres Setoran (Selesai)</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={formData.completed_pass_count || 0}
                        onChange={(e) => setFormData({ ...formData, completed_pass_count: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Target Ulangan (Maksimal)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.target_pass_count || 5}
                        onChange={(e) => setFormData({ ...formData, target_pass_count: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Status Paraf Ortu</label>
                      <select
                        value={formData.parent_review_status || 'PENDING'}
                        onChange={(e) => setFormData({ ...formData, parent_review_status: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="PENDING">Menunggu Paraf (PENDING)</option>
                        <option value="APPROVED">Disetujui / Diparaf (APPROVED)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nilai Mutaba'ah</label>
                      <select
                        value={formData.mutabaah_grade || 'BL'}
                        onChange={(e) => setFormData({ ...formData, mutabaah_grade: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="L">Lancar (L)</option>
                        <option value="BL">Belum Lancar (BL)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Teks Arab (Uthmani)</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={formData.arabic_text || ''}
                      onChange={(e) => setFormData({ ...formData, arabic_text: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-arabic text-sm"
                    />
                  </div>
                </>
              )}

              {/* 3. CURRICULUM ITEMS FORM */}
              {activeTable === 'curriculum_items' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Judul Item Kurikulum *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kategori *</label>
                      <select
                        value={formData.category || 'QURAN'}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="QURAN">📖 Al-Qur'an</option>
                        <option value="HADITH">📜 Hadis Nabi</option>
                        <option value="DOA">🤲 Doa Harian</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="is_mastered"
                        checked={formData.is_mastered || false}
                        onChange={(e) => setFormData({ ...formData, is_mastered: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <label htmlFor="is_mastered" className="font-bold text-slate-300">Sudah Mutqin (Mastered)</label>
                    </div>
                  </div>
                </>
              )}

              {/* 4. CONTENT UNITS FORM */}
              {activeTable === 'content_units' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nomor Urut Ayat/Kalimat *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={formData.sequence_num || 1}
                        onChange={(e) => setFormData({ ...formData, sequence_num: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Sumber Dalil</label>
                      <input
                        type="text"
                        value={formData.dalil_source || ''}
                        onChange={(e) => setFormData({ ...formData, dalil_source: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Teks Arab (Uthmani) *</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      required
                      value={formData.arabic_uthmani || ''}
                      onChange={(e) => setFormData({ ...formData, arabic_uthmani: e.target.value, arabic_normalized: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-arabic text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Transliterasi Latin</label>
                    <input
                      type="text"
                      value={formData.latin_text || ''}
                      onChange={(e) => setFormData({ ...formData, latin_text: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Arti / Terjemahan Bahasa Indonesia</label>
                    <textarea
                      rows={2}
                      value={formData.translation_id || ''}
                      onChange={(e) => setFormData({ ...formData, translation_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </>
              )}

              {/* 5. ACADEMIC LEVELS FORM */}
              {activeTable === 'academic_levels' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tingkat Kelas SD *</label>
                      <select
                        value={formData.grade_level || 1}
                        onChange={(e) => setFormData({ ...formData, grade_level: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6].map(g => (
                          <option key={g} value={g}>Kelas {g} SD</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tahun Akademik *</label>
                      <input
                        type="text"
                        required
                        placeholder="2025/2026"
                        value={formData.academic_year || '2025/2026'}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_active_level"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <label htmlFor="is_active_level" className="font-bold text-slate-300">Tingkat Kelas Aktif Saat Ini</label>
                  </div>
                </>
              )}

              {/* 6. EXAM CYCLES FORM */}
              {activeTable === 'exam_cycles' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Judul Siklus Ujian *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ujian Tengah Semester (PTS) Ganjil"
                      value={formData.exam_title || ''}
                      onChange={(e) => setFormData({ ...formData, exam_title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tipe Ujian *</label>
                      <select
                        value={formData.exam_type || 'PTS_1'}
                        onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="PTS_1">PTS 1 (Penilaian Tengah Semester 1)</option>
                        <option value="MID_1">MID 1</option>
                        <option value="PAS_1">PAS 1 (Penilaian Akhir Semester 1)</option>
                        <option value="PTS_2">PTS 2 (Penilaian Tengah Semester 2)</option>
                        <option value="MID_2">MID 2</option>
                        <option value="PAS_2">PAS 2 (Penilaian Akhir Semester 2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Target Retensi (%)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="1.0"
                        value={formData.target_retention || 0.90}
                        onChange={(e) => setFormData({ ...formData, target_retention: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Tanggal Pelaksanaan Ujian</label>
                    <input
                      type="date"
                      value={formData.exam_date || ''}
                      onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {/* 7. IBADAH DAILY LOGS FORM */}
              {activeTable === 'ibadah_daily_logs' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tanggal Catatan *</label>
                      <input
                        type="date"
                        required
                        value={formData.log_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                      <select
                        value={formData.student_id || ''}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                      >
                        {userProfiles.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.email || u.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Status Sholat 5 Waktu</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['sholat_subuh', 'sholat_dzuhur', 'sholat_ashar', 'sholat_maghrib', 'sholat_isya'] as const).map(waktu => (
                        <div key={waktu}>
                          <label className="text-[10px] font-bold text-slate-400 capitalize block mb-0.5">
                            {waktu.replace('sholat_', '')}
                          </label>
                          <select
                            value={formData[waktu] || 'BERJAMAAH'}
                            onChange={(e) => setFormData({ ...formData, [waktu]: e.target.value })}
                            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]"
                          >
                            <option value="BERJAMAAH">Berjamaah</option>
                            <option value="MUNFARID_TEPAT">Munfarid Tepat</option>
                            <option value="TERLAMBAT">Terlambat</option>
                            <option value="TIDAK_SHOLAT">Tidak Sholat</option>
                            <option value="UZUR">Uzur Syar'i</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Ibadah Puasa</label>
                      <select
                        value={formData.puasa_type || 'TIDAK_PUASA'}
                        onChange={(e) => setFormData({ ...formData, puasa_type: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="TIDAK_PUASA">Tidak Puasa</option>
                        <option value="SENIN_KAMIS">Puasa Senin-Kamis</option>
                        <option value="AYYAMUL_BIDH">Puasa Ayyamul Bidh</option>
                        <option value="RAMADHAN">Puasa Ramadhan</option>
                        <option value="SUNNAH_LAINNYA">Sunnah Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Status Paraf Orang Tua</label>
                      <select
                        value={formData.parent_review_status || 'PENDING'}
                        onChange={(e) => setFormData({ ...formData, parent_review_status: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="PENDING">Menunggu Paraf (PENDING)</option>
                        <option value="APPROVED">Disetujui / Diparaf (APPROVED)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Bintang Pahala Diberikan</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.reward_stars_awarded || 0}
                        onChange={(e) => setFormData({ ...formData, reward_stars_awarded: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Catatan Anak</label>
                      <input
                        type="text"
                        placeholder="Alhamdulillah tertib sholat"
                        value={formData.child_notes || ''}
                        onChange={(e) => setFormData({ ...formData, child_notes: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 8. SHOLAT LEARNING PROGRESS FORM */}
              {activeTable === 'sholat_learning_progress' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kode Rukun Sholat *</label>
                      <select
                        value={formData.step_code || 'RUKUN_01_NIAT'}
                        onChange={(e) => setFormData({ ...formData, step_code: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="RUKUN_01_NIAT">1. Niat & Berdiri Tegak</option>
                        <option value="RUKUN_02_TAKBIRATUL_IHRAM">2. Takbiratul Ihram</option>
                        <option value="RUKUN_03_SEDEKAP_IFTITAH">3. Sedekap & Doa Iftitah</option>
                        <option value="RUKUN_04_AL_FATIHAH">4. Membaca Al-Fatihah</option>
                        <option value="RUKUN_05_RUKU">5. Ruku' & Thuma'ninah</option>
                        <option value="RUKUN_06_ITIDAL">6. I'tidal & Doa</option>
                        <option value="RUKUN_07_SUJUD">7. Sujud 7 Anggota Tubuh</option>
                        <option value="RUKUN_08_DUDUK_ANTARA_SUJUD">8. Duduk Antara Dua Sujud</option>
                        <option value="RUKUN_09_TASYAHHUD_AWAL">9. Tasyahhud Awal</option>
                        <option value="RUKUN_10_TASYAHHUD_AKHIR">10. Tasyahhud Akhir</option>
                        <option value="RUKUN_11_SHOLAWAT_NABI">11. Sholawat Atas Nabi</option>
                        <option value="RUKUN_12_SALAM">12. Salam ke Kanan & Kiri</option>
                        <option value="RUKUN_13_TERTIB">13. Tertib Seluruh Rukun</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Urutan Langkah</label>
                      <input
                        type="number"
                        min={1}
                        max={13}
                        value={formData.step_order || 1}
                        onChange={(e) => setFormData({ ...formData, step_order: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Jumlah Kali Latihan</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.animation_practiced_count || 0}
                        onChange={(e) => setFormData({ ...formData, animation_practiced_count: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Skor Kuis Sholat (0-100)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.quiz_high_score || 0}
                        onChange={(e) => setFormData({ ...formData, quiz_high_score: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="reading_memorized"
                        checked={formData.reading_memorized || false}
                        onChange={(e) => setFormData({ ...formData, reading_memorized: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <label htmlFor="reading_memorized" className="font-bold text-slate-300">Bacaan Sudah Dihafal</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="parent_verified_movement"
                        checked={formData.parent_verified_movement || false}
                        onChange={(e) => setFormData({ ...formData, parent_verified_movement: e.target.checked, parent_verified_reading: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <label htmlFor="parent_verified_movement" className="font-bold text-slate-300">Verifikasi Sah dari Orang Tua</label>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Catatan Orang Tua</label>
                    <input
                      type="text"
                      placeholder="Gerakan tegak lurus sempurna"
                      value={formData.parent_notes || ''}
                      onChange={(e) => setFormData({ ...formData, parent_notes: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </>
              )}

              {/* 9. FSRS MEMORY STATES FORM */}
              {activeTable === 'fsrs_memory_states' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Unit / Materi ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="unit-an-naba-01"
                        value={formData.unit_id || ''}
                        onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Track Memori *</label>
                      <select
                        value={formData.track_type || 'SABAQ'}
                        onChange={(e) => setFormData({ ...formData, track_type: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="SABAQ">SABAQ (Hafalan Baru)</option>
                        <option value="SABQI">SABQI (Muroja'ah Dekat)</option>
                        <option value="MANZIL">MANZIL (Muroja'ah Jauh)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Stabilitas (Hari)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.stability || 2.5}
                        onChange={(e) => setFormData({ ...formData, stability: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kesulitan (1-10)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={formData.difficulty || 4.0}
                        onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Retensi (0-1.0)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={formData.retrievability || 0.95}
                        onChange={(e) => setFormData({ ...formData, retrievability: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Jadwal Muroja'ah Ulang (Next Due)</label>
                    <input
                      type="date"
                      value={formData.next_due ? formData.next_due.slice(0, 10) : ''}
                      onChange={(e) => setFormData({ ...formData, next_due: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {/* 10. MUTABAAH LOGS FORM */}
              {activeTable === 'mutabaah_logs' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <select
                      value={formData.student_id || ''}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono font-bold"
                    >
                      {userProfiles.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email || u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Penginput *</label>
                      <select
                        value={formData.logged_by_role || 'PARENT'}
                        onChange={(e) => setFormData({ ...formData, logged_by_role: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="PARENT">Orang Tua (PARENT)</option>
                        <option value="STUDENT">Siswa Sendiri (STUDENT)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nilai Mutaba'ah</label>
                      <select
                        value={formData.official_mutabaah_status || 'L'}
                        onChange={(e) => setFormData({ ...formData, official_mutabaah_status: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value="L">Lancar (L)</option>
                        <option value="BL">Belum Lancar (BL)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Rating FSRS</label>
                      <select
                        value={formData.fsrs_rating || 3}
                        onChange={(e) => setFormData({ ...formData, fsrs_rating: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      >
                        <option value={1}>1 - Ulangi (Again)</option>
                        <option value={2}>2 - Sulit (Hard)</option>
                        <option value={3}>3 - Bagus (Good)</option>
                        <option value={4}>4 - Mudah (Easy)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="parent_verified_log"
                      checked={formData.parent_verified ?? true}
                      onChange={(e) => setFormData({ ...formData, parent_verified: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    <label htmlFor="parent_verified_log" className="font-bold text-slate-300">Telah Diverifikasi Valid oleh Orang Tua / Ustadz</label>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Catatan Tajwid & Makhraj</label>
                    <input
                      type="text"
                      placeholder="Ghunnah dan mad thobi'i sudah mutqin"
                      value={formData.tajwid_makhraj_notes || ''}
                      onChange={(e) => setFormData({ ...formData, tajwid_makhraj_notes: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
