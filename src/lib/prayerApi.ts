export interface PrayerTimes {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface CityItem {
  id: string;
  lokasi: string;
}

// Fallback jika offline (Kota Medan & Jakarta)
export const DEFAULT_PRAYER_TIMES: PrayerTimes = {
  tanggal: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  imsak: '05:04',
  subuh: '05:14',
  terbit: '06:27',
  dhuha: '06:51',
  dzuhur: '12:35',
  ashar: '15:46',
  maghrib: '18:38',
  isya: '19:47'
};

const CACHE_KEY_PREFIX = 'mutabaahku_prayer_';

export async function fetchPrayerTimes(cityId: string = '58a2fc6ed39fd083f55d4182bf88826d'): Promise<PrayerTimes> {
  const todayStr = new Date().toISOString().split('T')[0];
  const cacheKey = `${CACHE_KEY_PREFIX}${cityId}_${todayStr}`;
  
  // Cek cache lokal peramban
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
  }

  try {
    const res = await fetch(`https://api.myquran.com/v3/sholat/jadwal/${cityId}/today`);
    if (!res.ok) throw new Error('Network response error');
    const data = await res.json();
    if (data.status && data.data && data.data.jadwal) {
      const schedule: PrayerTimes = data.data.jadwal;
      localStorage.setItem(cacheKey, JSON.stringify(schedule));
      return schedule;
    }
  } catch (err) {
    console.warn('Gagal memuat jadwal sholat online, menggunakan data cache / default fallback:', err);
  }

  return DEFAULT_PRAYER_TIMES;
}

export async function searchCities(keyword: string): Promise<CityItem[]> {
  if (!keyword || keyword.length < 2) return [];
  try {
    const res = await fetch(`https://api.myquran.com/v3/sholat/kabkota/cari/${encodeURIComponent(keyword)}`);
    if (!res.ok) throw new Error('City search failed');
    const data = await res.json();
    if (data.status && Array.isArray(data.data)) {
      return data.data;
    }
  } catch (err) {
    console.warn('Gagal mencari kota online:', err);
  }
  return [];
}

/**
 * Menghitung waktu sholat berikutnya dan sisa menit / jam
 */
export function getNextPrayer(times: PrayerTimes): { name: string; time: string; remainingMinutes: number } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTime = (tStr: string) => {
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  };

  const prayers = [
    { name: 'Subuh', time: times.subuh, mins: parseTime(times.subuh) },
    { name: 'Dzuhur', time: times.dzuhur, mins: parseTime(times.dzuhur) },
    { name: 'Ashar', time: times.ashar, mins: parseTime(times.ashar) },
    { name: 'Maghrib', time: times.maghrib, mins: parseTime(times.maghrib) },
    { name: 'Isya', time: times.isya, mins: parseTime(times.isya) },
  ];

  for (const p of prayers) {
    if (p.mins > currentMinutes) {
      return {
        name: p.name,
        time: p.time,
        remainingMinutes: p.mins - currentMinutes
      };
    }
  }

  // Jika sudah melewati Isya, sholat berikutnya adalah Subuh besok
  const tomorrowSubuhMinutes = 24 * 60 + prayers[0].mins;
  return {
    name: 'Subuh',
    time: times.subuh,
    remainingMinutes: tomorrowSubuhMinutes - currentMinutes
  };
}
