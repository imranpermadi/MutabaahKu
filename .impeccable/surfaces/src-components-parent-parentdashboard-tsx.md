# Surface Brief: Dashboard & Portal Orang Tua (Parent Dashboard)

## Scope & Target
- **Primary Target**: `src/components/parent/ParentDashboard.tsx`
- **Related Files**: `src/lib/db.ts`, `src/types/database.ts`, `src/App.tsx`
- **Visitor Mode**: **Operate** (Orang tua memantau perkembangan hafalan, memverifikasi setoran secara cepat, mengelola kurikulum, dan mengekspor laporan rapor)

---

## 1. Job and Audience
- **Target Pengguna**: Orang tua / wali murid siswa SDIT (Role: `PARENT`).
- **Konteks & Kebutuhan**: Orang tua yang memiliki kesibukan dan waktu terbatas membutuhkan sarana yang cepat, terpercaya, dan bebas hambatan untuk:
  1. Meninjau setoran hafalan Qur'an, Hadis, dan Doa anak.
  2. Memberikan paraf resmi kelancaran (*Lancar [L]* / *Belum Lancar [BL]*) dalam beberapa detik disertai arahan tajwid/makhraj.
  3. Memantau daya ingat santri melalui **Kartu Kendali Digital Terintegrasi** (algoritma FSRS-6) agar siap menghadapi ujian semester sekolah (PTS/PAS).
- **Keadaan Emosional**: Mengutamakan efisiensi, ketenangan, kejelasan data, dan kebanggaan atas progres ibadah sang anak.

---

## 2. Outcome and Proof
- **Tugas Utama**:
  1. Memeriksa antrean setoran hafalan anak (status `PENDING`).
  2. Mengeksekusi paraf 1-klik (*Paraf Lancar [L]* atau *Latihan Lagi [BL]*) dengan kolom catatan edukatif.
  3. Memvalidasi ceklis sholat 5 waktu & puasa anak untuk menyalurkan reward Bintang Pahala ke Kebun Virtual anak.
  4. Membaca **Kartu Kendali Digital**: grafik retensi memori FSRS-6, peringatan mode H-14 ujian, dan daftar materi yang jatuh tempo (*due for review*).
  5. Mencetak **Buku Rapor Mutaba'ah Resmi (PDF)** untuk diserahkan ke guru sekolah.
- **Ukuran Sukses**: Orang tua dapat menuntaskan seluruh proses review dan paraf harian anak dalam waktu kurang dari 2 menit.
- **Kebenaran Unik Produk**: Keamanan terproteksi Row-Level Security (RLS) dan trigger database PostgreSQL yang menjamin keabsahan paraf digital (anak tidak dapat menyetujui setorannya sendiri).

---

## 3. Selected Direction
- **Tesis Visual & Interaksi**: *High-Trust Efficiency & Calm Clarity* — kontras dengan dunia anak yang meriah, dashboard orang tua dirancang tenang, elegan, dan bersih dengan dominasi hijau zamrud tua (#065F46), aksen emas formal, tipografi tegap yang mudah dibaca cepat (*scannable*), dan alur 1-klik yang minim gesekan.
- **Urutan Ritme Pandang**:
  1. *Header Profil & Ringkasan Santri*: Nama anak, kelas SDIT, sekolah, dan status streak ibadah.
  2. *Kartu Kendali Digital Terintegrasi (FSRS-6 Retention Pulse)*: Persentase daya ingat memori hafalan, jumlah materi yang mutqin, dan rekomendasi hafalan yang butuh muroja'ah mendesak.
  3. *Antrean Paraf Cepat 1-Klik*: Daftar setoran hafalan Qur'an/Hadis/Doa yang menunggu paraf, lengkap dengan input catatan makhraj cepat.
  4. *Paraf Mutaba'ah Yaumiyah*: Ringkasan sholat 5 waktu dan puasa anak hari ini dengan tombol 1-klik persetujuan + reward bintang.
  5. *Pusat Laporan & Ekspor*: Tombol unduh PDF Rapor Mutaba'ah resmi standar sekolah.

---

## 4. Scope and Boundaries
- **In-Scope**:
  - Antrean paraf digital hafalan dan ibadah harian.
  - Kartu kendali digital retensi FSRS-6 dengan indikator prioritas muroja'ah.
  - Kolom feedback catatan orang tua per materi.
  - Penyaluran otomatis Bintang Cahaya & Tetes Air ke akun anak setelah paraf disetujui.
  - Generator PDF rapor resmi mutaba'ah (jsPDF & autotable).
- **Anti-Goals**:
  - Tidak membebani orang tua dengan grafik kompleks yang membingungkan atau alur formulir yang berbelit-belit.
  - Tidak menampilkan elemen gamifikasi bermain gim di dashboard orang tua agar fokus pada pendampingan dan evaluasi.

---

## 5. States and Ranges
- **Antrean Kosong**: Keadaan tenang dengan ilustrasi santun dan pesan "Semua setoran hafalan anak telah diparaf hari ini".
- **Antrean Aktif**: Kartu setoran berlatar amber lembut dengan tombol aksi kontras tinggi (*Lancar vs Belum Lancar*).
- **Mode Ujian H-14 Aktif**: Banner notifikasi khusus saat tanggal ujian sekolah berjarak kurang dari 14 hari dengan kenaikan target retensi FSRS ke 95%.

---

## 6. Interaction and Layout
- **Responsivitas**: Desain adaptif yang nyaman diakses lewat smartphone orang tua saat di luar rumah maupun di layar laptop saat ingin mencetak rapor.
- **Feedback Interaksi**: Konfeti lembut saat paraf selesai dan pesan konfirmasi instan.

---

## 7. Constraints
- **Integritas RLS**: Mematuhi fungsi keamanan `enforce_parent_review_security`.
- **Offline Sync**: Paraf yang dilakukan saat offline dicatat ke `sync_queue` dan diunggah ke Supabase begitu perangkat online.
