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

// Tanggal lokal perangkat (YYYY-MM-DD). toISOString() memakai UTC sehingga pada WIB
// dini hari akan menghasilkan tanggal kemarin.
export function todayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Materi awal untuk santri baru, supaya antrean setoran tidak kosong.
// Tidak ada audio / progres palsu: semua dimulai dari 0.
export async function ensureStarterChecklists(studentId: string, grade: number): Promise<MurojaahChecklist[]> {
  const existing = await db.murojaah_checklists.where('student_id').equals(studentId).count();
  if (existing > 0) return [];

  const starters: Omit<MurojaahChecklist, 'id'>[] = [
    {
      student_id: studentId,
      grade_level: grade,
      curriculum_item_id: 'starter-an-nas',
      curriculum_title: 'Surat An-Nas (Ayat 1 - 6)',
      category: 'QURAN',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ • مَلِكِ النَّاسِ • إِلَهِ النَّاسِ...',
      translation: 'Katakanlah: "Aku berlindung kepada Tuhannya manusia..."',
      source: 'Al-Qur\'an Juz 30'
    },
    {
      student_id: studentId,
      grade_level: grade,
      curriculum_item_id: 'starter-hadith-senyum',
      curriculum_title: 'Hadis Senyum Adalah Sedekah',
      category: 'HADITH',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
      latin_text: 'Tabassumuka fii wajhi akhiika laka shodaqoh.',
      translation: 'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
      source: 'HR. Tirmidzi no. 1956'
    },
    {
      student_id: studentId,
      grade_level: grade,
      curriculum_item_id: 'starter-doa-makan',
      curriculum_title: 'Doa Sebelum & Sesudah Makan',
      category: 'DOA',
      exam_cycle_id: 'PTS_1',
      target_pass_count: 5,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: 'بِسْمِ اللَّهِ • الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      translation: 'Dengan nama Allah...',
      source: 'Hisnul Muslim'
    }
  ];

  const created: MurojaahChecklist[] = [];
  for (let i = 0; i < starters.length; i++) {
    const row: MurojaahChecklist = {
      id: `chk-${studentId}-${i + 1}`,
      last_checked_at: new Date().toISOString(),
      ...starters[i]
    };
    await db.murojaah_checklists.put(row);
    created.push(row);
  }
  return created;
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
