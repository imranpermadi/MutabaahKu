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
  SyncQueueItem 
} from '../types/database';
import { SHOLAT_STEPS } from '../data/sholatSteps';

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
    this.version(3).stores({
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

// Helper untuk menambah materi hafalan baru (Hadis, Doa, atau Surat Kustom)
export async function addCustomCurriculumItem(item: Omit<MurojaahChecklist, 'id'>): Promise<string> {
  const id = `custom-${Date.now()}`;
  await db.murojaah_checklists.add({
    ...item,
    id,
    is_custom: true,
    last_checked_at: new Date().toISOString()
  });
  return id;
}

// Helper untuk menghapus materi hafalan
export async function deleteCurriculumItem(id: string): Promise<void> {
  await db.murojaah_checklists.delete(id);
}

// Seed initial curriculum data spanning Kelas 1 - 6 SDIT
export async function seedInitialData() {
  const profileCount = await db.user_profiles.count();
  if (profileCount > 0) return;

  const studentId = 'student-hafiz-01';
  const parentId = 'parent-abu-hafiz-01';
  const today = new Date().toISOString().split('T')[0];

  // 1. Seed Parent Profile
  await db.user_profiles.add({
    id: parentId,
    email: 'orangtua@mutabaahku.id',
    username: 'abu_hafiz',
    full_name: 'Abu Hafiz & Ummu Hafiz',
    role: 'PARENT',
    gender: 'PUTRA',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=abuhafiz',
    prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
    prayer_city_name: 'KOTA MEDAN',
    latitude: 3.5952,
    longitude: 98.6722,
    qibla_bearing: 292.8,
    daily_streak: 14,
    star_points: 0,
    water_drops: 0,
    garden_tree_level: 1,
    unlocked_stickers: []
  });

  // 2. Seed Student Profile (Putra, Kelas 3)
  await db.user_profiles.add({
    id: studentId,
    email: 'hafiz@mutabaahku.id',
    username: 'hafiz_sholih',
    full_name: 'Hafiz Al-Fatih',
    role: 'STUDENT',
    gender: 'PUTRA',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=hafiz',
    parent_id: parentId,
    school_name: 'SDIT Imam Bukhari',
    current_grade: 3,
    prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
    prayer_city_name: 'KOTA MEDAN',
    latitude: 3.5952,
    longitude: 98.6722,
    qibla_bearing: 292.8,
    daily_streak: 5,
    star_points: 135,
    water_drops: 42,
    garden_tree_level: 2,
    unlocked_stickers: ['sticker_welcome_star', 'sticker_kabah', 'sticker_lantern']
  });

  // 3. Seed Sholat Learning Progress for 13 Steps
  for (const step of SHOLAT_STEPS) {
    await db.sholat_learning_progress.add({
      id: `prog-${studentId}-${step.step_code}`,
      student_id: studentId,
      step_code: step.step_code,
      step_order: step.step_order,
      animation_practiced_count: step.step_order <= 3 ? 3 : 0,
      reading_memorized: step.step_order <= 2,
      quiz_high_score: step.step_order <= 2 ? 100 : 0,
      parent_verified_movement: step.step_order === 1,
      parent_verified_reading: step.step_order === 1,
      parent_notes: step.step_order === 1 ? 'MasyaAllah gerakan tegak dan fokus sangat baik.' : undefined,
      updated_at: new Date().toISOString()
    });
  }

  // 4. Seed Today's Ibadah Daily Log
  await db.ibadah_daily_logs.add({
    id: `ibadah-${studentId}-${today}`,
    student_id: studentId,
    log_date: today,
    sholat_subuh: 'BERJAMAAH',
    sholat_dzuhur: 'BERJAMAAH',
    sholat_ashar: 'MUNFARID_TEPAT',
    sholat_maghrib: 'BERJAMAAH',
    sholat_isya: 'BERJAMAAH',
    dzikir_bada_sholat_count: 5,
    sholat_dhuha_rakaat: 4,
    sholat_rawatib_count: 6,
    sholat_qiyamul_lail: false,
    puasa_type: 'SENIN_KAMIS',
    puasa_completion: 'PENUH_MAGHRIB',
    child_notes: 'Alhamdulillah hari ini puasa sunnah lancar dan sholat di masjid!',
    parent_review_status: 'PENDING',
    reward_stars_awarded: 25,
    created_at: new Date().toISOString()
  });

  // 5. Seed Comprehensive SDIT Curriculum for Kelas 1 sampai Kelas 6
  const sditCurriculum: Omit<MurojaahChecklist, 'id'>[] = [
    // --- KELAS 1 SDIT ---
    {
      student_id: studentId,
      grade_level: 1,
      curriculum_item_id: 'quran-an-nas',
      curriculum_title: 'Surat An-Nas (Ayat 1 - 6)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 5,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      parent_notes: 'Sudah mutqin dan hafal.',
      arabic_text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ • مَلِكِ النَّاسِ • إِلَهِ النَّاسِ...',
      translation: 'Katakanlah: "Aku berlindung kepada Tuhannya manusia..."',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: 1,
      curriculum_item_id: 'hadith-marah',
      curriculum_title: 'Hadis Menahan Marah',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 5,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      parent_notes: 'Alhamdulillah hafal matan dan artinya.',
      arabic_text: 'لَا تَغْضَبْ وَلَكَ الْجَنَّةُ',
      latin_text: 'Laa taghdhab wa lakal jannah.',
      translation: 'Janganlah kamu marah, niscaya bagimu surga.',
      source: 'HR. Ath-Thabrani'
    },
    {
      student_id: studentId,
      grade_level: 1,
      curriculum_item_id: 'doa-makan',
      curriculum_title: 'Doa Sebelum & Sesudah Makan',
      category: 'DOA',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 5,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      arabic_text: 'بِسْمِ اللَّهِ • الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      translation: 'Dengan nama Allah. Segala puji bagi Allah yang telah memberi makan dan minum kepada kami...',
      source: 'Hisnul Muslim'
    },

    // --- KELAS 2 SDIT ---
    {
      student_id: studentId,
      grade_level: 2,
      curriculum_item_id: 'quran-al-kautsar',
      curriculum_title: 'Surat Al-Kautsar (Ayat 1 - 3)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 5,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      arabic_text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ • فَصَلِّ لِرَبِّكَ وَانْحَرْ • إِنَّ شَانِئَكَ هُوَ الأَبْتَرُ',
      translation: 'Sungguh, Kami telah memberimu telaga Kautsar...',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: 2,
      curriculum_item_id: 'hadith-senyum',
      curriculum_title: 'Hadis Senyum Adalah Sedekah',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 5,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      arabic_text: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
      latin_text: 'Tabassumuka fii wajhi akhiika laka shodaqoh.',
      translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
      source: 'HR. Tirmidzi no. 1956'
    },

    // --- KELAS 3 SDIT (Kelas Santri Saat Ini) ---
    {
      student_id: studentId,
      grade_level: 3,
      curriculum_item_id: 'quran-an-naba',
      curriculum_title: 'Surat An-Naba\' (Ayat 1 - 40)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 3,
      child_self_claim: true,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'L',
      parent_notes: 'Tingkatkan makhraj pada huruf Ha dan Ain.',
      arabic_text: 'عَمَّ يَتَسَاءَلُونَ • عَنِ النَّبَإِ الْعَظِيمِ • الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ...',
      translation: 'Tentang apakah mereka saling bertanya-tanya? Tentang berita yang besar...',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: 3,
      curriculum_item_id: 'hadith-ilmu',
      curriculum_title: 'Hadis Menuntut Ilmu Adalah Kewajiban',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 4,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      parent_notes: 'Lafaz dan artinya sudah hafal.',
      arabic_text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
      latin_text: 'Tholabul \'ilmi fariidhotun \'alaa kulli muslim.',
      translation: 'Menuntut ilmu itu wajib bagi setiap muslim.',
      source: 'HR. Ibnu Majah no. 224'
    },
    {
      student_id: studentId,
      grade_level: 3,
      curriculum_item_id: 'hadith-quran',
      curriculum_title: 'Hadis Sebaik-baik Manusia Belajar Al-Qur\'an',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 3,
      child_self_claim: true,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'L',
      arabic_text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
      latin_text: 'Khoirukum man ta\'allamal Qur\'aana wa \'allamah.',
      translation: 'Sebaik-baik kalian adalah orang yang belajar Al-Qur\'an dan mengajarkannya.',
      source: 'HR. Bukhari no. 5027'
    },
    {
      student_id: studentId,
      grade_level: 3,
      curriculum_item_id: 'doa-tidur',
      curriculum_title: 'Doa Sebelum dan Bangun Tidur',
      category: 'DOA',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 5,
      child_self_claim: true,
      parent_review_status: 'APPROVED',
      mutabaah_grade: 'L',
      parent_notes: 'Sudah mutqin dan diamalkan setiap hari.',
      arabic_text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا • الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
      translation: 'Dengan nama-Mu ya Allah aku mati dan aku hidup...',
      source: 'Hisnul Muslim'
    },

    // --- KELAS 4 SDIT ---
    {
      student_id: studentId,
      grade_level: 4,
      curriculum_item_id: 'quran-at-tin',
      curriculum_title: 'Surat At-Tin (Ayat 1 - 8)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 2,
      child_self_claim: true,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'وَالتِّينِ وَالزَّيْتُونِ • وَطُورِ سِينِينَ • وَهَذَا الْبَلَدِ الأَمِينِ...',
      translation: 'Demi buah Tin dan buah Zaitun, demi gunung Sinai...',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: 4,
      curriculum_item_id: 'hadith-lisan',
      curriculum_title: 'Hadis Berkata Baik atau Diam',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 2,
      child_self_claim: true,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
      latin_text: 'Man kaana yu\'minu billaahi wal yawmil aakhiri falyaqul khoiron aw liyashmut.',
      translation: 'Barangsiapa beriman kepada Allah dan hari akhir, hendaklah berkata baik atau diam.',
      source: 'HR. Bukhari no. 6018'
    },

    // --- KELAS 5 SDIT ---
    {
      student_id: studentId,
      grade_level: 5,
      curriculum_item_id: 'quran-al-fajr',
      curriculum_title: 'Surat Al-Fajr (Ayat 1 - 30)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 1,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'وَالْفَجْرِ • وَلَيَالٍ عَشْرٍ • وَالشَّفْعِ وَالْوَتْرِ...',
      translation: 'Demi fajar, dan malam yang sepuluh...',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: 5,
      curriculum_item_id: 'hadith-muslim',
      curriculum_title: 'Hadis Muslim Sejati Menjaga Lisan & Tangan',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 1,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
      latin_text: 'Al-muslimu man salimal muslimuuna min lisaanihii wa yadih.',
      translation: 'Seorang muslim sejati adalah yang orang muslim lainnya selamat dari lisan dan tangannya.',
      source: 'HR. Bukhari no. 10'
    },

    // --- KELAS 6 SDIT ---
    {
      student_id: studentId,
      grade_level: 6,
      curriculum_item_id: 'quran-al-ala',
      curriculum_title: 'Surat Al-A\'la (Ayat 1 - 19)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'سَبِّحِ اسْمَ رَبِّكَ الأَعْلَى • الَّذِي خَلَقَ فَسَوَّى...',
      translation: 'Sucikanlah nama Tuhanmu Yang Mahatinggi...',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: 6,
      curriculum_item_id: 'hadith-kasihsayang',
      curriculum_title: 'Hadis Menyayangi Sesama Makhluk',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'مَنْ لَا يَرْحَمْ لَا يُرْحَمْ',
      latin_text: 'Man laa yarham laa yurham.',
      translation: 'Barangsiapa tidak menyayangi, maka tidak akan disayangi.',
      source: 'HR. Bukhari no. 5997'
    }
  ];

  for (let i = 0; i < sditCurriculum.length; i++) {
    const checklistId = `chk-${studentId}-${i + 1}`;
    await db.murojaah_checklists.add({
      id: checklistId,
      last_checked_at: new Date().toISOString(),
      ...sditCurriculum[i]
    });
  }

  // 6. Seed Academic Levels (Kelas 1 - 6)
  for (let grade = 1; grade <= 6; grade++) {
    await db.academic_levels.add({
      id: `level-${studentId}-grade-${grade}`,
      student_id: studentId,
      grade_level: grade,
      academic_year: '2025/2026',
      is_active: grade === 3,
      created_at: new Date().toISOString()
    });
  }

  // 7. Seed Exam Cycles (PTS 1 & PAS 1)
  const activeLevelId = `level-${studentId}-grade-3`;
  await db.exam_cycles.add({
    id: 'cycle-pts-1',
    level_id: activeLevelId,
    student_id: studentId,
    exam_type: 'PTS_1',
    exam_title: 'Penilaian Tengah Semester 1 (Ganjil)',
    exam_date: '2026-10-20',
    target_retention: 0.90,
    created_at: new Date().toISOString()
  });

  await db.exam_cycles.add({
    id: 'cycle-pas-1',
    level_id: activeLevelId,
    student_id: studentId,
    exam_type: 'PAS_1',
    exam_title: 'Penilaian Akhir Semester 1',
    exam_date: '2026-12-15',
    target_retention: 0.95,
    created_at: new Date().toISOString()
  });

  // 8. Seed FSRS-6 Memory States for active curriculum
  await db.fsrs_memory_states.add({
    id: `fsrs-${studentId}-al-fatihah`,
    unit_id: 'unit-quran-al-fatihah',
    student_id: studentId,
    track_type: 'MANZIL',
    difficulty: 2.1,
    stability: 28.5,
    retrievability: 0.94,
    last_review: new Date(Date.now() - 86400000 * 2).toISOString(),
    next_due: new Date(Date.now() + 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  });
}
