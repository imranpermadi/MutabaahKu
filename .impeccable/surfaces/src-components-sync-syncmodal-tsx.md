# Surface Brief: Modal Sinkronisasi Cloud & Multi-Device Google SSO

## Scope & Target
- **Primary Target**: `src/components/sync/SyncModal.tsx`
- **Related Files**: `src/lib/supabase.ts`, `src/lib/db.ts`, `src/App.tsx`, `src/types/database.ts`
- **Visitor Mode**: **Operate** (Pengguna menyinkronkan data hafalan, ibadah, dan progres sholat lintas perangkat via Google SSO)

---

## 1. Job and Audience
- **Target Pengguna**: 
  1. Orang tua dan anak yang berpindah perangkat (misal: dari tablet belajar di rumah ke smartphone orang tua saat bepergian).
  2. Pengguna yang belajar offline tanpa internet, lalu ingin mengunggah seluruh capaian ibadah dan hafalan ke cloud saat kembali online.
- **Kebutuhan Emosional & Kepastian**: Pengguna membutuhkan ketenangan batin (*peace of mind*) bahwa tidak ada satu pun ayat, hadis kustom, bintang pahala, atau paraf orang tua yang hilang (*zero data loss*) saat berganti perangkat.

---

## 2. Outcome and Proof
- **Tugas Utama**:
  1. Melakukan autentikasi instan melalui Google SSO (1-klik login dengan akun Google).
  2. Menjalankan sinkronisasi dua arah (*Two-Way Push & Pull*) untuk 10 tabel database dengan menekan tombol **"Sinkronkan Sekarang"**.
  3. Memeriksa status kesehatan data 10 tabel secara transparan (Lokal vs Cloud).
  4. Menampilkan indikator waktu sinkronisasi terakhir (*Last Synced Timestamp*).
- **Ukuran Sukses**: 
  - Saat berpindah ke perangkat baru dan login dengan email Google yang sama, data langsung tertarik (*pulled*) 100% ke IndexedDB lokal tanpa jeda dan tanpa data yang tertinggal.
  - Perubahan offline diunggah rapi tanpa konflik data.
- **Kebenaran Unik Produk**: Struktur 10 tabel IndexedDB lokal identik 1:1 dengan PostgreSQL Supabase Cloud, didukung oleh Google SSO email identity dan Row-Level Security (RLS).

---

## 3. Selected Direction
- **Tesis Visual & Interaksi**: *Trustworthy Tactile Cloud Sync* — memadukan rasa aman sistem penyimpanan awan tingkat enterprise dengan estetika ramah anak (aksen hijau zamrud, kartu chunky putih bersudut `rounded-3xl`, status chip cerah, dan animasi spinner halus).
- **Urutan Ritme Pandang (Visual Hierarchy)**:
  1. *Header Modal*: Ikon awan ceria dengan status konektivitas internet (Online / Offline).
  2. *Status Akun Google SSO*: Kartu profil pengguna (foto avatar, nama, email terdaftar) atau tombol besar `Lanjutkan dengan Google` jika belum login.
  3. *Tombol Aksi Utama (Hero CTA)*: Tombol chunky `Sinkronkan Sekarang` (`border-b-4 border-emerald-700 bg-emerald-600 text-white font-black text-lg py-3.5`).
  4. *Matriks Kesehatan 10 Tabel*: Grid ringkas visual status 10 tabel Supabase (Hafalan, Mutaba'ah, Sholat, Kurikulum, FSRS-6, dll.) dengan badge checklist hijau `Tersinkron`.
  5. *Jaminan Keamanan*: Kotak edukasi ramah bertema adab amanah digital.

---

## 4. Scope and Boundaries
- **In-Scope**:
  - Dukungan Google OAuth SSO via Supabase Auth API.
  - Push otomatis item antrean lokal (`sync_queue`) ke Supabase Cloud.
  - Pull komprehensif 10 tabel dari Supabase Cloud ke Dexie.js lokal saat login di perangkat baru.
  - Indikator visual interaktif saat sinkronisasi berlangsung (animasi rotasi dan progress status).
  - Penanganan kondisi offline dengan pesan informatif dan tombol tetap ramah disentuh.
- **Anti-Goals**:
  - Tidak membebani anak dengan pesan galat teknis seperti `HTTP 500` atau `SQL Foreign Key Error`; semua disederhanakan dengan bahasa yang santun dan jelas.
  - Tidak menghapus data lokal jika koneksi terputus tiba-tiba (prinsip *idempotent upsert*).

---

## 5. States and Ranges
- **Kondisi Belum Login (Guest / Local-Only)**: Muncul notifikasi "Data saat ini hanya tersimpan di perangkat ini. Masuk dengan Google agar data otomatis tersimpan di Cloud dan bisa dibuka di HP lain."
- **Kondisi Terhubung (Authenticated)**: Terpampang email pengguna, tombol `Sinkronkan Sekarang` siap ditekan, status tabel `10/10 Siap`.
- **Kondisi Sedang Sinkronisasi (Syncing)**: Tombol berubah menjadi mode loading berputar dengan teks "Mengunggah data... Menarik data terbaru...".
- **Kondisi Berhasil (Success)**: Muncul toast hijau ceria dengan suara mikro/animasi centang "Alhamdulillah, Seluruh Data Berhasil Disinkronkan!".
- **Kondisi Offline (Offline Mode)**: Tombol non-aktif lembut dengan keterangan "Perangkat sedang offline. Catatan ibadah Anda tetap tersimpan aman di sini."

---

## 6. Interaction and Layout
- **Modal Dialog**: Centered modal responsive (`max-w-lg w-full`), backdrop blur `backdrop-blur-sm bg-black/40`, animasi masuk lembut (`scale-95 to scale-100`).
- **Sentuhan & Aksesibilitas**: Ukuran target sentuh min 48px, rasio kontras teks memenuhi WCAG AA, tombol keyboard `Esc` dan klik backdrop untuk menutup.
