-- ============================================================================
-- MUTABAAHKU v3.0 - FULL SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Project URL: https://qedenyqmbnuidtgivxwe.supabase.co
-- GitHub Repo: https://github.com/imranpermadi/MutabaahKu.git
-- Live App:    https://mutabaahku-dun.vercel.app/
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PROFIL PENGGUNA (LOGIN TERPISAH ORANG TUA vs ANAK + KOTA SHOLAT & GAMIFIKASI)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PARENT', 'STUDENT')),
    gender TEXT DEFAULT 'PUTRA' CHECK (gender IN ('PUTRA', 'PUTRI')), -- Menentukan animasi karakter koko/peci vs mukena
    avatar_url TEXT,
    
    -- Relasi Keluarga (Khusus role = 'STUDENT')
    parent_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    school_name TEXT,
    current_grade INT CHECK (current_grade BETWEEN 1 AND 6),
    
    -- Pengaturan Kota Jadwal Sholat (API myQuran v3 Kemenag) & Koordinat Kiblat
    prayer_city_id TEXT DEFAULT '58a2fc6ed39fd083f55d4182bf88826d', -- Default Kota Medan / Jakarta
    prayer_city_name TEXT DEFAULT 'KOTA MEDAN',
    latitude FLOAT DEFAULT 3.5952,
    longitude FLOAT DEFAULT 98.6722,
    qibla_bearing FLOAT DEFAULT 292.8,
    
    -- Atribut Gamifikasi Lucu untuk Anak
    daily_streak INT DEFAULT 0,
    star_points INT DEFAULT 0,
    water_drops INT DEFAULT 0,
    garden_tree_level INT DEFAULT 1,
    unlocked_stickers JSONB DEFAULT '["sticker_welcome_star"]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fungsi Helper Role Login
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. TABEL TINGKAT KELAS AKADEMIK (KELAS 1 - 6)
CREATE TABLE IF NOT EXISTS public.academic_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 6),
    academic_year TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL SIKLUS UJIAN (PTS, PERTENGAHAN, PAS)
CREATE TABLE IF NOT EXISTS public.exam_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID NOT NULL REFERENCES public.academic_levels(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('PTS_1', 'MID_1', 'PAS_1', 'PTS_2', 'MID_2', 'PAS_2')),
    exam_title TEXT NOT NULL,
    exam_date DATE,
    target_retention FLOAT DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL ITEM KURIKULUM HAFALAN (QURAN, HADIS, DOA, & BACAAN SHOLAT SUNNAH)
CREATE TABLE IF NOT EXISTS public.curriculum_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_cycle_id UUID NOT NULL REFERENCES public.exam_cycles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('QURAN', 'HADITH', 'DOA', 'SHOLAT_SUNNAH_SALAF')),
    title TEXT NOT NULL,
    external_ref_id TEXT,
    verse_range JSONB,
    is_mastered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL UNIT KONTEN OTOMATIS (PER AYAT / KALIMAT HADIS / DOA / RUKUN SHOLAT)
CREATE TABLE IF NOT EXISTS public.content_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curriculum_item_id UUID NOT NULL REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
    sequence_num INT NOT NULL,
    arabic_uthmani TEXT NOT NULL,
    arabic_normalized TEXT NOT NULL,
    latin_text TEXT,
    translation_id TEXT,
    dalil_source TEXT, -- Contoh: "HR. Bukhari no. 744 & Muslim no. 598 (Sifat Shalat Nabi)"
    audio_urls JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL CEKLIS MUROJA'AH & VERIFIKASI ORANG TUA
CREATE TABLE IF NOT EXISTS public.murojaah_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    curriculum_item_id UUID NOT NULL REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
    exam_cycle_id UUID NOT NULL REFERENCES public.exam_cycles(id) ON DELETE CASCADE,
    target_pass_count INT DEFAULT 5,
    completed_pass_count INT DEFAULT 0,
    child_self_claim BOOLEAN DEFAULT FALSE,
    parent_review_status TEXT DEFAULT 'PENDING' CHECK (parent_review_status IN ('PENDING', 'APPROVED', 'NEEDS_PRACTICE')),
    mutabaah_grade TEXT DEFAULT 'BL' CHECK (mutabaah_grade IN ('L', 'BL')),
    parent_notes TEXT,
    reviewed_by UUID REFERENCES public.user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL STATE MEMORI FSRS-6
CREATE TABLE IF NOT EXISTS public.fsrs_memory_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES public.content_units(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    track_type TEXT DEFAULT 'SABAQ' CHECK (track_type IN ('SABAQ', 'SABQI', 'MANZIL')),
    difficulty FLOAT DEFAULT 5.0,
    stability FLOAT DEFAULT 1.0,
    retrievability FLOAT DEFAULT 1.0,
    last_review TIMESTAMPTZ,
    next_due TIMESTAMPTZ DEFAULT NOW(),
    error_anchors JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABEL LOG SETORAN & LATIHAN HAFALAN
CREATE TABLE IF NOT EXISTS public.mutabaah_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID REFERENCES public.content_units(id) ON DELETE CASCADE,
    curriculum_item_id UUID REFERENCES public.curriculum_items(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    logged_by_role TEXT NOT NULL CHECK (logged_by_role IN ('STUDENT', 'PARENT')),
    fsrs_rating INT CHECK (fsrs_rating BETWEEN 1 AND 4),
    asr_accuracy_score FLOAT,
    parent_verified BOOLEAN DEFAULT FALSE,
    official_mutabaah_status TEXT CHECK (official_mutabaah_status IN ('L', 'BL')),
    tajwid_makhraj_notes TEXT,
    parent_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABEL PENCATATAN SHOLAT & PUASA HARIAN (MUTABA'AH YAUMIYAH)
CREATE TABLE IF NOT EXISTS public.ibadah_daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Sholat Wajib 5 Waktu ('BERJAMAAH', 'MUNFARID_TEPAT', 'TERLAMBAT', 'TIDAK_SHOLAT', 'UZUR')
    sholat_subuh TEXT DEFAULT 'TIDAK_SHOLAT',
    sholat_dzuhur TEXT DEFAULT 'TIDAK_SHOLAT',
    sholat_ashar TEXT DEFAULT 'TIDAK_SHOLAT',
    sholat_maghrib TEXT DEFAULT 'TIDAK_SHOLAT',
    sholat_isya TEXT DEFAULT 'TIDAK_SHOLAT',
    
    -- Dzikir Ba'da Sholat & Sholat Sunnah
    dzikir_bada_sholat_count INT DEFAULT 0,
    sholat_dhuha_rakaat INT DEFAULT 0,
    sholat_rawatib_count INT DEFAULT 0,
    sholat_qiyamul_lail BOOLEAN DEFAULT FALSE,
    
    -- Puasa (Shaum)
    puasa_type TEXT DEFAULT 'TIDAK_PUASA' CHECK (puasa_type IN ('TIDAK_PUASA', 'RAMADHAN', 'SENIN_KAMIS', 'AYYAMUL_BIDH', 'SUNNAH_LAINNYA')),
    puasa_completion TEXT DEFAULT 'NONE' CHECK (puasa_completion IN ('NONE', 'PENUH_MAGHRIB', 'LATIHAN_SETENGAH_HARI')),
    
    -- Review & Paraf Orang Tua
    child_notes TEXT,
    parent_review_status TEXT DEFAULT 'PENDING' CHECK (parent_review_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    parent_reviewer_id UUID REFERENCES public.user_profiles(id),
    parent_review_notes TEXT,
    reward_stars_awarded INT DEFAULT 0,
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, log_date)
);

-- 10. TABEL BARU: PROGRES BELAJAR & PRAKTEK SHOLAT SESUAI SUNNAH SALAF
CREATE TABLE IF NOT EXISTS public.sholat_learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    step_code TEXT NOT NULL, -- Contoh: 'TAKBIRATUL_IHRAM', 'DOA_ISTIFTAH', 'RUKU', 'ITIDAL', 'SUJUD_7_ANGGOTA', 'IFTIROSY', 'TAWARRUK', 'DOA_SEBELUM_SALAM'
    step_order INT NOT NULL,
    animation_practiced_count INT DEFAULT 0,
    reading_memorized BOOLEAN DEFAULT FALSE,
    quiz_high_score INT DEFAULT 0,
    parent_verified_movement BOOLEAN DEFAULT FALSE,
    parent_verified_reading BOOLEAN DEFAULT FALSE,
    parent_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, step_code)
);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murojaah_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fsrs_memory_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutabaah_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ibadah_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sholat_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile access for self or linked parent"
ON public.user_profiles FOR ALL
USING (id = auth.uid() OR parent_id = auth.uid())
WITH CHECK (id = auth.uid() OR parent_id = auth.uid());

CREATE POLICY "Sholat learning progress access for student or linked parent"
ON public.sholat_learning_progress FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = sholat_learning_progress.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Ibadah daily logs access for student or linked parent"
ON public.ibadah_daily_logs FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = ibadah_daily_logs.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Checklists access for student or linked parent"
ON public.murojaah_checklists FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = murojaah_checklists.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Academic levels access for student or linked parent"
ON public.academic_levels FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = academic_levels.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Exam cycles access for student or linked parent"
ON public.exam_cycles FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = exam_cycles.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Curriculum items access for student or linked parent"
ON public.curriculum_items FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = curriculum_items.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Content units access for student or linked parent"
ON public.content_units FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.curriculum_items ci
        LEFT JOIN public.user_profiles sp ON sp.id = ci.student_id
        WHERE ci.id = content_units.curriculum_item_id
        AND (ci.student_id = auth.uid() OR sp.parent_id = auth.uid())
    )
);

CREATE POLICY "FSRS states access for student or linked parent"
ON public.fsrs_memory_states FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = fsrs_memory_states.student_id AND sp.parent_id = auth.uid())
);

CREATE POLICY "Mutabaah logs access for student or linked parent"
ON public.mutabaah_logs FOR ALL
USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles sp WHERE sp.id = mutabaah_logs.student_id AND sp.parent_id = auth.uid())
);

-- Trigger Keamanan: Mencegah akun STUDENT menyetujui sendiri status review orang tua
CREATE OR REPLACE FUNCTION public.enforce_parent_review_security()
RETURNS TRIGGER AS $$
BEGIN
    IF public.get_my_role() = 'STUDENT' THEN
        IF TG_OP = 'INSERT' THEN
            NEW.parent_review_status := 'PENDING';
            NEW.reviewed_at := NULL;
        ELSIF TG_OP = 'UPDATE' THEN
            NEW.parent_review_status := OLD.parent_review_status;
            NEW.reviewed_at := OLD.reviewed_at;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_ibadah_review ON public.ibadah_daily_logs;
CREATE TRIGGER trg_protect_ibadah_review
BEFORE INSERT OR UPDATE ON public.ibadah_daily_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_parent_review_security();

DROP TRIGGER IF EXISTS trg_protect_checklist_review ON public.murojaah_checklists;
CREATE TRIGGER trg_protect_checklist_review
BEFORE INSERT OR UPDATE ON public.murojaah_checklists
FOR EACH ROW EXECUTE FUNCTION public.enforce_parent_review_security();