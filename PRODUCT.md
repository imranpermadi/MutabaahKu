# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18+ (Vite) + TypeScript + Tailwind CSS + Dexie.js (Offline-First PWA) + Framer Motion + Supabase (PostgreSQL & Auth Sync)

## Users

- **Siswa / Anak (Role: STUDENT)**: Anak usia sekolah dasar (Kelas 1–6) yang memiliki target hafalan Juz 30, doa harian, dan hadis sekolah untuk persiapan ujian (PTS, Mid, PAS), serta membutuhkan panduan visual yang menyenangkan untuk belajar sholat sesuai sunnah dan membiasakan ibadah harian.
- **Orang Tua / Wali (Role: PARENT)**: Orang tua yang mendampingi pendidikan Islam anak di rumah, mengelola akun anak, menentukan target kurikulum ujian, memantau riwayat ibadah harian, memberikan paraf digital (persetujuan), dan mencetak rapor mutaba'ah.

## Product Purpose

MutabaahKu adalah Progressive Web App (PWA) Offline-First yang hadir sebagai sahabat ceria anak sholih dalam menjaga hafalan Qur'an, hadis, dan doa, mempelajari tata cara sholat yang shahih sesuai Sunnah Nabi ﷺ, serta mencatat rutinitas ibadah harian melalui gamifikasi yang mendidik dan memotivasi tanpa melupakan adab Islam.

## Positioning

Aplikasi pendamping ibadah dan tahfidz anak pertama yang menggabungkan:
1. Kurikulum hafalan sekolah otomatis lintas kelas 1–6 tanpa pengetikan manual (*zero-manual-typing*).
2. Mesin pengulangan cerdas FSRS-6 (*Spaced Repetition*) dengan Ceklis Muroja'ah 3 Lapis dan Mode Ujian H-14.
3. Modul animasi interaktif tata cara sholat shahih sesuai rujukan kitab *Sifat Shalat Nabi ﷺ* karya Syaikh Muhammad Nashiruddin Al-Albani (dilengkapi *X-Ray 7 titik sujud* dan *zoom callout* duduk Iftirasy vs Tawarruk).
4. Jadwal sholat Kemenag se-Indonesia dan Kompas Kiblat Ceria (*DeviceOrientation* dengan azimuth *Great-Circle*).
5. Gamifikasi bermakna (*Kebun Pahala* Pohon Kurma tumbuh 5 tahap & Album Stiker) yang terikat langsung pada sistem paraf/verifikasi digital orang tua yang diamankan oleh database RLS.

## Operating Context

- Digunakan secara harian oleh anak di rumah atau sekolah pada perangkat ponsel pintar (*smartphone*), tablet, maupun laptop/PC.
- Beroperasi secara **Offline-First**: seluruh materi hafalan, animasi rukun sholat, dan pencatatan ibadah tersimpan di IndexedDB lokal (Dexie.js), sehingga anak tetap dapat muroja'ah meski tanpa sinyal internet.
- Tersedia antrean sinkronisasi (*sync queue*) dua arah yang otomatis mengunggah data lokal ke Supabase Cloud saat perangkat kembali terhubung online.

## Capabilities and Constraints

- **Dual-Role RBAC Portal**: Login terpisah untuk Orang Tua (`/parent/dashboard`) dan Anak (`/student/workspace`).
- **Modul Praktek Sholat Sunnah Salaf**: 13 rukun terperinci, audio pelafalan per kata, visual 2D faceless SVG beranimasi Framer Motion, mode Putra (peci & koko) dan Putri (mukena pastel), simulasi otomatis rakaat, dan mini-game tebak gerakan.
- **Jadwal Sholat & Kompas Kiblat**: API myQuran v3 Kemenag dengan pencarian kabupaten/kota, countdown azan dinamis, dan kompas animasi rotasi dengan respon haptik + konfeti saat mengarah ke Ka'bah (toleransi ±3°).
- **Kurikulum & Ingestion Otomatis**: Integrasi API EQuran.id v2 (Juz 30), EveryAyah (3 pilihan qari talaqqi), EQuran Doa + Hisnul Muslim audio, dan HadeethEnc v1 dengan *Smart Matan Highlighter*.
- **Ceklis 3 Lapis & FSRS-6**: Ceklis harian due, kisi-kisi ujian 5x ulang dengan nilai L (Lancar) / BL (Belum Lancar), serta matriks master Juz 30. Retensi ditargetkan 90% (naik otomatis ke 95% pada H-14 ujian).
- **Mutaba'ah Yaumiyah**: Pencatatan sholat wajib 5 waktu (berjamaah/munfarid/terlambat/uzur), sholat sunnah (dhuha, rawatib, qiyamul lail), dan puasa (Ramadhan, Senin-Kamis, Ayyamul Bidh).
- **Gamifikasi Kebun Pahala**: Poin Bintang Cahaya dan Tetes Air Berkah menumbuhkan Pohon Kurma dari benih hingga berbuah emas, serta membuka stiker bertema sejarah & adab Islam.
- **Batasan Keamanan**: Row-Level Security (RLS) PostgreSQL dan trigger database `enforce_parent_review_security` yang mencegah peran STUDENT memvalidasi setoran/ibadahnya sendiri.

## Brand Commitments

- **Identitas Nama**: MutabaahKu.
- **Estetika Visual**: *Warm, playful, and tactile* ala Duolingo Kids berpadu dengan nuansa Islami nusantara (sudut membulat `rounded-3xl`, tombol chunky 3D `border-b-4`, aksen warna hijau zamrud, langit cerah, pastel lavender, dan kuning emas).
- **Maskot Karakter**: Si Hafiz & Si Hafizah (karakter kartun anak muslim yang santun, ekspresif namun *faceless/minimalist chibi* sesuai adab visual syar'i).
- **Tipografi Arab**: Font Uthmani berharakat jelas dan proporsional (Amiri / Scheherazade New).

## Evidence on Hand

- Dokumen `PRD.docx` (Spesifikasi produk lengkap).
- Dokumen `Agent.docx` (Spesifikasi teknis, rumus perhitungan kiblat, teks dalil shahih, dan arsitektur frontend).
- Berkas `SQL Schema Supabase.md` (10 tabel terstruktur, RLS policies, trigger fungsi keamanan, dan konfigurasi endpoint Supabase).

## Product Principles

1. **Kemurnian Dalil & Kesahihan Sunnah**: Segala tuntunan gerakan dan bacaan sholat merujuk pada hadis-hadis shahih (*Sifat Shalat Nabi ﷺ*), mengajarkan tata cara ibadah yang benar sejak usia dini tanpa kompromi.
2. **Ceria & Memikat Tanpa Melanggar Adab**: Menghadirkan gamifikasi modern yang membuat anak betah berlama-lama belajar dan muroja'ah, dengan desain karakter yang mematuhi adab visual Islami.
3. **Tuntas, Otomatis, dan Terukur**: Mengeliminasi beban input manual guru/orang tua dengan penarikan otomatis ayat, matan hadis, dan doa, serta menjamin daya ingat hafalan anak menggunakan algoritma pengulangan ilmiah FSRS-6.
4. **Kolaborasi & Integritas Keluarga**: Menjadi jembatan komunikasi ibadah antara orang tua dan anak melalui alur paraf digital yang transparan dan terjaga integritas datanya.
5. **Andal & Offline-First**: Tidak bergantung penuh pada koneksi internet; anak dapat belajar dan muroja'ah di mana pun, kapan pun dengan sinkronisasi mulus saat kembali online.

## Accessibility & Inclusion

- Rasio kontras warna teks dan elemen UI memenuhi standar WCAG AA dengan aksen cerah yang nyaman di mata anak.
- Tipografi Arab berharakat besar (*large harakat*) untuk mencegah salah baca tajwid dan makhraj.
- Target sentuh tombol berukuran besar (*chunky touch targets* min 48x48px) ramah motorik jari anak pada gawai layar sentuh.
