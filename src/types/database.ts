export type UserRole = 'PARENT' | 'STUDENT';
export type UserGender = 'PUTRA' | 'PUTRI';
export type ExamType = 'PTS_1' | 'MID_1' | 'PAS_1' | 'PTS_2' | 'MID_2' | 'PAS_2';
export type CurriculumCategory = 'QURAN' | 'HADITH' | 'DOA' | 'SHOLAT_SUNNAH_SALAF';
export type ParentReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_PRACTICE';
export type MutabaahGrade = 'L' | 'BL'; // Lancar / Belum Lancar
export type SholatStatus = 'BERJAMAAH' | 'MUNFARID_TEPAT' | 'TERLAMBAT' | 'TIDAK_SHOLAT' | 'UZUR';
export type PuasaType = 'TIDAK_PUASA' | 'RAMADHAN' | 'SENIN_KAMIS' | 'AYYAMUL_BIDH' | 'SUNNAH_LAINNYA';
export type PuasaCompletion = 'NONE' | 'PENUH_MAGHRIB' | 'LATIHAN_SETENGAH_HARI';

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  full_name: string;
  role: UserRole;
  gender: UserGender;
  avatar_url?: string;
  parent_id?: string;
  school_name?: string;
  current_grade?: number; // 1 - 6
  
  // Prayer City Settings
  prayer_city_id: string;
  prayer_city_name: string;
  latitude: number;
  longitude: number;
  qibla_bearing: number;
  
  // Gamification Attributes
  daily_streak: number;
  star_points: number;
  water_drops: number;
  garden_tree_level: number; // 1 to 5
  unlocked_stickers: string[];
  
  created_at?: string;
  updated_at?: string;
}

export interface PrayerReadingOption {
  id: string;
  label: string;
  arabic: string;
  latin: string;
  translation: string;
  source: string;
  is_short_for_kids?: boolean;
}

export interface SholatStepInfo {
  step_code: string;
  step_order: number;
  title: string;
  arabic_title: string;
  description: string;
  dalil: string;
  dalil_source: string;
  arabic_reading: string;
  latin_reading: string;
  translation: string;
  posture: 'stand' | 'takbir' | 'fold_chest' | 'ruku' | 'itidal' | 'sujud' | 'iftirasy' | 'tawarruk' | 'salam';
  reading_options?: PrayerReadingOption[];
}

export interface SholatLearningProgress {
  id: string;
  student_id: string;
  step_code: string;
  step_order: number;
  animation_practiced_count: number;
  reading_memorized: boolean;
  quiz_high_score: number;
  parent_verified_movement: boolean;
  parent_verified_reading: boolean;
  parent_notes?: string;
  updated_at?: string;
}

export interface IbadahDailyLog {
  id: string;
  student_id: string;
  log_date: string; // YYYY-MM-DD
  
  sholat_subuh: SholatStatus;
  sholat_dzuhur: SholatStatus;
  sholat_ashar: SholatStatus;
  sholat_maghrib: SholatStatus;
  sholat_isya: SholatStatus;
  
  dzikir_bada_sholat_count: number;
  sholat_dhuha_rakaat: number;
  sholat_rawatib_count: number;
  sholat_qiyamul_lail: boolean;
  
  puasa_type: PuasaType;
  puasa_completion: PuasaCompletion;
  
  child_notes?: string;
  parent_review_status: ParentReviewStatus;
  parent_reviewer_id?: string;
  parent_review_notes?: string;
  reward_stars_awarded: number;
  reviewed_at?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface MurojaahChecklist {
  id: string;
  student_id: string;
  curriculum_item_id: string;
  curriculum_title: string;
  category: CurriculumCategory;
  grade_level: number; // 1 - 6
  exam_cycle_id: string;
  target_pass_count: number;
  completed_pass_count: number;
  child_self_claim: boolean;
  parent_review_status: ParentReviewStatus;
  mutabaah_grade: MutabaahGrade;
  parent_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  last_checked_at?: string;
  
  // Fitur materi kustom (Hadis/Doa/Ayat tambahan sekolah)
  is_custom?: boolean;
  arabic_text?: string;
  latin_text?: string;
  translation?: string;
  source?: string;

  // Fitur Rekaman Suara Setoran Hafalan Anak (Audio Recording Review)
  audio_record_url?: string;
  audio_duration?: number; // detik
  recorded_at?: string;
}

export interface SyncQueueItem {
  id?: number;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  error_message?: string;
  created_at: string;
}

// 2. Tingkat Kelas Akademik (Kelas 1 - 6)
export interface AcademicLevel {
  id: string;
  student_id: string;
  grade_level: number; // 1 - 6
  academic_year: string;
  is_active: boolean;
  created_at?: string;
}

// 3. Siklus Ujian (PTS, MID, PAS)
export interface ExamCycle {
  id: string;
  level_id: string;
  student_id: string;
  exam_type: ExamType;
  exam_title: string;
  exam_date?: string;
  target_retention: number; // default 0.90
  created_at?: string;
}

// 4. Item Kurikulum Hafalan
export interface CurriculumItem {
  id: string;
  exam_cycle_id: string;
  student_id: string;
  category: CurriculumCategory;
  title: string;
  external_ref_id?: string;
  verse_range?: { start: number; end: number };
  is_mastered: boolean;
  created_at?: string;
}

// 5. Unit Konten Otomatis (Per Ayat / Kalimat Hadis / Doa)
export interface ContentUnit {
  id: string;
  curriculum_item_id: string;
  sequence_num: number;
  arabic_uthmani: string;
  arabic_normalized: string;
  latin_text?: string;
  translation_id?: string;
  dalil_source?: string;
  audio_urls?: Record<string, string>;
  created_at?: string;
}

// 7. State Memori FSRS-6
export interface FsrsMemoryState {
  id: string;
  unit_id: string;
  student_id: string;
  track_type: 'SABAQ' | 'SABQI' | 'MANZIL';
  difficulty: number;
  stability: number;
  retrievability: number;
  last_review?: string;
  next_due?: string;
  error_anchors?: string[];
  updated_at?: string;
}

// 8. Log Setoran & Latihan Hafalan
export interface MutabaahLog {
  id: string;
  unit_id?: string;
  curriculum_item_id?: string;
  student_id: string;
  logged_by_role: UserRole;
  fsrs_rating?: number; // 1 - 4
  asr_accuracy_score?: number;
  parent_verified: boolean;
  official_mutabaah_status?: MutabaahGrade;
  tajwid_makhraj_notes?: string;
  parent_feedback?: string;
  created_at?: string;
}

