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
  Layers,
  Sparkles,
  Mail,
  ChevronDown,
  Calendar,
  Check,
  FileText,
  GraduationCap,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { db, ensureStarterChecklists, syncChecklistToRelationalTables } from '../../lib/db';

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

interface TableMeta {
  name: TableName;
  label: string;
  emoji: string;
  group: 'MASTER_KURIKULUM' | 'AKTIVITAS_SANTRI' | 'EVALUASI_SISTEM';
  groupLabel: string;
  description: string;
  maintainedFrom: string;
  accentClass: string;
}

const TABLES: TableMeta[] = [
  // GROUP 1: MASTER KURIKULUM & AKADEMIK
  {
    name: 'academic_levels',
    label: 'Tingkat Kelas SDIT',
    emoji: '🎓',
    group: 'MASTER_KURIKULUM',
    groupLabel: '📚 Master Kurikulum & Akademik',
    description: 'Jenjang kelas aktif santri (Kelas 1 s/d 6 SDIT) & tahun ajaran.',
    maintainedFrom: 'Otomatis saat Link Anak & dikelola di Portal Orang Tua (Profil/Kelas Anak)',
    accentClass: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300'
  },
  {
    name: 'exam_cycles',
    label: 'Siklus Ujian (PTS / PAS)',
    emoji: '📅',
    group: 'MASTER_KURIKULUM',
    groupLabel: '📚 Master Kurikulum & Akademik',
    description: 'Jadwal siklus ujian sekolah: PTS 1 Ganjil, PAS 1, PTS 2 Genap, dan PAT/UKK.',
    maintainedFrom: 'Otomatis 4 Siklus Standar SDIT & dikelola di Portal Orang Tua -> Kelola Materi',
    accentClass: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300'
  },
  {
    name: 'curriculum_items',
    label: 'Item Kurikulum',
    emoji: '📖',
    group: 'MASTER_KURIKULUM',
    groupLabel: '📚 Master Kurikulum & Akademik',
    description: 'Daftar induk materi hafalan Al-Qur\'an Juz 30, Hadis Shahih, dan Doa Harian.',
    maintainedFrom: 'Dikelola Orang Tua di Portal Orang Tua -> Tab "Kelola Materi & Kurikulum"',
    accentClass: 'from-sky-500/20 to-cyan-500/10 border-sky-500/40 text-sky-300'
  },
  {
    name: 'content_units',
    label: 'Unit Konten (Ayat & Matan)',
    emoji: '📜',
    group: 'MASTER_KURIKULUM',
    groupLabel: '📚 Master Kurikulum & Akademik',
    description: 'Teks Arab Uthmani berharakat, transliterasi Latin, terjemahan Indonesia & dalil.',
    maintainedFrom: 'Tersinkronisasi otomatis saat Orang Tua menambah/mengubah materi di Portal Ortu',
    accentClass: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-300'
  },

  // GROUP 2: TARGET & AKTIVITAS HARIAN SANTRI
  {
    name: 'murojaah_checklists',
    label: 'Ceklis Muroja\'ah Hafalan',
    emoji: '✅',
    group: 'AKTIVITAS_SANTRI',
    groupLabel: '🕌 Target & Aktivitas Harian Santri',
    description: 'Lembar target pengulangan hafalan anak, rekaman suara, dan status paraf orang tua.',
    maintainedFrom: 'Materi ditambah dari Portal Ortu -> Diulang Anak -> Diparaf Orang Tua',
    accentClass: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300'
  },
  {
    name: 'ibadah_daily_logs',
    label: 'Mutaba\'ah Yaumiyah',
    emoji: '🕌',
    group: 'AKTIVITAS_SANTRI',
    groupLabel: '🕌 Target & Aktivitas Harian Santri',
    description: 'Catatan harian sholat fardhu 5 waktu, sunnah rawatib/dhuha, dan puasa.',
    maintainedFrom: 'Diisi Anak di tab Tracker Ibadah -> Disetujui 1x oleh Orang Tua',
    accentClass: 'from-emerald-500/20 to-green-500/10 border-emerald-500/40 text-emerald-300'
  },
  {
    name: 'sholat_learning_progress',
    label: 'Progres 13 Rukun Sholat',
    emoji: '🧎',
    group: 'AKTIVITAS_SANTRI',
    groupLabel: '🕌 Target & Aktivitas Harian Santri',
    description: 'Status latihan gerakan 2D, hafalan bacaan, dan skor kuis 13 Rukun Sholat.',
    maintainedFrom: 'Otomatis tercatat saat Anak berlatih di menu "13 Rukun Sholat" & Kuis',
    accentClass: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/40 text-cyan-300'
  },

  // GROUP 3: EVALUASI, AKUN & MESIN MEMORI
  {
    name: 'user_profiles',
    label: 'Profil Pengguna (Ortu & Anak)',
    emoji: '👤',
    group: 'EVALUASI_SISTEM',
    groupLabel: '🧠 Evaluasi, Akun & Mesin Memori',
    description: 'Data akun Google SSO orang tua & santri, relasi email, streak, dan saldo bintang.',
    maintainedFrom: 'Otomatis saat Login Google SSO & fitur Hubungkan Akun Anak',
    accentClass: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/40 text-indigo-300'
  },
  {
    name: 'mutabaah_logs',
    label: 'Log Setoran & Ujian',
    emoji: '🏅',
    group: 'EVALUASI_SISTEM',
    groupLabel: '🧠 Evaluasi, Akun & Mesin Memori',
    description: 'Arsip riwayat penilaian mutaba\'ah resmi: Lancar (L) / Belum Lancar (BL) & catatan tajwid.',
    maintainedFrom: 'Otomatis tercatat setiap kali Orang Tua memparaf hafalan (L / BL)',
    accentClass: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-300'
  },
  {
    name: 'fsrs_memory_states',
    label: 'State Memori FSRS-6',
    emoji: '🧠',
    group: 'EVALUASI_SISTEM',
    groupLabel: '🧠 Evaluasi, Akun & Mesin Memori',
    description: 'Parameter algoritma Spaced Repetition (Stabilitas, Kesulitan, Jadwal Ulang / Next Due).',
    maintainedFrom: 'Otomatis dihitung ulang saat hafalan diparaf Lancar (L) atau Belum Lancar (BL)',
    accentClass: 'from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/40 text-fuchsia-300'
  }
];

// Komponen Custom Dropdown Elegan (Pengganti <select> bawaan browser yang kaku)
interface CustomDropdownOption {
  value: string | number;
  label: string;
  sublabel?: string;
  badge?: string;
}

function ElegantSelect({
  value,
  options,
  onChange,
  placeholder = 'Pilih opsi...'
}: {
  value: string | number;
  options: CustomDropdownOption[];
  onChange: (val: any) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => String(o.value) === String(value)) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-left flex items-center justify-between gap-2 transition-all focus:outline-none focus:border-emerald-500"
      >
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">
            {selected ? selected.label : placeholder}
          </div>
          {selected?.sublabel && (
            <div className="text-[10px] text-emerald-400 font-mono truncate">
              {selected.sublabel}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {selected?.badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              {selected.badge}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180 text-emerald-400' : ''}`} />
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 z-50 bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/80 p-1">
            {options.map(opt => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate">{opt.label}</div>
                    {opt.sublabel && (
                      <div className="text-[10px] text-slate-400 font-mono truncate">{opt.sublabel}</div>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function AdminDashboard({ currentUserEmail, onClose }: AdminDashboardProps) {
  const isAuthorized = currentUserEmail && AUTHORIZED_ADMINS.includes(currentUserEmail.toLowerCase());

  const [activeTable, setActiveTable] = useState<TableName>('user_profiles');
  const [records, setRecords] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom Mobile / Tablet Table Explorer Drawer (Pengganti <select> browser)
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);

  // Modal State for Create / Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Map of student_id -> email & name
  const userEmailMap = userProfiles.reduce((acc, u) => {
    acc[u.id] = { email: u.email || 'tanpa-email', name: u.full_name || 'Tanpa Nama', role: u.role };
    return acc;
  }, {} as Record<string, { email: string; name: string; role: string }>);

  // Hitung jumlah baris di seluruh 10 tabel agar tampil informatif di pemilih tabel
  const refreshAllTableCounts = async () => {
    const counts: Record<string, number> = {};
    for (const t of TABLES) {
      try {
        const localCount = await (db as any)[t.name].count();
        counts[t.name] = localCount;
      } catch {
        counts[t.name] = 0;
      }
    }
    setTableCounts(counts);
  };

  // Sinkronkan & lengkapi seluruh 10 tabel relasional untuk semua siswa terdaftar
  const handleSyncAllRelationalTables = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const allUsers = await db.user_profiles.toArray();
      const students = allUsers.filter(u => u.role === 'STUDENT');
      for (const s of students) {
        await ensureStarterChecklists(s.id, s.current_grade || 1);
      }
      await refreshAllTableCounts();
      if (!silent) {
        await fetchTableData(activeTable);
        setStatusMsg({
          type: 'success',
          text: `Seluruh 10 tabel relasional berhasil disinkronkan untuk ${students.length} santri aktif!`
        });
      }
    } catch (err: any) {
      if (!silent) {
        setStatusMsg({ type: 'error', text: err.message || 'Gagal menyinkronkan tabel.' });
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

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
      await refreshAllTableCounts();
    } catch (err: any) {
      console.warn('Error fetching admin table:', err.message);
      setStatusMsg({ type: 'error', text: err.message || 'Gagal memuat data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      handleSyncAllRelationalTables(true).then(() => {
        fetchProfiles();
        fetchTableData(activeTable);
      });
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
        if (activeTable === 'murojaah_checklists') {
          await syncChecklistToRelationalTables(updatedRecord as any);
        }
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
        if (activeTable === 'murojaah_checklists') {
          await syncChecklistToRelationalTables(newRecord as any);
        }
        setStatusMsg({ type: 'success', text: `Data baru berhasil ditambahkan ke ${activeTable}!` });
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
        grade_level: defaultStudent?.current_grade || 1,
        exam_cycle_id: 'PTS_1',
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
        grade_level: defaultStudent?.current_grade || 1,
        academic_year: '2025/2026',
        is_active: true
      };
    } else if (activeTable === 'exam_cycles') {
      defaults = {
        student_id: defaultStudent?.id || '',
        level_id: `level-${defaultStudent?.id || 'std'}-grade-1`,
        exam_type: 'PTS_1',
        exam_title: 'PTS 1 — Penilaian Tengah Semester Ganjil',
        exam_date: new Date().toISOString().split('T')[0],
        target_retention: 0.90
      };
    } else if (activeTable === 'curriculum_items') {
      defaults = {
        student_id: defaultStudent?.id || '',
        title: '',
        category: 'QURAN',
        is_mastered: false,
        exam_cycle_id: 'PTS_1'
      };
    } else if (activeTable === 'content_units') {
      defaults = {
        curriculum_item_id: 'curr-an-nas',
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
        unit_id: 'unit-an-nas-01',
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
        fsrs_rating: 4,
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

  const activeTableMeta = TABLES.find(t => t.name === activeTable) || TABLES[0];
  const studentOptions: CustomDropdownOption[] = userProfiles.map(u => ({
    value: u.id,
    label: `${u.gender === 'PUTRI' ? '👧' : '👦'} ${u.full_name}`,
    sublabel: u.email || u.id,
    badge: u.role
  }));

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
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
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
                <span>MutabaahKu Data Console</span>
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => handleSyncAllRelationalTables(false)}
            disabled={isLoading}
            title="Lengkapi & Sinkronkan otomatis seluruh 10 tabel relasional untuk semua santri"
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Sinkronkan 10 Tabel</span>
          </button>

          <button
            onClick={() => fetchTableData(activeTable)}
            disabled={isLoading}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>
      </header>

      {/* CUSTOM MOBILE & TABLET TABLE SELECTOR BAR (Menggantikan <select> bawaan browser yang jelek) */}
      <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-3.5 py-2.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsTablePickerOpen(true)}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 flex items-center justify-between gap-3 text-left shadow-lg transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl flex-shrink-0">
              {activeTableMeta.emoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Tabel Aktif
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {tableCounts[activeTable] ?? records.length} Data
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-white truncate">
                {activeTableMeta.label}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {activeTableMeta.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-black flex-shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>Pilih Tabel</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* MODAL / DRAWER PEMILIH TABEL ELEGAN & INFORMATIF (UNTUK MOBILE & DESKTOP) */}
      {isTablePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-emerald-500/40 flex flex-col max-h-[88vh] shadow-2xl overflow-hidden">
            {/* Sheet Header */}
            <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white">
                    Pilih Tabel Database (10 Tabel Relasional)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ketuk tabel untuk melihat data, sumber sinkronisasi, dan tempat pengelolaannya
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTablePickerOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categorized Table List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {(['MASTER_KURIKULUM', 'AKTIVITAS_SANTRI', 'EVALUASI_SISTEM'] as const).map(groupKey => {
                const groupItems = TABLES.filter(t => t.group === groupKey);
                return (
                  <div key={groupKey} className="space-y-2.5">
                    <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 px-1 flex items-center justify-between">
                      <span>{groupItems[0]?.groupLabel}</span>
                      <span className="text-[10px] font-mono text-slate-500">{groupItems.length} Tabel</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {groupItems.map(t => {
                        const isSelected = activeTable === t.name;
                        const count = tableCounts[t.name] ?? 0;

                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => {
                              setActiveTable(t.name);
                              setIsTablePickerOpen(false);
                            }}
                            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-gradient-to-r from-emerald-950/90 to-slate-900 border-emerald-400 shadow-lg ring-2 ring-emerald-500/20'
                                : 'bg-slate-950/70 hover:bg-slate-800/70 border-slate-800/90'
                            }`}
                          >
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.accentClass} border flex items-center justify-center text-xl flex-shrink-0 mt-0.5`}>
                              {t.emoji}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-black text-xs sm:text-sm text-white truncate">
                                  {t.label}
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${
                                    count > 0
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  }`}>
                                    {count} Data
                                  </span>
                                  {isSelected && (
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-[10px] font-mono text-emerald-400/90">
                                {t.name}
                              </div>

                              <p className="text-[11px] text-slate-300 leading-snug">
                                {t.description}
                              </p>

                              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-amber-300/90 font-semibold">
                                <span>📍 Sumber Data:</span>
                                <span className="text-slate-300">{t.maintainedFrom}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Workspace (Sidebar on Desktop + Full Responsive Table) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Categorized Table Selector Sidebar (Visible on md+) */}
        <aside className="hidden md:block w-72 bg-slate-900/60 border-r border-slate-800/80 p-3 overflow-y-auto space-y-4 flex-shrink-0">
          {(['MASTER_KURIKULUM', 'AKTIVITAS_SANTRI', 'EVALUASI_SISTEM'] as const).map(groupKey => {
            const groupItems = TABLES.filter(t => t.group === groupKey);
            return (
              <div key={groupKey} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400/90">
                  {groupItems[0]?.groupLabel}
                </div>
                {groupItems.map(t => {
                  const isSelected = activeTable === t.name;
                  const count = tableCounts[t.name] ?? 0;
                  return (
                    <button
                      key={t.name}
                      onClick={() => setActiveTable(t.name)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all text-xs flex items-center justify-between gap-2 border ${
                        isSelected
                          ? 'bg-emerald-600/25 border-emerald-500/60 text-white shadow-sm'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0">{t.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-extrabold truncate text-white">{t.label}</div>
                          <div className={`text-[10px] font-mono truncate ${
                            isSelected ? 'text-emerald-300' : 'text-slate-500'
                          }`}>
                            {t.name}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : count > 0
                          ? 'bg-slate-800 text-emerald-400'
                          : 'bg-slate-800 text-amber-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
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

          {/* Informative Table Architecture & Source Banner */}
          <div className="mb-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-start gap-3 max-w-2xl">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeTableMeta.accentClass} border flex items-center justify-center text-xl flex-shrink-0`}>
                {activeTableMeta.emoji}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-black text-sm sm:text-base text-white">
                    {activeTableMeta.label}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                    {activeTableMeta.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {filteredRecords.length} Baris Data
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {activeTableMeta.description}
                </p>
                <div className="text-[11px] text-amber-300/95 font-semibold flex items-center gap-1.5 pt-0.5">
                  <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Alur & Maintain Data: <strong className="text-white">{activeTableMeta.maintainedFrom}</strong></span>
                </div>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative flex items-center w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kata / email santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
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
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3 p-6 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
                  {activeTableMeta.emoji}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-black text-white">Belum Ada Data di {activeTableMeta.label}</div>
                  <p className="text-xs text-slate-400">
                    {activeTableMeta.maintainedFrom}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => handleSyncAllRelationalTables(false)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Isi Otomatis dari Data Santri</span>
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Manual</span>
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[11px] font-mono uppercase tracking-wider sticky top-0 border-b border-slate-800 z-10">
                  <tr>
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
                        <th className="py-3 px-4">Kategori & Siklus</th>
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
                                Kls {rec.grade_level || 1} &bull; {rec.exam_cycle_id || 'PTS_1'}
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
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 mr-1.5">
                                {rec.category}
                              </span>
                              <span className="text-[10px] font-mono text-purple-300">
                                {rec.exam_cycle_id || 'PTS_1'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                              {rec.is_mastered ? '✅ Mutqin (L)' : '⏳ Proses Hafalan'}
                            </td>
                          </>
                        )}

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

      {/* FORM MODAL (CREATE / EDIT) DENGAN CUSTOM ELEGANT DROPDOWN (TANPA <select> BROWSER) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl border-2 border-emerald-500/40 p-5 sm:p-6 flex flex-col max-h-[92vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{editingRecord ? `Ubah Data [${activeTableMeta.label}]` : `Tambah Data [${activeTableMeta.label}]`}</span>
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="my-4 flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
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
                      <ElegantSelect
                        value={formData.role || 'STUDENT'}
                        onChange={(val) => setFormData({ ...formData, role: val })}
                        options={[
                          { value: 'STUDENT', label: '👦 Siswa / Santri', sublabel: 'STUDENT' },
                          { value: 'PARENT', label: '👨‍👩‍👧 Orang Tua / Wali', sublabel: 'PARENT' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Jenis Kelamin *</label>
                      <ElegantSelect
                        value={formData.gender || 'PUTRA'}
                        onChange={(val) => setFormData({ ...formData, gender: val })}
                        options={[
                          { value: 'PUTRA', label: '👦 Putra (Koko & Peci)', sublabel: 'PUTRA' },
                          { value: 'PUTRI', label: '👧 Putri (Mukena)', sublabel: 'PUTRI' }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tingkat Kelas SDIT</label>
                      <ElegantSelect
                        value={formData.current_grade || 1}
                        onChange={(val) => setFormData({ ...formData, current_grade: Number(val) })}
                        options={[1, 2, 3, 4, 5, 6].map(g => ({
                          value: g,
                          label: `Kelas ${g} SDIT`,
                          badge: `Level ${g}`
                        }))}
                      />
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
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kategori *</label>
                      <ElegantSelect
                        value={formData.category || 'HADITH'}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                        options={[
                          { value: 'QURAN', label: '📖 Al-Qur\'an Juz 30', badge: 'QURAN' },
                          { value: 'HADITH', label: '📜 Hadis Shahih', badge: 'HADITH' },
                          { value: 'DOA', label: '🤲 Doa Harian', badge: 'DOA' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kelas SD</label>
                      <ElegantSelect
                        value={formData.grade_level || 1}
                        onChange={(val) => setFormData({ ...formData, grade_level: Number(val) })}
                        options={[1, 2, 3, 4, 5, 6].map(g => ({
                          value: g,
                          label: `Kelas ${g} SDIT`
                        }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Status Paraf Ortu</label>
                      <ElegantSelect
                        value={formData.parent_review_status || 'PENDING'}
                        onChange={(val) => setFormData({ ...formData, parent_review_status: val })}
                        options={[
                          { value: 'PENDING', label: '⏳ Menunggu Paraf', badge: 'PENDING' },
                          { value: 'APPROVED', label: '✅ Telah Diparaf Resmi', badge: 'APPROVED' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nilai Mutaba'ah</label>
                      <ElegantSelect
                        value={formData.mutabaah_grade || 'BL'}
                        onChange={(val) => setFormData({ ...formData, mutabaah_grade: val })}
                        options={[
                          { value: 'L', label: '🌟 Lancar / Mutqin (L)', badge: 'L' },
                          { value: 'BL', label: '🔄 Belum Lancar (BL)', badge: 'BL' }
                        ]}
                      />
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
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Kategori *</label>
                      <ElegantSelect
                        value={formData.category || 'QURAN'}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                        options={[
                          { value: 'QURAN', label: '📖 Al-Qur\'an' },
                          { value: 'HADITH', label: '📜 Hadis Nabi' },
                          { value: 'DOA', label: '🤲 Doa Harian' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Siklus Ujian *</label>
                      <ElegantSelect
                        value={formData.exam_cycle_id || 'PTS_1'}
                        onChange={(val) => setFormData({ ...formData, exam_cycle_id: val })}
                        options={[
                          { value: 'PTS_1', label: 'PTS 1 (Semester Ganjil)' },
                          { value: 'PAS_1', label: 'PAS 1 (Akhir Ganjil)' },
                          { value: 'PTS_2', label: 'PTS 2 (Semester Genap)' },
                          { value: 'PAS_2', label: 'PAT / UKK (Kenaikan Kelas)' }
                        ]}
                      />
                    </div>
                  </div>
                </>
              )}

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

              {activeTable === 'academic_levels' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tingkat Kelas SD *</label>
                      <ElegantSelect
                        value={formData.grade_level || 1}
                        onChange={(val) => setFormData({ ...formData, grade_level: Number(val) })}
                        options={[1, 2, 3, 4, 5, 6].map(g => ({
                          value: g,
                          label: `Kelas ${g} SDIT`
                        }))}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tahun Akademik *</label>
                      <input
                        type="text"
                        required
                        value={formData.academic_year || '2025/2026'}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'exam_cycles' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Judul Siklus Ujian *</label>
                    <input
                      type="text"
                      required
                      value={formData.exam_title || ''}
                      onChange={(e) => setFormData({ ...formData, exam_title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa (Linked Email) *</label>
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tipe Ujian *</label>
                      <ElegantSelect
                        value={formData.exam_type || 'PTS_1'}
                        onChange={(val) => setFormData({ ...formData, exam_type: val })}
                        options={[
                          { value: 'PTS_1', label: 'PTS 1 (Tengah Semester Ganjil)' },
                          { value: 'PAS_1', label: 'PAS 1 (Akhir Semester Ganjil)' },
                          { value: 'PTS_2', label: 'PTS 2 (Tengah Semester Genap)' },
                          { value: 'PAS_2', label: 'PAT / UKK (Kenaikan Kelas)' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Tanggal Ujian</label>
                      <input
                        type="date"
                        value={formData.exam_date || ''}
                        onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

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
                      <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa *</label>
                      <ElegantSelect
                        value={formData.student_id || ''}
                        onChange={(val) => setFormData({ ...formData, student_id: val })}
                        options={studentOptions}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Ibadah Puasa</label>
                      <ElegantSelect
                        value={formData.puasa_type || 'TIDAK_PUASA'}
                        onChange={(val) => setFormData({ ...formData, puasa_type: val })}
                        options={[
                          { value: 'TIDAK_PUASA', label: 'Tidak Puasa' },
                          { value: 'SENIN_KAMIS', label: '🌙 Puasa Senin-Kamis' },
                          { value: 'AYYAMUL_BIDH', label: '🌕 Puasa Ayyamul Bidh' },
                          { value: 'RAMADHAN', label: '✨ Puasa Ramadhan' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Status Paraf Orang Tua</label>
                      <ElegantSelect
                        value={formData.parent_review_status || 'PENDING'}
                        onChange={(val) => setFormData({ ...formData, parent_review_status: val })}
                        options={[
                          { value: 'PENDING', label: '⏳ Menunggu Paraf' },
                          { value: 'APPROVED', label: '✅ Telah Diparaf Resmi' }
                        ]}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'sholat_learning_progress' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa *</label>
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Langkah Rukun Sholat *</label>
                    <ElegantSelect
                      value={formData.step_code || 'RUKUN_01_NIAT'}
                      onChange={(val) => setFormData({ ...formData, step_code: val })}
                      options={[
                        { value: 'RUKUN_01_NIAT', label: '1. Niat & Berdiri Tegak' },
                        { value: 'RUKUN_02_TAKBIRATUL_IHRAM', label: '2. Takbiratul Ihram' },
                        { value: 'RUKUN_03_SEDEKAP_IFTITAH', label: '3. Sedekap & Doa Iftitah' },
                        { value: 'RUKUN_04_AL_FATIHAH', label: '4. Membaca Al-Fatihah' },
                        { value: 'RUKUN_05_RUKU', label: '5. Ruku\' & Thuma\'ninah' },
                        { value: 'RUKUN_06_ITIDAL', label: '6. I\'tidal & Doa' },
                        { value: 'RUKUN_07_SUJUD_PERTAMA', label: '7. Sujud 7 Anggota Tubuh' }
                      ]}
                    />
                  </div>
                </>
              )}

              {activeTable === 'fsrs_memory_states' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa *</label>
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Unit ID *</label>
                      <input
                        type="text"
                        required
                        value={formData.unit_id || ''}
                        onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Track Memori *</label>
                      <ElegantSelect
                        value={formData.track_type || 'SABAQ'}
                        onChange={(val) => setFormData({ ...formData, track_type: val })}
                        options={[
                          { value: 'SABAQ', label: 'SABAQ (Hafalan Baru)' },
                          { value: 'SABQI', label: 'SABQI (Muroja\'ah Dekat)' },
                          { value: 'MANZIL', label: 'MANZIL (Mutqin / Terjaga)' }
                        ]}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'mutabaah_logs' && (
                <>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Hubungkan ke Siswa *</label>
                    <ElegantSelect
                      value={formData.student_id || ''}
                      onChange={(val) => setFormData({ ...formData, student_id: val })}
                      options={studentOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Nilai Mutaba'ah</label>
                      <ElegantSelect
                        value={formData.official_mutabaah_status || 'L'}
                        onChange={(val) => setFormData({ ...formData, official_mutabaah_status: val })}
                        options={[
                          { value: 'L', label: '🌟 Lancar (L)' },
                          { value: 'BL', label: '🔄 Belum Lancar (BL)' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Catatan Tajwid & Makhraj</label>
                      <input
                        type="text"
                        value={formData.tajwid_makhraj_notes || ''}
                        onChange={(e) => setFormData({ ...formData, tajwid_makhraj_notes: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
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
