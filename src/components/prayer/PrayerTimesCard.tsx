import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sparkles, 
  Search,
  Check
} from 'lucide-react';
import { 
  fetchPrayerTimes, 
  getNextPrayer, 
  PrayerTimes, 
  DEFAULT_PRAYER_TIMES, 
  searchCities,
  CityItem
} from '../../lib/prayerApi';

interface PrayerTimesCardProps {
  cityId?: string;
  cityName?: string;
  onCityChanged?: (cityId: string, cityName: string) => void;
}

export const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({
  cityId = '58a2fc6ed39fd083f55d4182bf88826d',
  cityName = 'KOTA MEDAN',
  onCityChanged
}) => {
  const [times, setTimes] = useState<PrayerTimes>(DEFAULT_PRAYER_TIMES);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remainingMinutes: number }>({
    name: 'Ashar',
    time: '15:46',
    remainingMinutes: 45
  });
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityItem[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  useEffect(() => {
    loadPrayerData(cityId);
  }, [cityId]);

  const loadPrayerData = async (cId: string) => {
    setIsLoadingTimes(true);
    const data = await fetchPrayerTimes(cId);
    setTimes(data);
    setNextPrayer(getNextPrayer(data));
    setIsLoadingTimes(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await searchCities(searchQuery.trim());
    setSearchResults(res);
  };

  const handleSelectCity = (c: CityItem) => {
    setIsSearchingCity(false);
    setSearchQuery('');
    setSearchResults([]);
    if (onCityChanged) {
      onCityChanged(c.id, c.lokasi);
    } else {
      loadPrayerData(c.id);
    }
  };

  const formatCountdown = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h} jam ${m} menit lagi`;
    return `${m} menit lagi`;
  };

  const prayerList = [
    { name: 'Subuh', time: times.subuh, icon: Sunrise, active: nextPrayer.name === 'Subuh' },
    { name: 'Dzuhur', time: times.dzuhur, icon: Sun, active: nextPrayer.name === 'Dzuhur' },
    { name: 'Ashar', time: times.ashar, icon: Sun, active: nextPrayer.name === 'Ashar' },
    { name: 'Maghrib', time: times.maghrib, icon: Sunset, active: nextPrayer.name === 'Maghrib' },
    { name: 'Isya', time: times.isya, icon: Moon, active: nextPrayer.name === 'Isya' }
  ];

  return (
    <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6 overflow-hidden relative">
      {/* City Selector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <button
          onClick={() => setIsSearchingCity(!isSearchingCity)}
          className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{cityName}</span>
          <Search className="w-3 h-3 text-slate-400 ml-1" />
        </button>

        <span className="text-xs text-slate-400 font-semibold">
          Kemenag RI • {times.tanggal}
        </span>
      </div>

      {/* City Search Dropdown Modal */}
      {isSearchingCity && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Cari nama kabupaten/kota... (misal: Bandung, Surabaya)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="btn-chunky-emerald py-1.5 px-3 text-xs">
              Cari
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-100">
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCity(c)}
                  className="w-full text-left text-xs py-1.5 px-2 hover:bg-emerald-50 rounded-lg font-medium text-slate-700 flex items-center justify-between"
                >
                  <span>{c.lokasi}</span>
                  <Check className="w-3 h-3 text-emerald-600 opacity-0 hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Next Prayer Countdown Banner (Dynamic Visual) */}
      <div className="mt-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        {/* Glowing background decor */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Waktu Sholat Berikutnya</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            Sholat {nextPrayer.name} • {nextPrayer.time}
          </div>
          <div className="text-xs text-amber-200 font-semibold mt-1">
            Hitung mundur: <span className="font-extrabold text-white underline">{formatCountdown(nextPrayer.remainingMinutes)}</span>
          </div>
        </div>

        <div className="relative z-10 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 text-center">
          <Clock className="w-6 h-6 mx-auto mb-1 text-white animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100">Tepat Waktu</span>
        </div>
      </div>

      {/* 5 Daily Prayer Cards Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4">
        {prayerList.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className={`p-3 rounded-2xl text-center border transition-all ${
                p.active
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${p.active ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div className={`text-xs font-bold ${p.active ? 'text-emerald-900' : 'text-slate-600'}`}>
                {p.name}
              </div>
              <div className={`text-sm sm:text-base font-extrabold ${p.active ? 'text-emerald-700' : 'text-slate-800'}`}>
                {p.time}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
