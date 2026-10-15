# Surface Brief: Ruang Belajar Anak (Student Workspace)

## Scope & Target
- **Primary Target**: `src/App.tsx` (Student Workspace View)
- **Related Components**: `src/components/mascot/MascotCharacter.tsx`, `src/components/garden/PahalaGarden.tsx`, `src/components/prayer/SholatAnimator.tsx`, `src/components/prayer/PrayerTimesCard.tsx`, `src/components/prayer/QiblaCompass.tsx`, `src/components/murojaah/MurojaahChecklist.tsx`
- **Visitor Mode**: **Operate** (Anak menyelesaikan rutinitas ibadah, hafalan, dan merawat Kebun Pahala harian)

---

## 1. Job and Audience
- **Target Pengguna**: Siswa Sekolah Dasar (Kelas 1–6) yang belajar di rumah atau sekolah tahfidz dengan gawai pribadi (ponsel pintar/tablet portrait).
- **Kondisi Emosional & Kebutuhan**: Anak membutuhkan motivasi ceria yang tidak kaku, apresiasi visual instan atas usahanya beribadah, serta kejelasan panduan sholat dan hafalan tanpa merasa tertekan oleh ujian.

---

## 2. Outcome and Proof
- **Tugas Utama**: 
  1. Melihat sapaan maskot adaptif waktu sholat Kemenag.
  2. Menyiram Pohon Kurma virtual dengan poin tetes air yang terkumpul.
  3. Membuka modul belajar sholat (13 rukun shahih) atau melakukan 1x pengulangan muroja'ah kisi-kisi ujian.
  4. Mencatat pelaksanaan sholat fardhu dan puasa hari ini.
- **Ukuran Sukses**: Anak secara sukarela dan mandiri membuka aplikasi setiap hari tanpa harus dipaksa orang tua, memahami rukun sholat yang shahih, dan hafalan kisi-kisi ujian terlatih 5x ulang.
- **Kebenaran Unik Produk**: Tuntunan gerakan sholat shahih sesuai dalil *Sifat Shalat Nabi ﷺ* (lengkap dengan X-Ray 7 titik sujud), karakter faceless chibi yang menjaga adab visual syar'i, dan mekanisme retensi FSRS-6 terotomatisasi.

---

## 3. Selected Direction
- **Tesis Visual & Interaksi**: *Tactile Joyful Islamic Learning* — memadukan kenyamanan navigasi satu tangan (*thumb-zone*) dengan komponen 3D chunky tactile bergaya Duolingo Kids berbalut nuansa Islami nusantara (hijau zamrud, kuning emas, langit cerah).
- **Urutan Ritme Pandang (Visual Hierarchy)**:
  1. *Top Bar Ringkas*: Indikator online/offline, streak api harian, saldo bintang dan tetes air.
  2. *Balon Percakapan Maskot*: Si Hafiz / Si Hafizah menyapa hangat berdasarkan waktu nyata (misal: "Wah, sebentar lagi waktu Ashar di Kota Medan!").
  3. *Hero Widget Kebun Pahala*: Visual interaktif Pohon Kurma (Level 1–5) dengan tombol siram dan akses Album Stiker.
  4. *Tab Ceria Horizontal*: Tombol berukuran besar untuk berganti modul (Belajar Sholat, Jadwal & Kiblat, Muroja'ah Ujian, Mutaba'ah Yaumiyah).
  5. *Kartu Konten Dinamis*: Area interaktif utama tempat anak beraksi.

---

## 4. Scope and Boundaries
- **In-Scope**:
  - Tampilan satu kolom portrait yang responsif dan fleksibel pada smartphone (360px–430px) hingga tablet.
  - Micro-interactions: animasi pantul (*spring bouncy*), efek konfeti saat menyiram pohon / lulus hafalan, dan getaran haptik saat tepat mengarah ke Ka'bah.
- **Anti-Goals**:
  - Tidak menampilkan tabel data analitik yang padat atau formulir rumit di hadapan anak.
  - Tidak menggambar wajah makhluk bernyawa secara realistis dengan mata/hidung detail (patuh pada adab visual faceless/chibi).
  - Tidak mengizinkan anak memaraf atau meluluskan setoran ujiannya sendiri tanpa verifikasi akun orang tua.

---

## 5. States and Ranges
- **Kondisi Pemula (First-Run)**: Pohon Kurma fase Benih (Level 1), streak 1 hari, sapaan hangat perkenalan, stiker bintang selamat datang.
- **Kondisi Harian Aktif**: Pohon Tunas/Muda (Level 2–3), streak bertambah, progres kisi-kisi ujian berjalan 1–3x ulang.
- **Kondisi Sempurna (Mastery)**: Pohon Kurma Emas (Level 5), stiker lengkap terbuka, seluruh sholat 5 waktu telah diparaf orang tua.

---

## 6. Interaction and Layout
- **Responsivitas**: Mobile-First Portrait dengan fluid padding dan kontainer terpusat maksimal `max-w-md` hingga `max-w-2xl`.
- **Target Sentuh**: Semua tombol utama menggunakan ukuran chunky minimal tinggi 48px dengan feedback visual aktif (`active:translate-y-1` dan `active:border-b-0`).
- **Aksesibilitas**: Tipografi Arab Uthmani (Amiri) berharakat besar (*large harakat*) dengan rasio kontras teks WCAG AA.

---

## 7. Constraints and Open Decisions
- **Teknologi**: React 18, Vite, TypeScript, Tailwind CSS, Dexie.js (Offline-First IndexedDB), Framer Motion.
- **Offline Reliability**: Tetap dapat diakses dan digunakan sepenuhnya saat perangkat offline tanpa internet.
