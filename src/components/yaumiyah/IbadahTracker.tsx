import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Heart, 
  Sparkles,
  Save,
  Clock,
  Calendar,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IbadahDailyLog, SholatStatus, PuasaType, PuasaCompletion } from '../../types/database';

function formatLogDateIndonesian(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[date.getDay()] || '';
    const monthName = months[date.getMonth()] || '';
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

interface IbadahTrackerProps {
  initialLog: IbadahDailyLog;
  onSaveLog: (updatedLog: IbadahDailyLog) => void;
}

export const IbadahTracker: React.FC<IbadahTrackerProps> = ({
  initialLog,
  onSaveLog
}) => {
  const [log, setLog] = useState<IbadahDailyLog>(initialLog);
  const [isSaved, setIsSaved] = useState(false);
  const [autoSaveHint, setAutoSaveHint] = useState<string | null>(null);
  const lastLoadedIdRef = useRef<string>(initialLog?.id || '');
  const lastReviewStatusRef = useRef<string>(initialLog?.parent_review_status || '');

  // Hanya muat ulang state dari props jika berganti ID catatan (ganti anak / ganti hari)
  // atau jika status paraf dari orang tua berubah (misal baru di-APPROVED).
  // Ini mencegah background sync 15 detik me-reset pilihan yang sedang diklik pengguna!
  useEffect(() => {
    if (!initialLog) return;
    const idChanged = initialLog.id !== lastLoadedIdRef.current;
    const reviewChanged = initialLog.parent_review_status !== lastReviewStatusRef.current;

    if (idChanged || reviewChanged) {
      lastLoadedIdRef.current = initialLog.id;
      lastReviewStatusRef.current = initialLog.parent_review_status;
      setLog(initialLog);
    }
  }, [initialLog]);

  // Helper Auto-Save Instan setiap kali pengguna memilih opsi
  const applyAndAutoSave = (updater: (prev: IbadahDailyLog) => IbadahDailyLog) => {
    setLog(prev => {
      const next = updater(prev);
      lastReviewStatusRef.current = next.parent_review_status;
      // Simpan langsung ke database lokal Dexie & antrean Cloud agar tidak pernah ke-reset
      onSaveLog(next);
      return next;
    });
    setAutoSaveHint('Tersimpan otomatis ✓');
    setTimeout(() => setAutoSaveHint(null), 1800);
  };

  const prayerKeys: { key: keyof IbadahDailyLog; name: string; icon: any }[] = [
    { key: 'sholat_subuh', name: 'Subuh', icon: Sunrise },
    { key: 'sholat_dzuhur', name: 'Dzuhur', icon: Sun },
    { key: 'sholat_ashar', name: 'Ashar', icon: Sun },
    { key: 'sholat_maghrib', name: 'Maghrib', icon: Sunset },
    { key: 'sholat_isya', name: 'Isya', icon: Moon },
  ];

  const statusOptions: { value: SholatStatus; label: string; activeClass: string }[] = [
    { value: 'BERJAMAAH', label: 'Berjamaah di Masjid', activeClass: 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400/50' },
    { value: 'MUNFARID_TEPAT', label: 'Tepat Waktu', activeClass: 'bg-teal-500 text-white border-teal-600 ring-2 ring-teal-400/50' },
    { value: 'TERLAMBAT', label: 'Terlambat', activeClass: 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-400/50' },
    { value: 'UZUR', label: 'Sakit / Uzur', activeClass: 'bg-slate-600 text-white border-slate-700 ring-2 ring-slate-400/50' },
    { value: 'TIDAK_SHOLAT', label: 'Belum Sholat', activeClass: 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300/60' },
  ];

  const puasaOptions: { value: PuasaType; label: string; emoji: string; desc: string }[] = [
    { value: 'TIDAK_PUASA', label: 'Tidak Puasa', emoji: '🍽️', desc: 'Hari biasa (Ifthar)' },
    { value: 'SENIN_KAMIS', label: 'Puasa Sunnah Senin - Kamis', emoji: '🌙', desc: 'Sunnah Muakkad Nabi ﷺ' },
    { value: 'AYYAMUL_BIDH', label: 'Puasa Ayyamul Bidh (13-15 H)', emoji: '🌕', desc: 'Pertengahan bulan Hijriah' },
    { value: 'RAMADHAN', label: 'Puasa Wajib Ramadhan', emoji: '🕌', desc: 'Rukun Islam ke-4' },
    { value: 'SUNNAH_LAINNYA', label: 'Puasa Sunnah Lainnya', emoji: '✨', desc: 'Arafah / Asyura / Daud' },
  ];

  const handleStatusChange = (key: keyof IbadahDailyLog, status: SholatStatus) => {
    applyAndAutoSave(prev => ({
      ...prev,
      [key]: status,
      parent_review_status: 'PENDING'
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onSaveLog(log);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Mutaba'ah Yaumiyah
            </span>
            {autoSaveHint && (
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full animate-fadeIn">
                {autoSaveHint}
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
            Ceklis Sholat 5 Waktu & Puasa Harian
          </h3>
          <p className="text-xs text-emerald-800 font-bold mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>{formatLogDateIndonesian(log.log_date || new Date().toISOString().split('T')[0])} (Hari Ini)</span>
          </p>
        </div>

        {log.parent_review_status === 'APPROVED' ? (
          <div className="flex flex-col items-end">
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Telah Diparaf Orang Tua (+{log.reward_stars_awarded || 25} ⭐)
            </span>
            {log.parent_review_notes && (
              <span className="text-[11px] text-slate-600 italic mt-1 font-semibold max-w-xs text-right truncate">
                "{log.parent_review_notes}"
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-2xl flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            Menunggu Paraf Orang Tua
          </span>
        )}
      </div>

      {/* 5 Waktu Sholat Row Grid */}
      <div className="space-y-3 mt-4">
        {prayerKeys.map(({ key, name, icon: Icon }) => {
          const currentStatus = log[key] as SholatStatus;
          return (
            <div
              key={key}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-[120px]">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-800">{name}</span>
              </div>

              {/* Status Selector Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {statusOptions.map(opt => {
                  const isSelected = currentStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStatusChange(key, opt.value)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 ${
                        isSelected
                          ? `${opt.activeClass} shadow-sm font-black`
                          : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sholat Sunnah & Puasa Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
        {/* Sholat Sunnah */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3 font-black text-amber-950 text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Sholat Sunnah Hari Ini</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="font-bold text-slate-700">Sholat Dhuha:</span>
              <div className="flex items-center gap-1.5">
                {[0, 2, 4, 8].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      applyAndAutoSave(prev => ({
                        ...prev,
                        sholat_dhuha_rakaat: r,
                        parent_review_status: 'PENDING'
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg font-black transition-all ${
                      log.sholat_dhuha_rakaat === r ? 'bg-amber-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 0 ? 'Tidak' : `${r} Rakaat`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="font-bold text-slate-700">Qiyamul Lail / Tahajjud:</span>
              <button
                type="button"
                onClick={() =>
                  applyAndAutoSave(prev => ({
                    ...prev,
                    sholat_qiyamul_lail: !prev.sholat_qiyamul_lail,
                    parent_review_status: 'PENDING'
                  }))
                }
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  log.sholat_qiyamul_lail ? 'bg-emerald-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {log.sholat_qiyamul_lail ? 'Alhamdulillah Ya 🌙' : 'Belum'}
              </button>
            </div>
          </div>
        </div>

        {/* Puasa (Custom Elegan — Tanpa <select> Bawaan Browser) */}
        <div className="bg-sky-50/60 border border-sky-200/80 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-3 font-black text-sky-950 text-sm">
            <Heart className="w-4 h-4 text-sky-600" />
            <span>Ibadah Puasa (Shaum)</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <label className="text-[11px] font-bold text-slate-600 block">Pilih Jenis Puasa Hari Ini:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {puasaOptions.map(opt => {
                const isSelected = log.puasa_type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      applyAndAutoSave(prev => ({
                        ...prev,
                        puasa_type: opt.value,
                        puasa_completion: opt.value === 'TIDAK_PUASA' ? 'NONE' : (prev.puasa_completion === 'NONE' ? 'PENUH_MAGHRIB' : prev.puasa_completion),
                        parent_review_status: 'PENDING'
                      }))
                    }
                    className={`p-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-700 font-black shadow-2xs'
                        : 'bg-white text-slate-700 border-sky-200/80 hover:border-sky-400 font-bold'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] truncate flex items-center gap-1">
                        <span>{opt.emoji}</span>
                        <span className="truncate">{opt.label}</span>
                      </div>
                      <div className={`text-[9px] truncate ${isSelected ? 'text-sky-100 font-medium' : 'text-slate-400 font-medium'}`}>
                        {opt.desc}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {log.puasa_type !== 'TIDAK_PUASA' && (
              <div className="pt-1 space-y-1">
                <label className="text-[10px] font-bold text-sky-900 block">Capaian Waktu Puasa:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      applyAndAutoSave(prev => ({
                        ...prev,
                        puasa_completion: 'PENUH_MAGHRIB' as PuasaCompletion,
                        parent_review_status: 'PENDING'
                      }))
                    }
                    className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all ${
                      log.puasa_completion === 'PENUH_MAGHRIB'
                        ? 'bg-emerald-600 text-white shadow-2xs font-black'
                        : 'bg-white border border-sky-200 text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    🌅 Penuh Sampai Maghrib
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      applyAndAutoSave(prev => ({
                        ...prev,
                        puasa_completion: 'LATIHAN_SETENGAH_HARI' as PuasaCompletion,
                        parent_review_status: 'PENDING'
                      }))
                    }
                    className={`flex-1 py-2 px-2.5 rounded-xl font-bold transition-all ${
                      log.puasa_completion === 'LATIHAN_SETENGAH_HARI'
                        ? 'bg-sky-600 text-white shadow-2xs font-black'
                        : 'bg-white border border-sky-200 text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    🌤️ Latihan Setengah Hari
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-medium">
          💡 Setiap pilihan Anda di atas langsung tersimpan otomatis & disinkronkan dengan Kebun Pahala.
        </span>
        <button
          type="button"
          onClick={handleSave}
          className="btn-chunky-emerald py-2.5 px-6 text-xs shadow-chunky-emerald"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Tersimpan ke Antrean Paraf!' : 'Simpan Ceklis Ibadah Hari Ini'}</span>
        </button>
      </div>
    </div>
  );
};
