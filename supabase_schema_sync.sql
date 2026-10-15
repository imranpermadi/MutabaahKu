-- ==============================================================================
-- MUTABAAHKU — SUPABASE SCHEMA MIGRATION & FULL SYNC SCRIPT
-- ==============================================================================
-- Script ini dirancang IDEMPOTENT (aman dijalankan berkali-kali).
-- Menyesuaikan 10 tabel Supabase agar 100% kompatibel dengan Dexie DB lokal,
-- termasuk dukungan ID bertipe TEXT (mencegah error invalid UUID syntax),
-- penambahan kolom rekaman suara audio setoran, dan konfigurasi RLS Admin Console.
--
-- CARA PENGGUNAAN:
-- 1. Buka dashboard Supabase Anda: https://supabase.com/dashboard/project/qedenyqmbnuidtgivxwe
-- 2. Klik menu "SQL Editor" di bilah samping kiri.
-- 3. Paste seluruh isi script ini, lalu klik tombol "Run".
-- ==============================================================================

-- 1. TABEL: user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT,
    username TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    gender TEXT NOT NULL DEFAULT 'PUTRA',
    avatar_url TEXT,
    parent_id TEXT,
    school_name TEXT DEFAULT 'SDIT Imam Bukhari',
    current_grade INTEGER DEFAULT 1,
    prayer_city_id TEXT DEFAULT '58a2fc6ed39fd083f55d4182bf88826d',
    prayer_city_name TEXT DEFAULT 'KOTA MEDAN',
    latitude NUMERIC DEFAULT 3.5952,
    longitude NUMERIC DEFAULT 98.6722,
    qibla_bearing NUMERIC DEFAULT 292.8,
    daily_streak INTEGER DEFAULT 1,
    star_points INTEGER DEFAULT 0,
    water_drops INTEGER DEFAULT 0,
    garden_tree_level INTEGER DEFAULT 1,
    unlocked_stickers JSONB DEFAULT '["sticker_welcome_star"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom baru ada jika tabel sudah ada sebelumnya
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS school_name TEXT DEFAULT 'SDIT Imam Bukhari';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS current_grade INTEGER DEFAULT 1;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS prayer_city_id TEXT DEFAULT '58a2fc6ed39fd083f55d4182bf88826d';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS prayer_city_name TEXT DEFAULT 'KOTA MEDAN';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS latitude NUMERIC DEFAULT 3.5952;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS longitude NUMERIC DEFAULT 98.6722;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS qibla_bearing NUMERIC DEFAULT 292.8;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 1;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS star_points INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS water_drops INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS garden_tree_level INTEGER DEFAULT 1;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS unlocked_stickers JSONB DEFAULT '["sticker_welcome_star"]'::jsonb;

-- 2. TABEL: academic_levels (Jenjang Kelas 1 - 6 SDIT)
CREATE TABLE IF NOT EXISTS public.academic_levels (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 1,
    academic_year TEXT NOT NULL DEFAULT '2025/2026',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academic_levels ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.academic_levels ADD COLUMN IF NOT EXISTS grade_level INTEGER DEFAULT 1;
ALTER TABLE public.academic_levels ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '2025/2026';
ALTER TABLE public.academic_levels ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. TABEL: exam_cycles (Siklus Ujian PTS & PAS)
CREATE TABLE IF NOT EXISTS public.exam_cycles (
    id TEXT PRIMARY KEY,
    level_id TEXT,
    student_id TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'PTS_1',
    exam_title TEXT NOT NULL,
    exam_date TEXT,
    target_retention NUMERIC DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_cycles ADD COLUMN IF NOT EXISTS level_id TEXT;
ALTER TABLE public.exam_cycles ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.exam_cycles ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'PTS_1';
ALTER TABLE public.exam_cycles ADD COLUMN IF NOT EXISTS exam_title TEXT;
ALTER TABLE public.exam_cycles ADD COLUMN IF NOT EXISTS exam_date TEXT;
ALTER TABLE public.exam_cycles ADD COLUMN IF NOT EXISTS target_retention NUMERIC DEFAULT 0.90;

-- 4. TABEL: curriculum_items (Item Kurikulum Hafalan)
CREATE TABLE IF NOT EXISTS public.curriculum_items (
    id TEXT PRIMARY KEY,
    exam_cycle_id TEXT,
    student_id TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'QURAN',
    title TEXT NOT NULL,
    external_ref_id TEXT,
    verse_range JSONB,
    is_mastered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS exam_cycle_id TEXT;
ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'QURAN';
ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS external_ref_id TEXT;
ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS verse_range JSONB;
ALTER TABLE public.curriculum_items ADD COLUMN IF NOT EXISTS is_mastered BOOLEAN DEFAULT false;

-- 5. TABEL: content_units (Ayat, Hadis, & Doa)
CREATE TABLE IF NOT EXISTS public.content_units (
    id TEXT PRIMARY KEY,
    curriculum_item_id TEXT NOT NULL,
    sequence_num INTEGER NOT NULL DEFAULT 1,
    arabic_uthmani TEXT NOT NULL,
    arabic_normalized TEXT,
    latin_text TEXT,
    translation_id TEXT,
    dalil_source TEXT,
    audio_urls JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS curriculum_item_id TEXT;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS sequence_num INTEGER DEFAULT 1;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS arabic_uthmani TEXT;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS arabic_normalized TEXT;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS latin_text TEXT;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS translation_id TEXT;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS dalil_source TEXT;
ALTER TABLE public.content_units ADD COLUMN IF NOT EXISTS audio_urls JSONB;

-- 6. TABEL: murojaah_checklists (Ceklis Setoran Hafalan & Rekaman Audio)
CREATE TABLE IF NOT EXISTS public.murojaah_checklists (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    curriculum_item_id TEXT,
    curriculum_title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'HADITH',
    grade_level INTEGER NOT NULL DEFAULT 1,
    exam_cycle_id TEXT,
    target_pass_count INTEGER DEFAULT 5,
    completed_pass_count INTEGER DEFAULT 0,
    child_self_claim BOOLEAN DEFAULT false,
    parent_review_status TEXT DEFAULT 'PENDING',
    mutabaah_grade TEXT DEFAULT 'BL',
    parent_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,
    is_custom BOOLEAN DEFAULT false,
    arabic_text TEXT,
    latin_text TEXT,
    translation TEXT,
    source TEXT,
    audio_record_url TEXT,
    audio_duration NUMERIC,
    recorded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS audio_record_url TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS audio_duration NUMERIC;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS arabic_text TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS latin_text TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS translation TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS curriculum_title TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'HADITH';
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS grade_level INTEGER DEFAULT 1;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS target_pass_count INTEGER DEFAULT 5;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS completed_pass_count INTEGER DEFAULT 0;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS child_self_claim BOOLEAN DEFAULT false;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS parent_review_status TEXT DEFAULT 'PENDING';
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS mutabaah_grade TEXT DEFAULT 'BL';
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS parent_notes TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.murojaah_checklists ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

-- 7. TABEL: ibadah_daily_logs (Mutaba'ah Yaumiyah Sholat & Puasa)
CREATE TABLE IF NOT EXISTS public.ibadah_daily_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    log_date TEXT NOT NULL,
    sholat_subuh TEXT DEFAULT 'BERJAMAAH',
    sholat_dzuhur TEXT DEFAULT 'BERJAMAAH',
    sholat_ashar TEXT DEFAULT 'BERJAMAAH',
    sholat_maghrib TEXT DEFAULT 'BERJAMAAH',
    sholat_isya TEXT DEFAULT 'BERJAMAAH',
    dzikir_bada_sholat_count INTEGER DEFAULT 0,
    sholat_dhuha_rakaat INTEGER DEFAULT 0,
    sholat_rawatib_count INTEGER DEFAULT 0,
    sholat_qiyamul_lail BOOLEAN DEFAULT false,
    puasa_type TEXT DEFAULT 'TIDAK_PUASA',
    puasa_completion TEXT DEFAULT 'NONE',
    child_notes TEXT,
    parent_review_status TEXT DEFAULT 'PENDING',
    parent_reviewer_id TEXT,
    parent_review_notes TEXT,
    reward_stars_awarded INTEGER DEFAULT 0,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ibadah_daily_logs ADD COLUMN IF NOT EXISTS child_notes TEXT;
ALTER TABLE public.ibadah_daily_logs ADD COLUMN IF NOT EXISTS parent_review_status TEXT DEFAULT 'PENDING';
ALTER TABLE public.ibadah_daily_logs ADD COLUMN IF NOT EXISTS reward_stars_awarded INTEGER DEFAULT 0;

-- 8. TABEL: sholat_learning_progress (13 Rukun Gerakan Sholat)
CREATE TABLE IF NOT EXISTS public.sholat_learning_progress (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    step_code TEXT NOT NULL,
    step_order INTEGER NOT NULL DEFAULT 1,
    animation_practiced_count INTEGER DEFAULT 0,
    reading_memorized BOOLEAN DEFAULT false,
    quiz_high_score INTEGER DEFAULT 0,
    parent_verified_movement BOOLEAN DEFAULT false,
    parent_verified_reading BOOLEAN DEFAULT false,
    parent_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sholat_learning_progress ADD COLUMN IF NOT EXISTS animation_practiced_count INTEGER DEFAULT 0;
ALTER TABLE public.sholat_learning_progress ADD COLUMN IF NOT EXISTS reading_memorized BOOLEAN DEFAULT false;
ALTER TABLE public.sholat_learning_progress ADD COLUMN IF NOT EXISTS quiz_high_score INTEGER DEFAULT 0;
ALTER TABLE public.sholat_learning_progress ADD COLUMN IF NOT EXISTS parent_verified_movement BOOLEAN DEFAULT false;
ALTER TABLE public.sholat_learning_progress ADD COLUMN IF NOT EXISTS parent_verified_reading BOOLEAN DEFAULT false;
ALTER TABLE public.sholat_learning_progress ADD COLUMN IF NOT EXISTS parent_notes TEXT;

-- 9. TABEL: fsrs_memory_states (Algoritma FSRS-6 Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.fsrs_memory_states (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    track_type TEXT NOT NULL DEFAULT 'SABAQ',
    difficulty NUMERIC DEFAULT 4.0,
    stability NUMERIC DEFAULT 2.0,
    retrievability NUMERIC DEFAULT 1.0,
    last_review TIMESTAMPTZ,
    next_due TIMESTAMPTZ,
    error_anchors JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fsrs_memory_states ADD COLUMN IF NOT EXISTS difficulty NUMERIC DEFAULT 4.0;
ALTER TABLE public.fsrs_memory_states ADD COLUMN IF NOT EXISTS stability NUMERIC DEFAULT 2.0;
ALTER TABLE public.fsrs_memory_states ADD COLUMN IF NOT EXISTS retrievability NUMERIC DEFAULT 1.0;
ALTER TABLE public.fsrs_memory_states ADD COLUMN IF NOT EXISTS next_due TIMESTAMPTZ;

-- 10. TABEL: mutabaah_logs (Riwayat Setoran Resmi)
CREATE TABLE IF NOT EXISTS public.mutabaah_logs (
    id TEXT PRIMARY KEY,
    unit_id TEXT,
    curriculum_item_id TEXT,
    student_id TEXT NOT NULL,
    logged_by_role TEXT NOT NULL DEFAULT 'STUDENT',
    fsrs_rating INTEGER DEFAULT 3,
    asr_accuracy_score NUMERIC,
    parent_verified BOOLEAN DEFAULT false,
    official_mutabaah_status TEXT DEFAULT 'L',
    tajwid_makhraj_notes TEXT,
    parent_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mutabaah_logs ADD COLUMN IF NOT EXISTS official_mutabaah_status TEXT DEFAULT 'L';
ALTER TABLE public.mutabaah_logs ADD COLUMN IF NOT EXISTS fsrs_rating INTEGER DEFAULT 3;
ALTER TABLE public.mutabaah_logs ADD COLUMN IF NOT EXISTS parent_verified BOOLEAN DEFAULT false;
ALTER TABLE public.mutabaah_logs ADD COLUMN IF NOT EXISTS tajwid_makhraj_notes TEXT;

-- ==============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) & HAK AKSES
-- ==============================================================================
-- Mengaktifkan RLS pada seluruh 10 tabel
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ibadah_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sholat_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fsrs_memory_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutabaah_logs ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Mengizinkan akses penuh (SELECT, INSERT, UPDATE, DELETE)
-- bagi akun yang terautentikasi dan client anonim untuk sinkronisasi offline-first yang mulus.

DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'user_profiles',
        'academic_levels',
        'exam_cycles',
        'curriculum_items',
        'content_units',
        'murojaah_checklists',
        'ibadah_daily_logs',
        'sholat_learning_progress',
        'fsrs_memory_states',
        'mutabaah_logs'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Drop policy jika sudah ada sebelumnya agar tidak duplikat
        EXECUTE format('DROP POLICY IF EXISTS "Public and Auth Full Access on %I" ON public.%I', tbl, tbl);
        
        -- Buat policy baru yang mengizinkan semua operasi
        EXECUTE format('CREATE POLICY "Public and Auth Full Access on %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- Informasi Berhasil
SELECT 'Sukses! Seluruh 10 tabel Supabase telah dimigrasikan dan siap disinkronkan dengan MutabaahKu Dexie DB.' AS status;
