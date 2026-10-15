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
  UserGender
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

// Helper menyimpan rekaman audio setoran hafalan anak
export async function saveHafalanAudioRecord(checklistId: string, audioUrl: string, durationSec: number): Promise<void> {
  await db.murojaah_checklists.update(checklistId, {
    audio_record_url: audioUrl,
    audio_duration: durationSec,
    recorded_at: new Date().toISOString(),
    parent_review_status: 'PENDING'
  });
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
    email: child.email,
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
    star_points: 20,
    water_drops: 10,
    garden_tree_level: 1,
    unlocked_stickers: ['sticker_welcome_star'],
    created_at: new Date().toISOString()
  };

  await db.user_profiles.add(newProfile);

  // Buatkan academic levels & checklist default untuk anak baru ini
  await db.academic_levels.add({
    id: `level-${childId}-grade-${child.grade}`,
    student_id: childId,
    grade_level: child.grade,
    academic_year: '2025/2026',
    is_active: true,
    created_at: new Date().toISOString()
  });

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

// Sample audio data URI (1.2 detik nada talaqqi Bismillah audio WAV valid)
const SAMPLE_AUDIO_BISMILLAH = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LFjV02DF2o3/PLm248Fz2W1e7NnW47GD2U1e/OoHE9Gz2R0+rJmHNAHDmP0ebEkmlCEjKGzN7Ah2FDEi+BzdzAfmFEEyuAy9m9fF9HECW7x9W2c1ZEECa0wNOxbFJDDSurvcqna08+DCelscSUZEI7ByOeqrmUYz47BSicrLiRYTo4BimfqbSOXzc3BCmfqa+IWzQ0BCigp62EWjA0AymdoauCVS0xACibnaaAViouACmanZ96UiUsACiZnJp3TyMm';

// Seed initial curriculum data spanning Kelas 1 - 6 SDIT and ALL 10 TABLES
export async function seedInitialData() {
  const profileCount = await db.user_profiles.count();
  const contentCount = await db.content_units.count();
  
  const student1Id = 'student-hafiz-01';
  const student2Id = 'student-maryam-02';
  const parentId = 'parent-abu-hafiz-01';
  const adminId = 'admin-imran-01';
  const today = new Date().toISOString().split('T')[0];

  // 1. SEED PROFIL PENGGUNA (Jika belum ada)
  if (profileCount === 0) {
    // Parent Profile (Orang Tua Utama)
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

    // Admin Profile (imranpermadi@gmail.com)
    await db.user_profiles.add({
      id: adminId,
      email: 'imranpermadi@gmail.com',
      username: 'imran_permadi',
      full_name: 'Ustadz Imran Permadi, S.Pd.I',
      role: 'PARENT',
      gender: 'PUTRA',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=imran',
      prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
      prayer_city_name: 'KOTA MEDAN',
      latitude: 3.5952,
      longitude: 98.6722,
      qibla_bearing: 292.8,
      daily_streak: 30,
      star_points: 500,
      water_drops: 200,
      garden_tree_level: 5,
      unlocked_stickers: ['sticker_welcome_star', 'sticker_kabah', 'sticker_lantern']
    });

    // Student 1: Hafiz Al-Fatih (Putra, Kelas 3 SDIT) -> Linked to Abu Hafiz
    await db.user_profiles.add({
      id: student1Id,
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

    // Student 2: Maryam Sholihah (Putri, Kelas 1 SDIT) -> Linked to Abu Hafiz
    await db.user_profiles.add({
      id: student2Id,
      email: 'maryam@mutabaahku.id',
      username: 'maryam_sholihah',
      full_name: 'Maryam Sholihah',
      role: 'STUDENT',
      gender: 'PUTRI',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=maryam',
      parent_id: parentId,
      school_name: 'SDIT Imam Bukhari',
      current_grade: 1,
      prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
      prayer_city_name: 'KOTA MEDAN',
      latitude: 3.5952,
      longitude: 98.6722,
      qibla_bearing: 292.8,
      daily_streak: 7,
      star_points: 85,
      water_drops: 30,
      garden_tree_level: 1,
      unlocked_stickers: ['sticker_welcome_star']
    });
  }

  // 2. SEED ITEM KURIKULUM & UNIT KONTEN (Agar tabel tidak kosong di Admin Console)
  if (contentCount === 0) {
    // Curriculum Items
    const currItems: CurriculumItem[] = [
      {
        id: 'curr-an-naba',
        exam_cycle_id: 'cycle-pts-1',
        student_id: student1Id,
        category: 'QURAN',
        title: 'Surat An-Naba\' (Ayat 1-40)',
        external_ref_id: 'surah-78',
        is_mastered: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'curr-hadith-ilmu',
        exam_cycle_id: 'cycle-pts-1',
        student_id: student1Id,
        category: 'HADITH',
        title: 'Hadis Menuntut Ilmu Adalah Kewajiban',
        external_ref_id: 'hadith-224',
        is_mastered: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'curr-doa-tidur',
        exam_cycle_id: 'cycle-pts-1',
        student_id: student1Id,
        category: 'DOA',
        title: 'Doa Sebelum dan Bangun Tidur',
        is_mastered: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'curr-an-nas',
        exam_cycle_id: 'cycle-pts-1',
        student_id: student2Id,
        category: 'QURAN',
        title: 'Surat An-Nas (Ayat 1-6)',
        external_ref_id: 'surah-114',
        is_mastered: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'curr-hadith-senyum',
        exam_cycle_id: 'cycle-pts-1',
        student_id: student2Id,
        category: 'HADITH',
        title: 'Hadis Senyum Adalah Sedekah',
        is_mastered: true,
        created_at: new Date().toISOString()
      }
    ];

    for (const item of currItems) {
      await db.curriculum_items.put(item);
    }

    // Content Units (Unit Ayat / Kalimat Hadis)
    const contentUnits: ContentUnit[] = [
      {
        id: 'unit-naba-1',
        curriculum_item_id: 'curr-an-naba',
        sequence_num: 1,
        arabic_uthmani: 'عَمَّ يَتَسَآءَلُونَ',
        arabic_normalized: 'عم يتساءلون',
        latin_text: '\'Amma yatasaa-aluun',
        translation_id: 'Tentang apakah mereka saling bertanya-tanya?',
        dalil_source: 'Al-Qur\'an Surah An-Naba Ayat 1',
        created_at: new Date().toISOString()
      },
      {
        id: 'unit-naba-2',
        curriculum_item_id: 'curr-an-naba',
        sequence_num: 2,
        arabic_uthmani: 'عَنِ ٱلنَّبَإِ ٱلْعَظِيمِ',
        arabic_normalized: 'عن النبإ العظيم',
        latin_text: '\'Anin-naba-il \'adziim',
        translation_id: 'Tentang berita yang besar (hari berbangkit)',
        dalil_source: 'Al-Qur\'an Surah An-Naba Ayat 2',
        created_at: new Date().toISOString()
      },
      {
        id: 'unit-hadith-ilmu',
        curriculum_item_id: 'curr-hadith-ilmu',
        sequence_num: 1,
        arabic_uthmani: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
        arabic_normalized: 'طلب العلم فريضة على كل مسلم',
        latin_text: 'Tholabul \'ilmi fariidhotun \'alaa kulli muslim',
        translation_id: 'Menuntut ilmu itu wajib bagi setiap muslim.',
        dalil_source: 'HR. Ibnu Majah no. 224 (Shahih)',
        created_at: new Date().toISOString()
      },
      {
        id: 'unit-doa-tidur',
        curriculum_item_id: 'curr-doa-tidur',
        sequence_num: 1,
        arabic_uthmani: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        arabic_normalized: 'باسمك اللهم أموت وأحيا',
        latin_text: 'Bismikallaahumma amuutu wa ahyaa',
        translation_id: 'Dengan nama-Mu ya Allah aku mati dan aku hidup.',
        dalil_source: 'HR. Bukhari no. 6324 & Muslim no. 2711',
        created_at: new Date().toISOString()
      },
      {
        id: 'unit-nas-1',
        curriculum_item_id: 'curr-an-nas',
        sequence_num: 1,
        arabic_uthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
        arabic_normalized: 'قل أعوذ برب الناس',
        latin_text: 'Qul a\'uudzu birabbin-naas',
        translation_id: 'Katakanlah: "Aku berlindung kepada Tuhannya manusia"',
        dalil_source: 'Al-Qur\'an Surah An-Nas Ayat 1',
        created_at: new Date().toISOString()
      }
    ];

    for (const unit of contentUnits) {
      await db.content_units.put(unit);
    }
  }

  // 3. SEED MUTABAAH LOGS (Log Setoran Ujian)
  const logCount = await db.mutabaah_logs.count();
  if (logCount === 0) {
    const logs: MutabaahLog[] = [
      {
        id: 'log-hafiz-01',
        curriculum_item_id: 'curr-an-naba',
        student_id: student1Id,
        logged_by_role: 'STUDENT',
        fsrs_rating: 4,
        asr_accuracy_score: 95.5,
        parent_verified: false,
        official_mutabaah_status: 'L',
        tajwid_makhraj_notes: 'Setoran rekaman suara ayat 1-10 An-Naba',
        created_at: new Date().toISOString()
      },
      {
        id: 'log-hafiz-02',
        curriculum_item_id: 'curr-hadith-ilmu',
        student_id: student1Id,
        logged_by_role: 'PARENT',
        fsrs_rating: 4,
        asr_accuracy_score: 98.0,
        parent_verified: true,
        official_mutabaah_status: 'L',
        parent_feedback: 'MasyaAllah hafalan matan dan arti sangat lancar!',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'log-maryam-01',
        curriculum_item_id: 'curr-an-nas',
        student_id: student2Id,
        logged_by_role: 'PARENT',
        fsrs_rating: 4,
        asr_accuracy_score: 100,
        parent_verified: true,
        official_mutabaah_status: 'L',
        parent_feedback: 'Sudah mutqin dan hafal mandiri!',
        created_at: new Date().toISOString()
      }
    ];

    for (const log of logs) {
      await db.mutabaah_logs.put(log);
    }
  }

  // 4. SEED CEKLIS MUROJAAH DENGAN CONTOH REKAMAN SUARA (Audio Recording Review)
  const checklistCount = await db.murojaah_checklists.count();
  if (checklistCount === 0) {
    const sditCurriculum: Omit<MurojaahChecklist, 'id'>[] = [
      // Hafiz (Kelas 3 SDIT) - Dengan Rekaman Suara Setoran
      {
        student_id: student1Id,
        grade_level: 3,
        curriculum_item_id: 'curr-an-naba',
        curriculum_title: 'Surat An-Naba\' (Ayat 1 - 40)',
        category: 'QURAN',
        exam_cycle_id: 'PTS_1',
        target_pass_count: 5,
        completed_pass_count: 3,
        child_self_claim: true,
        parent_review_status: 'PENDING',
        mutabaah_grade: 'L',
        parent_notes: 'Dengarkan rekaman suara untuk periksa makhraj Ain dan Ha.',
        arabic_text: 'عَمَّ يَتَسَاءَلُونَ • عَنِ النَّبَإِ الْعَظِيمِ • الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ...',
        translation: 'Tentang apakah mereka saling bertanya-tanya? Tentang berita yang besar...',
        source: 'Al-Qur\'an Juz 30',
        audio_record_url: SAMPLE_AUDIO_BISMILLAH,
        audio_duration: 18,
        recorded_at: new Date().toISOString()
      },
      {
        student_id: student1Id,
        grade_level: 3,
        curriculum_item_id: 'curr-hadith-ilmu',
        curriculum_title: 'Hadis Menuntut Ilmu Adalah Kewajiban',
        category: 'HADITH',
        exam_cycle_id: 'PTS_1',
        target_pass_count: 5,
        completed_pass_count: 4,
        child_self_claim: true,
        parent_review_status: 'APPROVED',
        mutabaah_grade: 'L',
        parent_notes: 'Lafaz dan artinya sudah sangat lancar.',
        arabic_text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
        latin_text: 'Tholabul \'ilmi fariidhotun \'alaa kulli muslim.',
        translation: 'Menuntut ilmu itu wajib bagi setiap muslim.',
        source: 'HR. Ibnu Majah no. 224'
      },
      {
        student_id: student1Id,
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
        source: 'HR. Bukhari no. 5027',
        audio_record_url: SAMPLE_AUDIO_BISMILLAH,
        audio_duration: 12,
        recorded_at: new Date().toISOString()
      },
      {
        student_id: student1Id,
        grade_level: 3,
        curriculum_item_id: 'curr-doa-tidur',
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

      // Maryam Sholihah (Kelas 1 SDIT)
      {
        student_id: student2Id,
        grade_level: 1,
        curriculum_item_id: 'curr-an-nas',
        curriculum_title: 'Surat An-Nas (Ayat 1 - 6)',
        category: 'QURAN',
        exam_cycle_id: 'PTS_1',
        target_pass_count: 5,
        completed_pass_count: 5,
        child_self_claim: true,
        parent_review_status: 'APPROVED',
        mutabaah_grade: 'L',
        parent_notes: 'Alhamdulillah sudah hafal lancar!',
        arabic_text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ • مَلِكِ النَّاسِ • إِلَهِ النَّاسِ...',
        translation: 'Katakanlah: "Aku berlindung kepada Tuhannya manusia..."',
        source: 'Al-Qur\'an Juz 30'
      },
      {
        student_id: student2Id,
        grade_level: 1,
        curriculum_item_id: 'curr-hadith-senyum',
        curriculum_title: 'Hadis Senyum Adalah Sedekah',
        category: 'HADITH',
        exam_cycle_id: 'PTS_1',
        target_pass_count: 5,
        completed_pass_count: 3,
        child_self_claim: true,
        parent_review_status: 'PENDING',
        mutabaah_grade: 'L',
        arabic_text: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
        latin_text: 'Tabassumuka fii wajhi akhiika laka shodaqoh.',
        translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
        source: 'HR. Tirmidzi no. 1956',
        audio_record_url: SAMPLE_AUDIO_BISMILLAH,
        audio_duration: 9,
        recorded_at: new Date().toISOString()
      },
      {
        student_id: student2Id,
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
        translation: 'Dengan nama Allah...',
        source: 'Hisnul Muslim'
      }
    ];

    for (let i = 0; i < sditCurriculum.length; i++) {
      const item = sditCurriculum[i];
      await db.murojaah_checklists.add({
        id: `chk-${item.student_id}-${i + 1}`,
        last_checked_at: new Date().toISOString(),
        ...item
      });
    }
  }

  // 5. SEED ACADEMIC LEVELS (Kelas 1 - 6)
  const levelCount = await db.academic_levels.count();
  if (levelCount === 0) {
    for (let grade = 1; grade <= 6; grade++) {
      await db.academic_levels.add({
        id: `level-${student1Id}-grade-${grade}`,
        student_id: student1Id,
        grade_level: grade,
        academic_year: '2025/2026',
        is_active: grade === 3,
        created_at: new Date().toISOString()
      });
    }

    await db.academic_levels.add({
      id: `level-${student2Id}-grade-1`,
      student_id: student2Id,
      grade_level: 1,
      academic_year: '2025/2026',
      is_active: true,
      created_at: new Date().toISOString()
    });
  }

  // 6. SEED SIKLUS UJIAN
  const cycleCount = await db.exam_cycles.count();
  if (cycleCount === 0) {
    await db.exam_cycles.add({
      id: 'cycle-pts-1',
      level_id: `level-${student1Id}-grade-3`,
      student_id: student1Id,
      exam_type: 'PTS_1',
      exam_title: 'Penilaian Tengah Semester 1 (Ganjil)',
      exam_date: '2026-10-20',
      target_retention: 0.90,
      created_at: new Date().toISOString()
    });

    await db.exam_cycles.add({
      id: 'cycle-pas-1',
      level_id: `level-${student1Id}-grade-3`,
      student_id: student1Id,
      exam_type: 'PAS_1',
      exam_title: 'Penilaian Akhir Semester 1',
      exam_date: '2026-12-15',
      target_retention: 0.95,
      created_at: new Date().toISOString()
    });
  }

  // 7. SEED PROGRES 13 RUKUN SHOLAT
  const progressCount = await db.sholat_learning_progress.count();
  if (progressCount === 0) {
    for (const step of SHOLAT_STEPS) {
      await db.sholat_learning_progress.add({
        id: `prog-${student1Id}-${step.step_code}`,
        student_id: student1Id,
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
  }

  // 8. SEED MUTABA'AH YAUMIYAH LOG
  const ibadahCount = await db.ibadah_daily_logs.count();
  if (ibadahCount === 0) {
    await db.ibadah_daily_logs.add({
      id: `ibadah-${student1Id}-${today}`,
      student_id: student1Id,
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

    await db.ibadah_daily_logs.add({
      id: `ibadah-${student2Id}-${today}`,
      student_id: student2Id,
      log_date: today,
      sholat_subuh: 'BERJAMAAH',
      sholat_dzuhur: 'BERJAMAAH',
      sholat_ashar: 'BERJAMAAH',
      sholat_maghrib: 'BERJAMAAH',
      sholat_isya: 'BERJAMAAH',
      dzikir_bada_sholat_count: 3,
      sholat_dhuha_rakaat: 2,
      sholat_rawatib_count: 2,
      sholat_qiyamul_lail: false,
      puasa_type: 'TIDAK_PUASA',
      puasa_completion: 'NONE',
      child_notes: 'Maryam belajar sholat tepat waktu bersama Ibu!',
      parent_review_status: 'PENDING',
      reward_stars_awarded: 15,
      created_at: new Date().toISOString()
    });
  }

  // 9. SEED FSRS-6 MEMORY STATES
  const fsrsCount = await db.fsrs_memory_states.count();
  if (fsrsCount === 0) {
    await db.fsrs_memory_states.add({
      id: `fsrs-${student1Id}-al-naba`,
      unit_id: 'unit-naba-1',
      student_id: student1Id,
      track_type: 'MANZIL',
      difficulty: 2.1,
      stability: 28.5,
      retrievability: 0.94,
      last_review: new Date(Date.now() - 86400000 * 2).toISOString(),
      next_due: new Date(Date.now() + 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
}
