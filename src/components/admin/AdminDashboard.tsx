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
  Key,
  Users,
  Layers,
  Sparkles
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Create / Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [editorJson, setEditorJson] = useState('');

  // Fetch data live from Supabase
  const fetchTableData = async (tableName: TableName) => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      if (!supabase) {
        // Fallback to local Dexie if Supabase not configured
        const localData = await (db as any)[tableName].toArray();
        setRecords(localData);
        return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false } as any)
        .limit(100);

      if (error) {
        // If created_at doesn't exist on this table, fetch without order
        const fallback = await supabase.from(tableName).select('*').limit(100);
        if (fallback.error) throw fallback.error;
        setRecords(fallback.data || []);
      } else {
        setRecords(data || []);
      }
    } catch (err: any) {
      console.warn('Error fetching admin table:', err.message);
      // Fallback to local Dexie
      try {
        const localData = await (db as any)[tableName].toArray();
        setRecords(localData);
        setStatusMsg({ type: 'error', text: `Gagal memuat live cloud: ${err.message}. Menampilkan cache lokal.` });
      } catch (localErr: any) {
        setStatusMsg({ type: 'error', text: err.message || 'Gagal memuat data.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchTableData(activeTable);
    }
  }, [activeTable, isAuthorized]);

  // Handle Save (Create or Update)
  const handleSaveRecord = async () => {
    try {
      const parsedData = JSON.parse(editorJson);
      setIsLoading(true);

      if (editingRecord && editingRecord.id) {
        // UPDATE
        if (supabase) {
          const { error } = await supabase
            .from(activeTable)
            .update(parsedData)
            .eq('id', editingRecord.id);
          if (error) throw error;
        }
        // Update local Dexie
        await (db as any)[activeTable].put({ ...editingRecord, ...parsedData });
        setStatusMsg({ type: 'success', text: `Record ${editingRecord.id} berhasil diperbarui di Supabase Cloud!` });
      } else {
        // CREATE
        const newId = parsedData.id || `record-${Date.now()}`;
        const dataToInsert = { ...parsedData, id: newId };
        if (supabase) {
          const { error } = await supabase
            .from(activeTable)
            .insert(dataToInsert);
          if (error) throw error;
        }
        // Insert local Dexie
        await (db as any)[activeTable].put(dataToInsert);
        setStatusMsg({ type: 'success', text: `Record baru berhasil ditambahkan ke Supabase Cloud!` });
      }

      setIsEditorOpen(false);
      setEditingRecord(null);
      await fetchTableData(activeTable);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Format JSON tidak valid atau gagal menyimpan.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm(`Yakin ingin menghapus record [${recordId}] dari Cloud Supabase? Tindakan ini permanen.`)) {
      return;
    }

    setIsLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase
          .from(activeTable)
          .delete()
          .eq('id', recordId);
        if (error) throw error;
      }
      // Delete from local Dexie
      await (db as any)[activeTable].delete(recordId);
      setStatusMsg({ type: 'success', text: `Record [${recordId}] berhasil dihapus dari Supabase!` });
      await fetchTableData(activeTable);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal menghapus record.' });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    // Template JSON default berdasarkan tabel aktif
    let defaultTemplate: any = { created_at: new Date().toISOString() };
    if (activeTable === 'user_profiles') {
      defaultTemplate = {
        email: 'user@example.com',
        full_name: 'Nama Pengguna',
        role: 'STUDENT',
        gender: 'PUTRA',
        prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
        prayer_city_name: 'KOTA MEDAN',
        daily_streak: 1,
        star_points: 0,
        water_drops: 0,
        garden_tree_level: 1
      };
    } else if (activeTable === 'murojaah_checklists') {
      defaultTemplate = {
        student_id: 'student-id',
        curriculum_title: 'Surat / Hadis Baru',
        category: 'HADITH',
        grade_level: 1,
        target_pass_count: 5,
        completed_pass_count: 0,
        mutabaah_grade: 'BL',
        parent_review_status: 'PENDING'
      };
    }
    setEditorJson(JSON.stringify(defaultTemplate, null, 2));
    setIsEditorOpen(true);
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    setEditorJson(JSON.stringify(record, null, 2));
    setIsEditorOpen(true);
  };

  // Filter records based on search query
  const filteredRecords = records.filter(rec => {
    if (!searchQuery) return true;
    const str = JSON.stringify(rec).toLowerCase();
    return str.includes(searchQuery.toLowerCase());
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
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-black text-base text-white tracking-tight flex items-center gap-2">
                MutabaahKu Admin Console
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE CLOUD
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Otorisasi Administrator: <strong className="text-emerald-400">{currentUserEmail}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTableData(activeTable)}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Cloud</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Table View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Table Selector Sidebar */}
        <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 p-3 overflow-y-auto space-y-1 flex-shrink-0">
          <div className="px-2 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tabel Supabase (10)</span>
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

        {/* Right Content Area */}
        <main className="flex-1 flex flex-col p-6 overflow-hidden bg-slate-950">
          {/* Status Notifications */}
          {statusMsg && (
            <div className={`mb-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold border ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Table Header & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 flex-shrink-0">
            <div>
              <h2 className="font-black text-lg text-white">
                {TABLES.find(t => t.name === activeTable)?.label}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {activeTable} &bull; {filteredRecords.length} records ditemukan
              </p>
            </div>

            {/* Search Box */}
            <div className="relative flex items-center w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari dalam tabel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table Records List */}
          <div className="flex-1 overflow-auto border border-slate-800 rounded-2xl bg-slate-900/40">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs font-bold">Mengambil data dari Supabase Cloud...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2">
                <Database className="w-8 h-8 opacity-40" />
                <span className="text-xs font-bold">Tidak ada data di tabel {activeTable}</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 text-[11px] font-mono uppercase tracking-wider sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Ringkasan Data</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-emerald-400 truncate max-w-[140px]">
                        {rec.id}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 truncate max-w-xl font-sans">
                        {rec.title || rec.full_name || rec.curriculum_title || rec.email || rec.log_date || JSON.stringify(rec).slice(0, 100)}
                      </td>
                      <td className="py-2.5 px-4 text-right space-x-1 flex-shrink-0 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(rec)}
                          title="Edit Record"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all inline-flex"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          title="Hapus Record"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all inline-flex"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Modal Editor Form (Create / Edit) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border-2 border-emerald-500/40 p-6 flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-base text-white">
                {editingRecord ? `Ubah Data [${editingRecord.id}]` : `Tambah Data Baru ke [${activeTable}]`}
              </h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 flex-1 flex flex-col space-y-2">
              <label className="text-[11px] font-bold text-slate-400">
                Payload Data (Format JSON Standar):
              </label>
              <textarea
                value={editorJson}
                onChange={(e) => setEditorJson(e.target.value)}
                rows={14}
                className="w-full flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRecord}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan ke Supabase Cloud'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
