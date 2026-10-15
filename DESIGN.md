---
name: MutabaahKu
description: Sahabat Ceria Hafalan & Ibadah Anak Sholih (Tactile Joyful Islamic Design System)
colors:
  primary: "#059669"
  primary-dark: "#065F46"
  primary-light: "#34D399"
  accent-sky: "#0284C7"
  accent-sky-light: "#38BDF8"
  accent-amber: "#F59E0B"
  accent-amber-light: "#FBBF24"
  accent-lavender: "#8B5CF6"
  neutral-bg: "#F0FDF4"
  surface-card: "#FFFFFF"
  surface-muted: "#F8FAFC"
  text-heading: "#022C22"
  text-body: "#1E293B"
  text-muted: "#64748B"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Quicksand, Nunito, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  arabic:
    fontFamily: "Amiri, Scheherazade New, Traditional Arabic, serif"
    fontSize: "clamp(1.5rem, 5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 2.2
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans, Quicksand, Nunito, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  "3xl": "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-chunky-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.2xl}"
    padding: "14px 24px"
  button-tab-active:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
  card-primary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.3xl}"
    padding: "24px"
---

## Overview

MutabaahKu memadukan estetika *tactile & joyful* ala Duolingo Kids dengan kehangatan nuansa Islami Nusantara. Dirancang khusus untuk anak-anak usia Sekolah Dasar (Kelas 1–6 SDIT) dan orang tua mereka, sistem visual mengedepankan:
- Rasa pencapaian positif melalui tombol chunky 3D yang mantap disentuh jari anak.
- Ketaatan mutlak pada adab syar'i: Maskot Si Hafiz & Si Hafizah berwujud kartun minimalis *faceless chibi* tanpa penggambaran mata/hidung realistis.
- Tuntunan ibadah dan gerakan sholat yang merujuk pada dalil shahih *Sifat Shalat Nabi ﷺ* (Syaikh Muhammad Nashiruddin Al-Albani).

## Colors

Palet warna didesain cerah, kontras, dan menyenangkan tanpa menyilaukan mata anak:

- **Emerald Zamrud (`#059669`)**: Warna dominan penanda ibadah, ketenangan, dan kesegaran alam. Digunakan pada header, tombol utama, dan indikator kelulusan hafalan.
- **Sky Blue (`#0284C7`)**: Melambangkan tetes air wudhu berkah dan kesegaran air siraman kebun kurma.
- **Amber Gold (`#F59E0B`)**: Warna bintang pahala, streak api harian, dan buah kurma emas.
- **Lavender Soft (`#8B5CF6`)**: Aksen pendukung kartu muroja'ah dan nuansa mukena santun.
- **Mint Canvas (`#F0FDF4`)**: Latar belakang lembut yang nyaman untuk dipandang berjam-jam saat muroja'ah.

## Typography

Sistem tipografi bilingual (Latin & Arab) memenuhi rasio keterbacaan tinggi:

- **Bahasa Indonesia / Navigasi**: `Plus Jakarta Sans` / `Quicksand` dengan bobot `font-black` (900) untuk judul ceria dan `font-semibold` (600) untuk label instruksi.
- **Teks Arab Uthmani**: Font `Amiri` berharakat lengkap dengan *large line-height* (`leading-[2.2]`) agar tanda waqaf, harakat sukun, fathah, tasydid, dan makhraj tampak jelas dan mencegah kesalahan tajwid anak.
- **Teks Latin Transliterasi**: Ditampilkan di bawah matan Arab dengan gaya miring elegan untuk membimbing pelafalan anak kelas pemula.

## Layout

- **Mobile-First Portrait Thumb Zone**: Kontainer utama berpusat pada lebar `max-w-md` hingga `max-w-xl` di ponsel, dengan penempatan tombol interaksi ramah jangkauan satu jempol anak.
- **Adaptive Split Layout**: Pada layar tablet atau laptop, antarmuka otomatis membagi tampilan Studio Sholat dan Dashboard Orang Tua menjadi multi-kolom yang proporsional.
- **Fluid Margin & Padding**: Ruang vertikal antar modul dijaga lega (`gap-4` hingga `gap-6`) untuk mencegah kelelahan kognitif (*cognitive overload*).

## Elevation & Depth

- **Tactile Chunky 3D**: Menggunakan efek bevel bayangan solid bawah (`border-b-4 border-emerald-800` atau `shadow-chunky-emerald: 0 5px 0 0 #047857`). Saat tombol ditekan (*active state*), elemen bergeser ke bawah (`active:translate-y-1 active:border-b-0`), memberikan feedback fisik kepuasan interaksi.
- **Soft Floating Card**: Kartu konten menggunakan `rounded-3xl`, latar putih susu, dan batas halus `border-2 border-emerald-500/10` tanpa bayangan buram gelap yang kotor.

## Shapes

- **Super-Rounded Curves**: Sudut membulat besar `rounded-2xl` (20px) dan `rounded-3xl` (28px) pada seluruh kartu, wadah materi, dan modal dialog, menghadirkan rasa aman dan ramah anak.
- **Chip & Pill Badges**: Tag tingkatan kelas (Kelas 1–6 SD), kategori materi (QURAN, HADITH, DOA), dan status paraf menggunakan `rounded-full` dengan padding seimbang.

## Components

1. **Top Application Bar**: Memuat saldo Bintang, Tetes Air, Streak Api, tombol ganti peran Ruang Anak vs Orang Tua, dan tombol Sync Cloud.
2. **Karakter Maskot Chibi**: Komponen SVG Si Hafiz / Si Hafizah (peci & koko vs mukena) dengan balon sapaan waktu sholat Kemenag dinamis.
3. **Hero Kebun Pahala**: Visual Pohon Kurma 5 tingkat evolusi (Benih &rarr; Tunas &rarr; Pohon Muda &rarr; Berbuah Lebat &rarr; Pohon Kurma Emas).
4. **Studio Sholat Sunnah Salaf**: Viewer 13 rukun sholat dengan X-Ray 7 titik sujud, callout Iftirasy vs Tawarruk, pemilih varian bacaan, dan audio talaqqi.
5. **Ceklis Muroja'ah Ujian FSRS-6**: Filter Kelas 1–6 SDIT, tombol tambah materi kustom, kartu blind recall, dan counter mutqin 5x ulang.
6. **Modal Sinkronisasi 10 Tabel & Google SSO**: Matriks sinkronisasi IndexedDB vs Supabase Cloud dua arah.

## Do's and Don'ts

### Do's:
- Gunakan bahasa yang santun, hangat, dan memotivasi (contoh: *"MasyaAllah, Hafalanmu Semakin Lancar!"*).
- Jaga kontras teks dengan standar WCAG AA (teks gelap di atas kartu terang).
- Berikan feedback audio atau haptik visual instan saat anak berhasil menyelesaikan latihan hafalan atau menyiram pohon.
- Pertahankan rujukan dalil shahih pada setiap rukun sholat dan bacaan varian.

### Don'ts:
- Jangan menggambar mata, hidung, atau mulut secara realistis pada karakter maskot (wajib mematuhi adab visual faceless chibi).
- Jangan gunakan bayangan hitam keras atau efek glow neon yang merusak estetika islami yang tenang.
- Jangan izinkan akun anak memaraf mandiri ujian atau mutaba'ah hariannya (harus melalui verifikasi akun orang tua).
- Jangan membuat alur yang mengharuskan koneksi internet terus-menerus; seluruh materi harus dapat dibuka secara offline di IndexedDB.
