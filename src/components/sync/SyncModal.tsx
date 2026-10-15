import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Wifi, 
  WifiOff, 
  Database, 
  ShieldCheck, 
  Smartphone, 
  LogOut,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  executeFullSync, 
  signInWithGoogle, 
  signOutUser, 
  getCurrentUser, 
  isSupabaseConfigured,
  SyncResult 
} from '../../lib/supabase';
import { db } from '../../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncCompleted?: () => void;
}

export function SyncModal({ isOpen, onClose, onSyncCompleted }: SyncModalProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(
    localStorage.getItem('mutabaahku_last_synced')
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Dexie live counts for the 10 tables
  const userProfileCount = useLiveQuery(() => db.user_profiles.count()) || 0;
  const academicLevelCount = useLiveQuery(() => db.academic_levels.count()) || 0;
  const examCycleCount = useLiveQuery(() => db.exam_cycles.count()) || 0;
  const curriculumItemCount = useLiveQuery(() => db.curriculum_items.count()) || 0;
  const contentUnitCount = useLiveQuery(() => db.content_units.count()) || 0;
  const checklistCount = useLiveQuery(() => db.murojaah_checklists.count()) || 0;
  const fsrsStateCount = useLiveQuery(() => db.fsrs_memory_states.count()) || 0;
  const mutabaahLogCount = useLiveQuery(() => db.mutabaah_logs.count()) || 0;
  const ibadahLogCount = useLiveQuery(() => db.ibadah_daily_logs.count()) || 0;
  const sholatProgressCount = useLiveQuery(() => db.sholat_learning_progress.count()) || 0;
  const pendingQueueCount = useLiveQuery(() => db.sync_queue.where('status').equals('PENDING').count()) || 0;

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user && user.email) {
        setUserEmail(user.email);
      }
    };
    checkUser();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const result = await executeFullSync(userEmail || undefined);
      setSyncResult(result);
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      } else {
        setLastSynced(result.timestamp);
        if (onSyncCompleted) onSyncCompleted();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyinkronkan data.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal login dengan Google.');
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setUserEmail(null);
    window.location.reload();
  };

  const formatLastSyncedTime = (isoString: string | null) => {
    if (!isoString) return 'Belum pernah disinkronkan';
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const databaseTables = [
    { name: 'Profil Pengguna', count: userProfileCount, table: 'user_profiles' },
    { name: 'Tingkat Kelas SDIT', count: academicLevelCount, table: 'academic_levels' },
    { name: 'Siklus Ujian (PTS/PAS)', count: examCycleCount, table: 'exam_cycles' },
    { name: 'Item Kurikulum Hafalan', count: curriculumItemCount, table: 'curriculum_items' },
    { name: 'Unit Konten Ayat & Hadis', count: contentUnitCount, table: 'content_units' },
    { name: 'Ceklis Muroja\'ah (Kelas 1-6)', count: checklistCount, table: 'murojaah_checklists' },
    { name: 'Algoritma FSRS-6 Retensi', count: fsrsStateCount, table: 'fsrs_memory_states' },
    { name: 'Log Setoran Mutaba\'ah', count: mutabaahLogCount, table: 'mutabaah_logs' },
    { name: 'Mutaba\'ah Yaumiyah Harian', count: ibadahLogCount, table: 'ibadah_daily_logs' },
    { name: 'Progres 13 Gerakan Sholat', count: sholatProgressCount, table: 'sholat_learning_progress' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-4 border-emerald-500/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight flex items-center gap-2">
                Sinkronisasi Cloud & Multi-Perangkat
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Sistem Offline-First dengan Kesetaraan 10 Tabel Database
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Koneksi & Akun Google SSO */}
          <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-emerald-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">
                    {isOnline ? 'Terhubung Internet (Online)' : 'Mode Offline Aktif'}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isOnline ? 'CLOUD SYNC READY' : 'OFFLINE LOCAL'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {userEmail ? (
                    <span className="font-medium text-emerald-700">Google SSO: {userEmail}</span>
                  ) : (
                    'Akun Tamu (Tersimpan Lokal di Perangkat ini)'
                  )}
                </p>
              </div>
            </div>

            {userEmail ? (
              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                Masuk Google SSO
              </button>
            )}
          </div>

          {/* Feedback & Result Notifications */}
          {errorMessage && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {syncResult && syncResult.success && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black text-sm block text-emerald-950">
                  Alhamdulillah, 10 Tabel Berhasil Disinkronkan!
                </span>
                <span className="text-emerald-700">
                  {syncResult.pushed} data lokal diunggah &bull; {syncResult.pulled} data cloud diperbarui.
                </span>
              </div>
            </div>
          )}

          {/* Hero CTA Button: Sinkronkan Sekarang */}
          <div className="space-y-2">
            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-chunky-emerald transition-all active:translate-y-1 ${
                isSyncing 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-b-4 border-slate-400' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sedang Menyinkronkan 10 Tabel...' : 'Sinkronkan Sekarang'}</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
              <span>Sinkronisasi Terakhir: {formatLastSyncedTime(lastSynced)}</span>
              {pendingQueueCount > 0 && (
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {pendingQueueCount} perubahan pending
                </span>
              )}
            </div>
          </div>

          {/* Multi-Device Peace of Mind Guarantee Banner */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200/70 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="text-xs text-teal-950 space-y-1">
              <h4 className="font-black text-teal-950 flex items-center gap-1.5">
                Pindah Perangkat Tanpa Kehilangan Data
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h4>
              <p className="text-teal-800 leading-relaxed font-medium">
                Cukup buka MutabaahKu di HP baru atau tablet anak, login dengan Google yang sama, lalu tekan tombol <strong>Sinkronkan</strong>. Seluruh riwayat hafalan, poin bintang, pohon kurma, dan paraf orang tua otomatis kembali 100%!
              </p>
            </div>
          </div>

          {/* 10 Database Tables Parity Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Status 10 Tabel Identik (Lokal IndexedDB & Cloud Supabase)
              </h3>
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                10 / 10 Tabel Aktif
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {databaseTables.map((tbl, idx) => (
                <div 
                  key={tbl.table}
                  className="bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 block truncate text-[11px]">
                        {tbl.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {tbl.table}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {tbl.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100/90 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tersimpan aman dengan Row-Level Security (RLS)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
