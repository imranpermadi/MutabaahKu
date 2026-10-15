export interface SchoolHadith {
  id: string;
  title: string;
  grade_target: number; // Kelas 1 - 6
  arabic_matan: string;
  latin_text: string;
  translation: string;
  source: string;
  grade_badge: string;
  keywords: string[];
}

export const SCHOOL_HADITHS: SchoolHadith[] = [
  {
    id: 'hadith-ilmu',
    title: 'Hadis Menuntut Ilmu Adalah Kewajiban',
    grade_target: 1,
    grade_badge: 'Kelas 1 - 3',
    arabic_matan: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    latin_text: 'Tholabul \'ilmi fariidhotun \'alaa kulli muslim.',
    translation: 'Menuntut ilmu itu wajib bagi setiap muslim.',
    source: 'HR. Ibnu Majah no. 224 (Shahih)',
    keywords: ['ilmu', 'belajar', 'sekolah', 'kewajiban']
  },
  {
    id: 'hadith-marah',
    title: 'Hadis Keutamaan Menahan Marah',
    grade_target: 1,
    grade_badge: 'Kelas 1 - 2',
    arabic_matan: 'لَا تَغْضَبْ وَلَكَ الْجَنَّةُ',
    latin_text: 'Laa taghdhab wa lakal jannah.',
    translation: 'Janganlah kamu marah, niscaya bagimu surga.',
    source: 'HR. Ath-Thabrani dalam Al-Mu\'jam Al-Awsath (Shahih)',
    keywords: ['sabar', 'marah', 'surga', 'akhlak']
  },
  {
    id: 'hadith-senyum',
    title: 'Hadis Senyum Adalah Sedekah',
    grade_target: 2,
    grade_badge: 'Kelas 2 - 3',
    arabic_matan: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    latin_text: 'Tabassumuka fii wajhi akhiika laka shodaqoh.',
    translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
    source: 'HR. Tirmidzi no. 1956 (Hasan)',
    keywords: ['senyum', 'sedekah', 'saudara', 'ceria']
  },
  {
    id: 'hadith-quran',
    title: 'Hadis Sebaik-baik Manusia Belajar Al-Qur\'an',
    grade_target: 3,
    grade_badge: 'Kelas 3 - 4',
    arabic_matan: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    latin_text: 'Khoirukum man ta\'allamal Qur\'aana wa \'allamah.',
    translation: 'Sebaik-baik kalian adalah orang yang belajar Al-Qur\'an dan mengajarkannya.',
    source: 'HR. Bukhari no. 5027',
    keywords: ['quran', 'mengaji', 'tahfidz', 'pahala']
  },
  {
    id: 'hadith-lisan',
    title: 'Hadis Berkata Baik atau Diam',
    grade_target: 3,
    grade_badge: 'Kelas 3 - 5',
    arabic_matan: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    latin_text: 'Man kaana yu\'minu billaahi wal yawmil aakhiri falyaqul khoiron aw liyashmut.',
    translation: 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau diam.',
    source: 'HR. Bukhari no. 6018 & Muslim no. 47',
    keywords: ['lisan', 'bicara', 'adab', 'iman']
  },
  {
    id: 'hadith-kasihsayang',
    title: 'Hadis Menyayangi Sesama',
    grade_target: 2,
    grade_badge: 'Kelas 2 - 4',
    arabic_matan: 'مَنْ لَا يَرْحَمْ لَا يُرْحَمْ',
    latin_text: 'Man laa yarham laa yurham.',
    translation: 'Barangsiapa tidak menyayangi, maka tidak akan disayangi.',
    source: 'HR. Bukhari no. 5997 & Muslim no. 2318',
    keywords: ['kasih sayang', 'teman', 'keluarga']
  },
  {
    id: 'hadith-muslim',
    title: 'Hadis Muslim Sejati Menjaga Lisan & Tangan',
    grade_target: 4,
    grade_badge: 'Kelas 4 - 6',
    arabic_matan: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    latin_text: 'Al-muslimu man salimal muslimuuna min lisaanihii wa yadih.',
    translation: 'Seorang muslim sejati adalah yang orang muslim lainnya selamat dari gangguan lisan dan tangannya.',
    source: 'HR. Bukhari no. 10 & Muslim no. 40',
    keywords: ['muslim', 'akhlak', 'santun', 'rukun']
  }
];
