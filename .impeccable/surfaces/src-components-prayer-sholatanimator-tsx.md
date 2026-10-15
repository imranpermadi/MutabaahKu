# Surface Brief: Studio Belajar Sholat Sunnah Salaf (<SholatAnimator />)

## Scope & Target
- **Primary Target**: `src/components/prayer/SholatAnimator.tsx`
- **Related Files**: `src/data/sholatSteps.ts`, `src/types/database.ts`, `src/App.tsx`
- **Visitor Mode**: **Operate & Experience** (Anak mempelajari, mendengarkan, mempraktikkan gerakan sholat shahih di atas sajadah, dan menguji pemahaman melalui simulasi & kuis)

---

## 1. Job and Audience
- **Target Pengguna**: Siswa Sekolah Dasar (Kelas 1–6 SD/SDIT) dan orang tua/guru tahfidz yang mendampingi.
- **Konteks & Kebutuhan**: Anak sedang belajar gerakan sholat di rumah atau sekolah. Anak sering kesulitan membedakan duduk Iftirasy vs Tawarruk, lupa posisi 7 anggota tubuh saat sujud, atau belum lancar melafalkan doa istiftah dan tasyahud secara tartil.
- **Keadaan Emosional**: Anak ingin belajar sholat dengan visual interaktif yang tidak membosankan dan menyenangkan seperti bermain gim edukasi.

---

## 2. Outcome and Proof
- **Tugas Utama**:
  1. Menyimak animasi visual rukun sholat 1 s.d. 13 secara bertahap.
  2. Mempelajari posisi anatomi gerakan sholat shahih via **X-Ray 7 Titik Sujud** dan **Zoom Callout** perbedaan kaki Iftirasy vs Tawarruk.
  3. Mendengarkan pelafalan audio doa/bacaan sholat kata per kata.
  4. Menjalankan **Simulasi Auto-Play Sholat** (alur 2, 3, atau 4 rakaat) sebagai panduan saat sholat nyata.
  5. Menguji penguasaan rukun sholat melalui mini-game kuis interaktif.
- **Ukuran Sukses**: Anak hafal bacaan dan mampu mempraktikkan gerakan sholat yang thuma'ninah dan shahih sesuai tuntunan Nabi ﷺ.
- **Kebenaran Unik Produk**: Seluruh gerakan dan bacaan berpegang teguh pada dalil-dalil hadis shahih dalam kitab *Sifat Shalat Nabi ﷺ* karya Syaikh Muhammad Nashiruddin Al-Albani.

---

## 3. Selected Direction
- **Tesis Visual & Interaksi**: *Interactive Posture Guide with X-Ray Focus* — sajadah interaktif dengan karakter faceless chibi (Putra: koko/peci, Putri: mukena) yang bermutasi halus dengan Framer Motion, dilengkapi titik fokus bersinar pada anggota tubuh sunnah.
- **Urutan Ritme Pandang**:
  1. *Header Rukun*: Nomor langkah (1 s.d. 13), nama rukun dalam bahasa Indonesia dan Arab, serta tombol "Simulasi Auto-Play".
  2. *Panggung Karakter SVG*: Ilustrasi animasi gerakan (Berdiri, Takbir, Bersedekap dada, Ruku' 90°, I'tidal, Sujud 7 titik berkedip, Duduk Iftirasy/Tawarruk, Salam).
  3. *Kartu Bacaan Arab Uthmani & Audio*: Font Amiri Uthmani berharakat besar, teks latin, arti, dan tombol pemutar audio suara guru.
  4. *Kotak Dalil Hadits Shahih*: Kutipan matan hadis dan perawi (HR. Bukhari, Muslim, Abu Dawud, dll).
  5. *Bilah Aksi Penyelesaian*: Tombol navigasi sebelumnya/berikutnya dan tombol klaim "Sudah Hafal (+10 Bintang)".

---

## 4. Scope and Boundaries
- **In-Scope**:
  - 13 rukun gerakan dan bacaan sholat shahih.
  - Mode karakter Putra dan Putri.
  - X-Ray visualizer 7 titik anggota sujud.
  - Zoom callout edukasi posisi kaki & telunjuk saat duduk tasyahud.
  - Simulasi otomatis perpindahan rukun per rakaat.
- **Anti-Goals**:
  - Tidak memasukkan pelafalan niat lisan ("Ushalli...") yang tidak memiliki dalil shahih dari Nabi ﷺ.
  - Tidak menggunakan gambar karakter wajah manusia realistis dengan mata/hidung detail.
  - Tidak membuat antarmuka membingungkan dengan terlalu banyak teks teologis yang berat untuk anak SD.

---

## 5. States and Ranges
- **Kondisi Eksplorasi Langkah**: Menelusuri langkah 1 s.d. 13 secara bebas dengan tombol navigasi atau slider.
- **Kondisi Mode Simulasi Berjalan**: Animasi berpindah otomatis setiap 7 detik diiringi audio bacaan.
- **Kondisi X-Ray Aktif**: Titik-titik hijau zamrud berpendar pada dahi, kedua tangan, kedua lutut, dan kedua ujung jari kaki.

---

## 6. Interaction and Layout
- **Layout**: Mobile-First responsif dengan split panggung karakter di atas dan kartu bacaan di bawah pada smartphone, serta berdampingan pada layar tablet/desktop.
- **Animasi & Transisi**: Perpindahan bentuk (*posture morphing*) menggunakan animasi spring Framer Motion berdurasi 0.35s yang halus dan tidak kaku.
- **Audio Feedback**: Efek konfeti dan suara apresiasi saat anak menandai hafal suatu rukun.

---

## 7. Constraints
- **Offline Capable**: Seluruh dalil, teks Arab, teks latin, terjemahan, dan logika animasi tersimpan lokal di peramban tanpa memerlukan koneksi internet.
