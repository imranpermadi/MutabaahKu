import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Heart, 
  Award, 
  Sparkles,
  Save,
  Clock,
  Calendar
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

  // Sinkronisasi state ketika initialLog dari Dexie/Supabase selesai dimuat
  React.useEffect(() => {
    if (initialLog) {
      setLog(initialLog);
    }
  }, [initialLog]);

  const prayerKeys: { key: keyof IbadahDailyLog; name: string; icon: any }[] = [
    { key: 'sholat_subuh', name: 'Subuh', icon: Sunrise },
    { key: 'sholat_dzuhur', name: 'Dzuhur', icon: Sun },
    { key: 'sholat_ashar', name: 'Ashar', icon: Sun },
    { key: 'sholat_maghrib', name: 'Maghrib', icon: Sunset },
    { key: 'sholat_isya', name: 'Isya', icon: Moon },
  ];

  const statusOptions: { value: SholatStatus; label: string; color: string }[] = [
    { value: 'BERJAMAAH', label: 'Berjamaah di Masjid', color: 'bg-emerald-500 text-white' },
    { value: 'MUNFARID_TEPAT', label: 'Tepat Waktu', color: 'bg-teal-500 text-white' },
    { value: 'TERLAMBAT', label: 'Terlambat', color: 'bg-amber-400 text-amber-950' },
    { value: 'UZUR', label: 'Sakit / Uzur', color: 'bg-slate-400 text-white' },
    { value: 'TIDAK_SHOLAT', label: 'Belum Sholat', color: 'bg-slate-200 text-slate-600' },
  ];

  const handleStatusChange = (key: keyof IbadahDailyLog, status: SholatStatus) => {
    setLog(prev => ({
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
          <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Mutaba'ah Yaumiyah
          </span>
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
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(key, opt.value)}
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all ${
                      currentStatus === opt.value
                        ? `${opt.color} shadow-sm ring-2 ring-emerald-400/50`
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sholat Sunnah & Puasa Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
        {/* Sholat Sunnah */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2 font-black text-amber-950 text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Sholat Sunnah Hari Ini</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200">
              <span className="font-bold text-slate-700">Sholat Dhuha:</span>
              <div className="flex items-center gap-2">
                {[0, 2, 4, 8].map(r => (
                  <button
                    key={r}
                    onClick={() => setLog(prev => ({ ...prev, sholat_dhuha_rakaat: r }))}
                    className={`px-2 py-0.5 rounded-lg font-black ${
                      log.sholat_dhuha_rakaat === r ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {r === 0 ? 'Tidak' : `${r} Rakaat`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200">
              <span className="font-bold text-slate-700">Qiyamul Lail / Tahajjud:</span>
              <button
                onClick={() => setLog(prev => ({ ...prev, sholat_qiyamul_lail: !prev.sholat_qiyamul_lail }))}
                className={`px-3 py-1 rounded-xl font-bold ${
                  log.sholat_qiyamul_lail ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {log.sholat_qiyamul_lail ? 'Alhamdulillah Ya' : 'Belum'}
              </button>
            </div>
          </div>
        </div>

        {/* Puasa */}
        <div className="bg-sky-50/60 border border-sky-200/80 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2 font-black text-sky-950 text-sm">
            <Heart className="w-4 h-4 text-sky-600" />
            <span>Ibadah Puasa (Shaum)</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Jenis Puasa:</label>
              <select
                value={log.puasa_type}
                onChange={(e) => setLog(prev => ({ ...prev, puasa_type: e.target.value as PuasaType }))}
                className="w-full text-xs font-bold p-2 rounded-xl border border-sky-200 bg-white"
              >
                <option value="TIDAK_PUASA">Tidak Puasa</option>
                <option value="SENIN_KAMIS">Puasa Sunnah Senin - Kamis</option>
                <option value="AYYAMUL_BIDH">Puasa Ayyamul Bidh (13, 14, 15 Hijriah)</option>
                <option value="RAMADHAN">Puasa Wajib Ramadhan</option>
                <option value="SUNNAH_LAINNYA">Puasa Sunnah Lainnya</option>
              </select>
            </div>

            {log.puasa_type !== 'TIDAK_PUASA' && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setLog(prev => ({ ...prev, puasa_completion: 'PENUH_MAGHRIB' }))}
                  className={`flex-1 py-1.5 rounded-xl font-bold ${
                    log.puasa_completion === 'PENUH_MAGHRIB' ? 'bg-sky-600 text-white' : 'bg-white border border-sky-200 text-slate-600'
                  }`}
                >
                  Penuh Sampai Maghrib
                </button>
                <button
                  onClick={() => setLog(prev => ({ ...prev, puasa_completion: 'LATIHAN_SETENGAH_HARI' }))}
                  className={`flex-1 py-1.5 rounded-xl font-bold ${
                    log.puasa_completion === 'LATIHAN_SETENGAH_HARI' ? 'bg-sky-600 text-white' : 'bg-white border border-sky-200 text-slate-600'
                  }`}
                >
                  Latihan Setengah Hari
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
        <button
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
