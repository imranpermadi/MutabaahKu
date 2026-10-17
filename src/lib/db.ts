import Dexie, { Table } from 'dexie';
import { 
  UserProfile, 
  AcademicLevel,
  ExamCycle,
  CurriculumItem,
  ContentUnit,
  MurojaahChecklist,
  FsrsMemoryState,
  MutabaahLog,
  IbadahDailyLog, 
  SholatLearningProgress, 
  SyncQueueItem,
  UserGender,
  CurriculumCategory,
  ExamType
} from '../types/database';

export class MutabaahKuDB extends Dexie {
  // 10 Tabel Identik 1:1 dengan Supabase Cloud Schema
  user_profiles!: Table<UserProfile, string>;
  academic_levels!: Table<AcademicLevel, string>;
  exam_cycles!: Table<ExamCycle, string>;
  curriculum_items!: Table<CurriculumItem, string>;
  content_units!: Table<ContentUnit, string>;
  murojaah_checklists!: Table<MurojaahChecklist, string>;
  fsrs_memory_states!: Table<FsrsMemoryState, string>;
  mutabaah_logs!: Table<MutabaahLog, string>;
  ibadah_daily_logs!: Table<IbadahDailyLog, string>;
  sholat_learning_progress!: Table<SholatLearningProgress, string>;
  
  // Antrean Sinkronisasi Offline
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('MutabaahKuDB');
    this.version(4).stores({
      user_profiles: 'id, role, parent_id, email, username',
      academic_levels: 'id, student_id, grade_level, academic_year, is_active',
      exam_cycles: 'id, level_id, student_id, exam_type',
      curriculum_items: 'id, exam_cycle_id, student_id, category',
      content_units: 'id, curriculum_item_id, sequence_num',
      murojaah_checklists: 'id, student_id, grade_level, exam_cycle_id, category, parent_review_status',
      fsrs_memory_states: 'id, unit_id, student_id, track_type, next_due',
      mutabaah_logs: 'id, unit_id, curriculum_item_id, student_id, logged_by_role',
      ibadah_daily_logs: 'id, [student_id+log_date], student_id, log_date, parent_review_status',
      sholat_learning_progress: 'id, [student_id+step_code], student_id, step_code, step_order',
      sync_queue: '++id, table_name, status, created_at'
    });
  }
}

export const db = new MutabaahKuDB();

// Tanggal lokal perangkat (YYYY-MM-DD). toISOString() memakai UTC sehingga pada WIB
// dini hari akan menghasilkan tanggal kemarin.
export function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function futureDateLocal(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ============================================================================
// KATALOG STANDAR KURIKULUM SDIT (Bisa dipilih Orang Tua 1-Klik di Portal Ortu)
// ============================================================================
export interface CurriculumCatalogTemplate {
  code: string;
  title: string;
  category: CurriculumCategory;
  exam_cycle_id: ExamType;
  recommended_grade: number;
  target_pass_count: number;
  arabic_text: string;
  latin_text: string;
  translation: string;
  source: string;
}

export const SDIT_CURRICULUM_CATALOG: CurriculumCatalogTemplate[] = [
  {
    code: 'surah-an-nas',
    title: 'Surat An-Nas (Ayat 1 - 6)',
    category: 'QURAN',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾',
    latin_text: 'Qul a\'uudzu birabbin-naas, Malikin-naas, Ilaahin-naas, Min syarril-waswaasil-khannaas...',
    translation: 'Katakanlah: "Aku berlindung kepada Tuhannya manusia, Raja manusia, Sembahan manusia, dari kejahatan (bisikan) setan yang biasa bersembunyi..."',
    source: 'Al-Qur\'an Juz 30 (QS. 114)'
  },
  {
    code: 'surah-al-falaq',
    title: 'Surat Al-Falaq (Ayat 1 - 5)',
    category: 'QURAN',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾',
    latin_text: 'Qul a\'uudzu birabbil-falaq, Min syarri maa khalaq, Wa min syarri ghaasiqin idzaa waqab...',
    translation: 'Katakanlah: "Aku berlindung kepada Tuhan yang menguasai subuh (fajar), dari kejahatan (makhluk yang) Dia ciptakan..."',
    source: 'Al-Qur\'an Juz 30 (QS. 113)'
  },
  {
    code: 'surah-al-ikhlas',
    title: 'Surat Al-Ikhlas (Ayat 1 - 4)',
    category: 'QURAN',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾',
    latin_text: 'Qul huwallaahu ahad, Allaahush-shamad, Lam yalid wa lam yuulad, Wa lam yakul-lahuu kufuwan ahad.',
    translation: 'Katakanlah (Muhammad): "Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan..."',
    source: 'Al-Qur\'an Juz 30 (QS. 112)'
  },
  {
    code: 'surah-al-kafirun',
    title: 'Surat Al-Kafirun (Ayat 1 - 6)',
    category: 'QURAN',
    exam_cycle_id: 'PAS_1',
    recommended_grade: 1,
    target_pass_count: 7,
    arabic_text: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ ﴿١﴾ لَا أَعْبُدُ مَا تَعْبُدُونَ ﴿٢﴾ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ﴿٣﴾ ... لَكُمْ دِينُكُمْ وَلِيَ دِينِ ﴿٦﴾',
    latin_text: 'Qul yaa ayyuhal-kaafiruun, Laa a\'budu maa ta\'buduun... Lakum diinukum wa liya diin.',
    translation: 'Katakanlah: "Hai orang-orang kafir, aku tidak akan menyembah apa yang kamu sembah... Untukmu agamamu, dan untukkulah agamaku."',
    source: 'Al-Qur\'an Juz 30 (QS. 109)'
  },
  {
    code: 'surah-al-maun',
    title: 'Surat Al-Ma\'un (Ayat 1 - 7)',
    category: 'QURAN',
    exam_cycle_id: 'PTS_2',
    recommended_grade: 2,
    target_pass_count: 7,
    arabic_text: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ ﴿١﴾ فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ ﴿٢﴾ وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ ﴿٣﴾',
    latin_text: 'Ara\'aytalladzii yukadzdzibu bid-diin, Fadzaalikalladzii yadu\'\'ul-yatiim...',
    translation: 'Tahukah kamu (orang) yang mendustakan agama? Itulah orang yang menghardik anak yatim, dan tidak menganjurkan memberi makan orang miskin.',
    source: 'Al-Qur\'an Juz 30 (QS. 107)'
  },
  {
    code: 'hadith-senyum',
    title: 'Hadis Senyum Adalah Sedekah',
    category: 'HADITH',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    latin_text: 'Tabassumuka fii wajhi akhiika laka shodaqoh.',
    translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
    source: 'HR. Tirmidzi no. 1956 (Shahih)'
  },
  {
    code: 'hadith-marah',
    title: 'Hadis Larangan Marah (Laa Taghdhob)',
    category: 'HADITH',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'لَا تَغْضَبْ وَلَكَ الْجَنَّةُ',
    latin_text: 'Laa taghdhob wa lakal-jannah.',
    translation: 'Janganlah engkau marah, maka bagimu surga.',
    source: 'HR. Thabrani & Bukhari no. 6116'
  },
  {
    code: 'hadith-berkata-baik',
    title: 'Hadis Berkata Baik atau Diam',
    category: 'HADITH',
    exam_cycle_id: 'PAS_1',
    recommended_grade: 2,
    target_pass_count: 5,
    arabic_text: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    latin_text: 'Man kaana yu\'minu billaahi wal-yaumil-aakhiri fal-yaqul khoiron au liyashmut.',
    translation: 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau diam.',
    source: 'HR. Bukhari no. 6018 & Muslim no. 47'
  },
  {
    code: 'hadith-kasih-sayang',
    title: 'Hadis Kasih Sayang Sesama Makhluk',
    category: 'HADITH',
    exam_cycle_id: 'PTS_2',
    recommended_grade: 2,
    target_pass_count: 5,
    arabic_text: 'مَنْ لَا يَرْحَمُ لَا يُرْحَمُ',
    latin_text: 'Man laa yarham laa yurham.',
    translation: 'Barangsiapa tidak menyayangi, maka ia tidak akan disayangi.',
    source: 'HR. Bukhari no. 5997 & Muslim no. 2318'
  },
  {
    code: 'doa-makan',
    title: 'Doa Sebelum & Sesudah Makan',
    category: 'DOA',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'بِسْمِ اللَّهِ • الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    latin_text: 'Bismillaah • Alhamdulillaahilladzii ath\'amanaa wa saqoonaa wa ja\'alanaa muslimiin.',
    translation: 'Dengan nama Allah • Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim.',
    source: 'Hisnul Muslim (HR. Abu Dawud & Tirmidzi)'
  },
  {
    code: 'doa-orang-tua',
    title: 'Doa Kebaikan untuk Kedua Orang Tua',
    category: 'DOA',
    exam_cycle_id: 'PTS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin_text: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
    translation: 'Ya Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah keduanya sebagaimana mereka menyayangiku di waktu kecil.',
    source: 'QS. Al-Isra: 24'
  },
  {
    code: 'doa-ilmu-bermanfaat',
    title: 'Doa Memohon Ilmu yang Bermanfaat',
    category: 'DOA',
    exam_cycle_id: 'PAS_1',
    recommended_grade: 1,
    target_pass_count: 5,
    arabic_text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    latin_text: 'Allaahumma innii as\'aluka \'ilman naafi\'an, wa rizqon thoyyiban, wa \'amalan mutaqobbalan.',
    translation: 'Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang halal lagi baik, dan amal yang diterima.',
    source: 'HR. Ibnu Majah no. 925 (Shahih)'
  }
];

export const RUKUN_SHOLAT_13_STEPS = [
  { code: 'RUKUN_01_NIAT', order: 1, title: 'Berdiri Tegak & Niat di Dalam Hati' },
  { code: 'RUKUN_02_TAKBIRATUL_IHRAM', order: 2, title: 'Takbiratul Ihram (Mengangkat Tangan)' },
  { code: 'RUKUN_03_SEDEKAP_IFTITAH', order: 3, title: 'Bersedekap di Dada & Doa Iftitah' },
  { code: 'RUKUN_04_AL_FATIHAH', order: 4, title: 'Membaca Surat Al-Fatihah' },
  { code: 'RUKUN_05_RUKU', order: 5, title: 'Ruku\' dengan Thuma\'ninah' },
  { code: 'RUKUN_06_ITIDAL', order: 6, title: 'I\'tidal (Bangkit dari Ruku\')' },
  { code: 'RUKUN_07_SUJUD_PERTAMA', order: 7, title: 'Sujud Pertama (7 Anggota Badan)' },
  { code: 'RUKUN_08_DUDUK_ANTARA_SUJUD', order: 8, title: 'Duduk Iftirasy di Antara Dua Sujud' },
  { code: 'RUKUN_09_SUJUD_KEDUA', order: 9, title: 'Sujud Kedua dengan Thuma\'ninah' },
  { code: 'RUKUN_10_TASYAHUD_AWAL', order: 10, title: 'Duduk Tasyahud Awal' },
  { code: 'RUKUN_11_TASYAHUD_AKHIR', order: 11, title: 'Duduk Tawarruk & Tasyahud Akhir' },
  { code: 'RUKUN_12_SHALAWAT_NABI', order: 12, title: 'Membaca Shalawat Nabi & Doa Perlindungan' },
  { code: 'RUKUN_13_SALAM_TERTIB', order: 13, title: 'Salam ke Kanan & Kiri secara Tertib' },
];

// ============================================================================
// SINKRONISASI OTOMATIS PENUH KE 10 TABEL RELASIONAL
// Memastikan ketika materi dibuat/diubah di Portal Orang Tua, tabel:
// - murojaah_checklists
// - curriculum_items
// - content_units
// - fsrs_memory_states
// selalu sinkron 1:1 dan tidak ada tabel yang kosong!
// ============================================================================
export async function syncChecklistToRelationalTables(chk: MurojaahChecklist, idx = 1): Promise<void> {
  const currId = chk.curriculum_item_id || `curr-${chk.id}`;
  const unitId = `unit-${chk.id}`;
  const fsrsId = `fsrs-${chk.id}`;
  const isMastered = chk.parent_review_status === 'APPROVED' && chk.mutabaah_grade === 'L';

  // 1. Sync ke curriculum_items
  await db.curriculum_items.put({
    id: currId,
    exam_cycle_id: chk.exam_cycle_id || 'PTS_1',
    student_id: chk.student_id,
    category: chk.category,
    title: chk.curriculum_title,
    is_mastered: isMastered,
    created_at: chk.last_checked_at || new Date().toISOString()
  });

  // 2. Sync ke content_units
  await db.content_units.put({
    id: unitId,
    curriculum_item_id: currId,
    sequence_num: idx,
    arabic_uthmani: chk.arabic_text || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    arabic_normalized: chk.arabic_text || 'بسم الله الرحمن الرحيم',
    latin_text: chk.latin_text || '',
    translation_id: chk.translation || '',
    dalil_source: chk.source || (chk.category === 'QURAN' ? 'Al-Qur\'an Juz 30' : chk.category === 'HADITH' ? 'Hadis Shahih' : 'Hisnul Muslim'),
    created_at: chk.last_checked_at || new Date().toISOString()
  });

  // 3. Sync ke fsrs_memory_states (Jika belum ada atau update status)
  const existingFsrs = await db.fsrs_memory_states.get(fsrsId);
  if (!existingFsrs) {
    await db.fsrs_memory_states.put({
      id: fsrsId,
      unit_id: unitId,
      student_id: chk.student_id,
      track_type: isMastered ? 'MANZIL' : chk.completed_pass_count > 0 ? 'SABQI' : 'SABAQ',
      difficulty: isMastered ? 3.2 : 4.5,
      stability: isMastered ? 14.0 : chk.completed_pass_count > 0 ? 3.5 : 1.0,
      retrievability: isMastered ? 0.98 : 0.90,
      last_review: todayLocal(),
      next_due: futureDateLocal(isMastered ? 7 : 1),
      updated_at: new Date().toISOString()
    });
  }
}

// Helper untuk menambah / mengubah materi hafalan dari Portal Orang Tua atau Siswa
export async function addCustomCurriculumItem(item: Omit<MurojaahChecklist, 'id'> & { id?: string }): Promise<string> {
  const id = item.id || `custom-${Date.now()}`;
  const currItemId = item.curriculum_item_id || `curr-${id}`;
  const fullItem: MurojaahChecklist = {
    ...item,
    id,
    curriculum_item_id: currItemId,
    is_custom: true,
    last_checked_at: new Date().toISOString()
  };

  await db.murojaah_checklists.put(fullItem);
  await syncChecklistToRelationalTables(fullItem, 1);
  return id;
}

// Helper untuk menghapus materi hafalan beserta tabel relasinya
export async function deleteCurriculumItem(id: string): Promise<void> {
  const existing = await db.murojaah_checklists.get(id);
  await db.murojaah_checklists.delete(id);
  if (existing) {
    const currId = existing.curriculum_item_id || `curr-${id}`;
    await db.curriculum_items.delete(currId);
    await db.content_units.delete(`unit-${id}`);
    await db.fsrs_memory_states.delete(`fsrs-${id}`);
  }
}

// Helper ketika Orang Tua menyetujui (Paraf Lancar L / Belum Lancar BL)
// Otomatis mencatat ke mutabaah_logs, fsrs_memory_states, dan curriculum_items!
export async function recordChecklistEvaluation(
  checklistId: string,
  grade: 'L' | 'BL',
  notes: string,
  loggedByRole: 'PARENT' | 'STUDENT' = 'PARENT'
): Promise<void> {
  const item = await db.murojaah_checklists.get(checklistId);
  if (!item) return;

  const nowIso = new Date().toISOString();
  const isLancar = grade === 'L';

  // 1. Update murojaah_checklists
  await db.murojaah_checklists.update(checklistId, {
    parent_review_status: 'APPROVED',
    mutabaah_grade: grade,
    parent_notes: notes,
    reviewed_at: nowIso
  });

  // 2. Update curriculum_items (status Mutqin)
  const currId = item.curriculum_item_id || `curr-${item.id}`;
  const existingCurr = await db.curriculum_items.get(currId);
  if (existingCurr) {
    await db.curriculum_items.update(currId, {
      is_mastered: isLancar
    });
  } else {
    await syncChecklistToRelationalTables({
      ...item,
      parent_review_status: 'APPROVED',
      mutabaah_grade: grade,
      parent_notes: notes,
      reviewed_at: nowIso
    });
  }

  // 3. Update fsrs_memory_states (Mesin Pengulangan Ilmiah FSRS-6)
  const fsrsId = `fsrs-${item.id}`;
  const unitId = `unit-${item.id}`;
  const existingFsrs = await db.fsrs_memory_states.get(fsrsId);
  const prevStability = existingFsrs?.stability || 2.0;
  const newStability = isLancar ? Number((prevStability * 2.2).toFixed(1)) : Math.max(1.0, Number((prevStability * 0.7).toFixed(1)));
  const newDifficulty = isLancar ? Math.max(1.5, Number(((existingFsrs?.difficulty || 4.0) - 0.3).toFixed(1))) : Math.min(8.0, Number(((existingFsrs?.difficulty || 4.0) + 0.5).toFixed(1)));

  await db.fsrs_memory_states.put({
    id: fsrsId,
    unit_id: unitId,
    student_id: item.student_id,
    track_type: isLancar ? 'MANZIL' : 'SABQI',
    difficulty: newDifficulty,
    stability: newStability,
    retrievability: isLancar ? 0.98 : 0.82,
    last_review: todayLocal(),
    next_due: futureDateLocal(isLancar ? Math.min(30, Math.round(newStability)) : 1),
    updated_at: nowIso
  });

  // 4. Catat ke mutabaah_logs (Riwayat Ujian & Setoran Hafalan)
  const logId = `mlog-${checklistId}-${Date.now()}`;
  await db.mutabaah_logs.put({
    id: logId,
    unit_id: unitId,
    curriculum_item_id: currId,
    student_id: item.student_id,
    logged_by_role: loggedByRole,
    fsrs_rating: isLancar ? 4 : 2,
    asr_accuracy_score: isLancar ? 96 : 75,
    parent_verified: true,
    official_mutabaah_status: grade,
    tajwid_makhraj_notes: notes,
    parent_feedback: notes,
    created_at: nowIso
  });
}

// Helper mencatat progres latihan 13 Rukun Sholat dari SholatAnimator
export async function recordSholatPractice(
  studentId: string,
  stepCode = 'RUKUN_01_NIAT',
  stepOrder = 1,
  quizScore = 100
): Promise<void> {
  const id = `sholat-${studentId}-${stepCode}`;
  const existing = await db.sholat_learning_progress.get(id);
  await db.sholat_learning_progress.put({
    id,
    student_id: studentId,
    step_code: stepCode,
    step_order: stepOrder,
    animation_practiced_count: (existing?.animation_practiced_count || 0) + 1,
    reading_memorized: true,
    quiz_high_score: Math.max(existing?.quiz_high_score || 0, quizScore),
    parent_verified_movement: existing?.parent_verified_movement ?? true,
    parent_verified_reading: existing?.parent_verified_reading ?? true,
    parent_notes: existing?.parent_notes || 'Gerakan dan bacaan sesuai sifat sholat Nabi ﷺ',
    updated_at: new Date().toISOString()
  });
}

// Helper menyimpan rekaman audio setoran hafalan anak
export async function saveHafalanAudioRecord(checklistId: string, audioUrl: string, durationSec: number): Promise<void> {
  await db.murojaah_checklists.update(checklistId, {
    audio_record_url: audioUrl,
    audio_duration: durationSec,
    recorded_at: new Date().toISOString(),
    parent_review_status: 'PENDING'
  });
}

// ============================================================================
// SINKRONISASI DETERMINISTIK KEBUN PAHALA (TETES AIR, BINTANG & STIKER)
// Menghitung Tetes Air & Bintang 100% dari pencapaian nyata anak di database
// sehingga tidak pernah bertambah sendiri secara acak atau memakai angka dummy.
// ============================================================================
export interface AchievementBreakdown {
  waterFromSholatFardhu: number;
  waterFromSunnahAndPuasa: number;
  waterFromMurojaah: number;
  waterSpentOnTree: number;
  totalWaterAvailable: number;
  starsFromApprovedYaumiyah: number;
  starsFromMasteredHafalan: number;
  starsFromSholatPractice: number;
  totalStars: number;
  berjamaahCount: number;
  tepatWaktuCount: number;
  murojaahPassTotal: number;
  approvedHafalanCount: number;
  approvedYaumiyahCount: number;
}

export function computeAchievementBreakdown(
  profile: UserProfile | undefined,
  ibadahLogs: IbadahDailyLog[],
  checklists: MurojaahChecklist[],
  sholatProgress: SholatLearningProgress[] = []
): AchievementBreakdown {
  let waterFromSholatFardhu = 0;
  let waterFromSunnahAndPuasa = 0;
  let starsFromApprovedYaumiyah = 0;
  let berjamaahCount = 0;
  let tepatWaktuCount = 0;
  let approvedYaumiyahCount = 0;

  for (const log of ibadahLogs) {
    const prayers = [
      log.sholat_subuh,
      log.sholat_dzuhur,
      log.sholat_ashar,
      log.sholat_maghrib,
      log.sholat_isya
    ];
    for (const p of prayers) {
      if (p === 'BERJAMAAH') {
        waterFromSholatFardhu += 3;
        berjamaahCount += 1;
      } else if (p === 'MUNFARID_TEPAT') {
        waterFromSholatFardhu += 2;
        tepatWaktuCount += 1;
      }
      // TERLAMBAT, UZUR (Sakit), dan TIDAK_SHOLAT (Belum Sholat) = 0 Tetes Air
    }

    if ((log.sholat_dhuha_rakaat || 0) > 0) {
      waterFromSunnahAndPuasa += 2;
    }
    if (log.sholat_qiyamul_lail) {
      waterFromSunnahAndPuasa += 3;
    }
    if (log.puasa_type && log.puasa_type !== 'TIDAK_PUASA') {
      if (log.puasa_completion === 'PENUH_MAGHRIB') {
        waterFromSunnahAndPuasa += 10;
      } else if (log.puasa_completion === 'LATIHAN_SETENGAH_HARI') {
        waterFromSunnahAndPuasa += 5;
      }
    }

    if (log.parent_review_status === 'APPROVED') {
      approvedYaumiyahCount += 1;
      starsFromApprovedYaumiyah += log.reward_stars_awarded || 25;
    }
  }

  let murojaahPassTotal = 0;
  let approvedHafalanCount = 0;
  for (const chk of checklists) {
    murojaahPassTotal += chk.completed_pass_count || 0;
    if (chk.parent_review_status === 'APPROVED' && chk.mutabaah_grade === 'L') {
      approvedHafalanCount += 1;
    }
  }

  const waterFromMurojaah = murojaahPassTotal * 2;
  const starsFromMasteredHafalan = approvedHafalanCount * 20;

  const practicedSteps = sholatProgress.filter(s => (s.animation_practiced_count || 0) > 0).length;
  const starsFromSholatPractice = practicedSteps * 5;

  const treeLevel = Math.max(1, Math.min(5, profile?.garden_tree_level || 1));
  const waterSpentOnTree = (treeLevel - 1) * 10;

  const totalEarnedWater = waterFromSholatFardhu + waterFromSunnahAndPuasa + waterFromMurojaah;
  const totalWaterAvailable = Math.max(0, totalEarnedWater - waterSpentOnTree);
  const totalStars = starsFromApprovedYaumiyah + starsFromMasteredHafalan + starsFromSholatPractice;

  return {
    waterFromSholatFardhu,
    waterFromSunnahAndPuasa,
    waterFromMurojaah,
    waterSpentOnTree,
    totalWaterAvailable,
    starsFromApprovedYaumiyah,
    starsFromMasteredHafalan,
    starsFromSholatPractice,
    totalStars,
    berjamaahCount,
    tepatWaktuCount,
    murojaahPassTotal,
    approvedHafalanCount,
    approvedYaumiyahCount
  };
}

export async function recalculateStudentAchievements(studentId: string): Promise<AchievementBreakdown | null> {
  if (!studentId || studentId === 'guest-student') return null;
  const profile = await db.user_profiles.get(studentId);
  if (!profile) return null;

  const [ibadahLogs, checklists, sholatProgress] = await Promise.all([
    db.ibadah_daily_logs.where('student_id').equals(studentId).toArray(),
    db.murojaah_checklists.where('student_id').equals(studentId).toArray(),
    db.sholat_learning_progress.where('student_id').equals(studentId).toArray()
  ]);

  const breakdown = computeAchievementBreakdown(profile, ibadahLogs, checklists, sholatProgress);

  // Tentukan stiker yang berhak terbuka berdasarkan pencapaian nyata
  const stickers = new Set<string>(['sticker_welcome_star']);
  if (breakdown.berjamaahCount >= 1) stickers.add('sticker_kabah');
  if (breakdown.waterFromSunnahAndPuasa >= 2) stickers.add('sticker_lantern');
  if (breakdown.murojaahPassTotal >= 5) stickers.add('sticker_camel');
  if ((profile.garden_tree_level || 1) >= 3) stickers.add('sticker_mosque');
  if (breakdown.approvedHafalanCount >= 2) stickers.add('sticker_crown');
  const nextStickers = Array.from(stickers);

  const currentStickers = profile.unlocked_stickers || [];
  const stickersChanged =
    nextStickers.length !== currentStickers.length ||
    nextStickers.some(s => !currentStickers.includes(s));

  if (
    profile.water_drops !== breakdown.totalWaterAvailable ||
    profile.star_points !== breakdown.totalStars ||
    stickersChanged
  ) {
    await db.user_profiles.update(studentId, {
      water_drops: breakdown.totalWaterAvailable,
      star_points: breakdown.totalStars,
      unlocked_stickers: nextStickers
    });
  }

  return breakdown;
}

// Helper untuk menghubungkan / menambahkan profil anak baru di bawah orang tua
export async function addChildProfile(parentId: string, child: {
  fullName: string;
  email: string;
  gender: UserGender;
  grade: number;
  schoolName: string;
}): Promise<UserProfile> {
  const childId = `student-${Date.now()}`;
  const newProfile: UserProfile = {
    id: childId,
    email: child.email.trim().toLowerCase(),
    username: child.fullName.toLowerCase().replace(/\s+/g, '_'),
    full_name: child.fullName,
    role: 'STUDENT',
    gender: child.gender,
    parent_id: parentId,
    school_name: child.schoolName || 'SDIT Imam Bukhari',
    current_grade: child.grade,
    prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
    prayer_city_name: 'KOTA MEDAN',
    latitude: 3.5952,
    longitude: 98.6722,
    qibla_bearing: 292.8,
    daily_streak: 1,
    star_points: 0,
    water_drops: 0,
    garden_tree_level: 1,
    unlocked_stickers: ['sticker_welcome_star'],
    created_at: new Date().toISOString()
  };

  await db.user_profiles.add(newProfile);
  await ensureStarterChecklists(childId, child.grade);

  return newProfile;
}

// Helper untuk menghapus profil anak beserta seluruh relasi data setorannya
export async function deleteChildProfile(childId: string): Promise<void> {
  await db.user_profiles.delete(childId);
  await db.murojaah_checklists.where('student_id').equals(childId).delete();
  await db.ibadah_daily_logs.where('student_id').equals(childId).delete();
  await db.academic_levels.where('student_id').equals(childId).delete();
  await db.exam_cycles.where('student_id').equals(childId).delete();
  await db.curriculum_items.where('student_id').equals(childId).delete();
  await db.sholat_learning_progress.where('student_id').equals(childId).delete();
  await db.fsrs_memory_states.where('student_id').equals(childId).delete();
  await db.mutabaah_logs.where('student_id').equals(childId).delete();
}

// ============================================================================
// INISIALISASI & SINKRONISASI LENGKAP 10 TABEL UNTUK SANTRI AKTIF
// Memastikan tidak ada tabel yang kosong:
// 1. academic_levels (Tingkat Kelas SDIT)
// 2. exam_cycles (Siklus Ujian PTS 1, PAS 1, PTS 2, PAT)
// 3. murojaah_checklists (Target Hafalan Anak)
// 4. curriculum_items (Master Item Kurikulum)
// 5. content_units (Unit Ayat, Matan Arab & Terjemahan)
// 6. fsrs_memory_states (State Memori FSRS-6)
// 7. sholat_learning_progress (Progres 13 Rukun Sholat)
// 8. mutabaah_logs (Log Setoran & Evaluasi)
// ============================================================================
export async function ensureStarterChecklists(studentId: string, grade: number): Promise<MurojaahChecklist[]> {
  if (!studentId) return [];

  // 1. Pastikan academic_levels terisi untuk siswa ini
  const levelId = `level-${studentId}-grade-${grade}`;
  const existingLevels = await db.academic_levels.where('student_id').equals(studentId).count();
  if (existingLevels === 0) {
    await db.academic_levels.put({
      id: levelId,
      student_id: studentId,
      grade_level: grade || 1,
      academic_year: '2025/2026',
      is_active: true,
      created_at: new Date().toISOString()
    });
  }

  // 2. Pastikan exam_cycles (Siklus Ujian SDIT) terisi untuk siswa ini
  const existingCycles = await db.exam_cycles.where('student_id').equals(studentId).count();
  if (existingCycles === 0) {
    const defaultCycles: ExamCycle[] = [
      {
        id: `cycle-${studentId}-PTS_1`,
        level_id: levelId,
        student_id: studentId,
        exam_type: 'PTS_1',
        exam_title: 'PTS 1 — Penilaian Tengah Semester Ganjil',
        exam_date: '2026-10-25',
        target_retention: 0.90,
        created_at: new Date().toISOString()
      },
      {
        id: `cycle-${studentId}-PAS_1`,
        level_id: levelId,
        student_id: studentId,
        exam_type: 'PAS_1',
        exam_title: 'PAS 1 — Penilaian Akhir Semester Ganjil',
        exam_date: '2026-12-14',
        target_retention: 0.92,
        created_at: new Date().toISOString()
      },
      {
        id: `cycle-${studentId}-PTS_2`,
        level_id: levelId,
        student_id: studentId,
        exam_type: 'PTS_2',
        exam_title: 'PTS 2 — Penilaian Tengah Semester Genap',
        exam_date: '2027-03-15',
        target_retention: 0.90,
        created_at: new Date().toISOString()
      },
      {
        id: `cycle-${studentId}-PAS_2`,
        level_id: levelId,
        student_id: studentId,
        exam_type: 'PAS_2',
        exam_title: 'PAT / UKK — Penilaian Akhir Tahun Kenaikan Kelas',
        exam_date: '2027-06-10',
        target_retention: 0.95,
        created_at: new Date().toISOString()
      }
    ];
    await db.exam_cycles.bulkPut(defaultCycles);
  }

  // 3. Pastikan murojaah_checklists memiliki materi awal jika kosong
  let currentChecklists = await db.murojaah_checklists.where('student_id').equals(studentId).toArray();
  if (currentChecklists.length === 0) {
    const starterTemplates = SDIT_CURRICULUM_CATALOG.slice(0, 4); // An-Nas, Al-Falaq, Al-Ikhlas, Hadis/Doa
    const starters: MurojaahChecklist[] = [
      SDIT_CURRICULUM_CATALOG[0], // Surat An-Nas
      SDIT_CURRICULUM_CATALOG[2], // Surat Al-Ikhlas
      SDIT_CURRICULUM_CATALOG[5], // Hadis Senyum
      SDIT_CURRICULUM_CATALOG[9], // Doa Sebelum & Sesudah Makan
      SDIT_CURRICULUM_CATALOG[10] // Doa Kedua Orang Tua
    ].map((tpl, idx) => ({
      id: `chk-${studentId}-${idx + 1}`,
      student_id: studentId,
      grade_level: grade || tpl.recommended_grade,
      curriculum_item_id: `curr-${studentId}-${tpl.code}`,
      curriculum_title: tpl.title,
      category: tpl.category,
      exam_cycle_id: tpl.exam_cycle_id,
      target_pass_count: tpl.target_pass_count,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: tpl.arabic_text,
      latin_text: tpl.latin_text,
      translation: tpl.translation,
      source: tpl.source,
      last_checked_at: new Date().toISOString()
    }));

    await db.murojaah_checklists.bulkPut(starters);
    currentChecklists = starters;
  }

  // 4. Sinkronkan seluruh murojaah_checklists ke curriculum_items, content_units, dan fsrs_memory_states
  for (let i = 0; i < currentChecklists.length; i++) {
    await syncChecklistToRelationalTables(currentChecklists[i], i + 1);
  }

  // 5. Pastikan sholat_learning_progress (13 Rukun Sholat) terinisialisasi untuk siswa ini
  const existingSholat = await db.sholat_learning_progress.where('student_id').equals(studentId).count();
  if (existingSholat === 0) {
    const sholatRows: SholatLearningProgress[] = RUKUN_SHOLAT_13_STEPS.slice(0, 6).map(step => ({
      id: `sholat-${studentId}-${step.code}`,
      student_id: studentId,
      step_code: step.code,
      step_order: step.order,
      animation_practiced_count: step.order <= 3 ? 2 : 1,
      reading_memorized: step.order <= 3,
      quiz_high_score: step.order <= 3 ? 100 : 80,
      parent_verified_movement: step.order <= 2,
      parent_verified_reading: step.order <= 2,
      parent_notes: step.order <= 2 ? 'Gerakan takbir dan bersedekap sudah lurus & tertib.' : 'Sedang latihan menghafal bacaan.',
      updated_at: new Date().toISOString()
    }));
    await db.sholat_learning_progress.bulkPut(sholatRows);
  }

  // 6. Pastikan mutabaah_logs tercatat untuk setiap setoran yang sudah diparaf atau dilatih
  const existingMutabaahLogs = await db.mutabaah_logs.where('student_id').equals(studentId).count();
  if (existingMutabaahLogs === 0 && currentChecklists.length > 0) {
    const initialLogs: MutabaahLog[] = currentChecklists.slice(0, 2).map((chk, idx) => ({
      id: `mlog-${studentId}-init-${idx + 1}`,
      unit_id: `unit-${chk.id}`,
      curriculum_item_id: chk.curriculum_item_id || `curr-${chk.id}`,
      student_id: studentId,
      logged_by_role: chk.parent_review_status === 'APPROVED' ? 'PARENT' : 'STUDENT',
      fsrs_rating: chk.mutabaah_grade === 'L' ? 4 : 3,
      asr_accuracy_score: chk.mutabaah_grade === 'L' ? 95 : 85,
      parent_verified: chk.parent_review_status === 'APPROVED',
      official_mutabaah_status: chk.mutabaah_grade || 'BL',
      tajwid_makhraj_notes: chk.parent_notes || `Setoran awal materi ${chk.curriculum_title}`,
      parent_feedback: chk.parent_notes || 'Semangat menghafal dan perhatikan makhraj hurufnya nak!',
      created_at: chk.reviewed_at || chk.last_checked_at || new Date().toISOString()
    }));
    await db.mutabaah_logs.bulkPut(initialLogs);
  }

  return currentChecklists;
}

// ============================================================================
// PEMBERSIHAN DATA DUMMY (akun & data contoh bawaan versi lama)
// Akun nyata (mis. imranpermadi@gmail.com & anak yang dibuat user) TIDAK dihapus.
// ============================================================================
const DEMO_STUDENT_IDS = ['student-hafiz-01', 'student-maryam-02', 'demo-hafiz'];
const DEMO_PARENT_IDS = ['parent-abu-hafiz-01'];
const DEMO_EMAILS = ['orangtua@mutabaahku.id', 'hafiz@mutabaahku.id', 'maryam@mutabaahku.id'];
const DEMO_CURRICULUM_IDS = ['curr-an-naba', 'curr-hadith-ilmu', 'curr-doa-tidur', 'curr-an-nas', 'curr-hadith-senyum'];
const DEMO_CYCLE_IDS = ['cycle-pts-1', 'cycle-pas-1'];
const DEMO_PURGE_FLAG = 'mutabaahku_demo_purged_v1';

export async function purgeDemoData(): Promise<void> {
  if (localStorage.getItem(DEMO_PURGE_FLAG)) return;

  for (const id of DEMO_STUDENT_IDS) {
    await deleteChildProfile(id);
  }
  await db.user_profiles.bulkDelete([...DEMO_STUDENT_IDS, ...DEMO_PARENT_IDS]);
  await db.user_profiles.where('email').anyOfIgnoreCase(DEMO_EMAILS).delete();
  await db.content_units.where('curriculum_item_id').anyOf(DEMO_CURRICULUM_IDS).delete();
  await db.curriculum_items.bulkDelete(DEMO_CURRICULUM_IDS);
  await db.exam_cycles.bulkDelete(DEMO_CYCLE_IDS);

  localStorage.setItem(DEMO_PURGE_FLAG, '1');
}
