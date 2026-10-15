import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Heart, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

interface GuestLandingHeroProps {
  onOpenLogin: () => void;
  onExploreDemo: () => void;
}

export function GuestLandingHero({ onOpenLogin, onExploreDemo }: GuestLandingHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl border-4 border-emerald-400/30 p-6 sm:p-8 mb-6">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split Grid Hero */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline, Value Proposition & CTAs */}
        <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 border border-white/25 shadow-inner">
            <Sparkles className="w-4 h-4 fill-amber-300" />
            <span>Aplikasi Hafalan & Sholat Sunnah Salaf Pertama untuk SDIT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Sahabat Ceria Menjaga Hafalan Qur'an & Menuntun Sholat Sesuai Sunnah Nabi ﷺ
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-2xl">
            Belajar 13 gerakan sholat shahih beranimasi <em>faceless chibi</em>, kurikulum hafalan Juz 30, Hadis, & Doa Harian Kelas 1–6 SDIT dengan pengulangan ilmiah FSRS-6, serta sistem paraf digital terpercaya untuk orang tua.
          </p>

          {/* Quick Value Bullets */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs text-emerald-100 font-semibold">
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-amber-300" />
              Sifat Shalat Nabi ﷺ (Al-Albani)
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-amber-300" />
              Zero-Manual-Typing Kurikulum SDIT
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Check className="w-3.5 h-3.5 text-amber-300" />
              Paraf Digital Anti-Kecurangan
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={onOpenLogin}
              className="py-3 px-6 rounded-2xl font-black text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-amber-950 shadow-chunky-amber border border-amber-500/40 transition-all active:translate-y-1 flex items-center gap-2"
            >
              <span>Daftar / Masuk Akun Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Coba Demo Interaktif di Bawah 👇</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Mascot & Joyful Preview Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 p-5 shadow-2xl flex flex-col items-center text-center">
            {/* Top Mascot Trust Badge */}
            <div className="bg-emerald-900/60 border border-emerald-400/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-inner">
              ✨ 100% Adab Syar'i (Faceless Chibi)
            </div>

            {/* Chibi Character SVGs (Si Hafiz & Si Hafizah) */}
            <div className="flex items-center justify-center gap-4 py-2">
              {/* Si Hafiz (Putra) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-24 drop-shadow-lg">
                  <svg viewBox="0 0 100 120" className="w-full h-full">
                    {/* Shadow */}
                    <ellipse cx="50" cy="115" rx="30" ry="5" fill="#000000" opacity="0.15" />
                    {/* Baju Koko Hijau */}
                    <path d="M 28 65 L 72 65 L 78 110 L 22 110 Z" fill="#047857" />
                    <path d="M 40 65 L 50 78 L 60 65" fill="#34D399" />
                    <circle cx="50" cy="85" r="2.5" fill="#FBBF24" />
                    <circle cx="50" cy="95" r="2.5" fill="#FBBF24" />
                    {/* Celana */}
                    <path d="M 25 108 L 47 108 L 47 114 L 25 114 Z" fill="#064E3B" />
                    <path d="M 53 108 L 75 108 L 75 114 L 53 114 Z" fill="#064E3B" />
                    {/* Hands */}
                    <circle cx="20" cy="85" r="7" fill="#FCD34D" />
                    <circle cx="80" cy="85" r="7" fill="#FCD34D" />
                    {/* Head */}
                    <circle cx="50" cy="45" r="24" fill="#FDE68A" />
                    {/* Songkok Peci */}
                    <rect x="27" y="22" width="46" height="18" rx="4" fill="#1E293B" />
                    <rect x="27" y="36" width="46" height="4" fill="#F59E0B" />
                    {/* Faceless Happy Curve Eyes */}
                    <path d="M 40 46 Q 44 42 48 46" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 52 46 Q 56 42 60 46" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                    {/* Warm Smile */}
                    <path d="M 45 54 Q 50 58 55 54" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <span className="text-xs font-black text-amber-300 mt-1">Si Hafiz</span>
              </motion.div>

              {/* Si Hafizah (Putri) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-24 drop-shadow-lg">
                  <svg viewBox="0 0 100 120" className="w-full h-full">
                    {/* Shadow */}
                    <ellipse cx="50" cy="115" rx="30" ry="5" fill="#000000" opacity="0.15" />
                    {/* Gamis Pink Pastel */}
                    <path d="M 22 65 L 78 65 L 85 112 L 15 112 Z" fill="#DB2777" />
                    <path d="M 26 70 L 74 70 L 80 110 L 20 110 Z" fill="#F472B6" />
                    <path d="M 42 70 L 50 82 L 58 70" fill="#FCE7F3" />
                    {/* Hands */}
                    <circle cx="18" cy="85" r="7" fill="#FCD34D" />
                    <circle cx="82" cy="85" r="7" fill="#FCD34D" />
                    {/* Head */}
                    <circle cx="50" cy="45" r="24" fill="#FDE68A" />
                    {/* Mukena Pastel */}
                    <path d="M 24 45 C 24 25, 76 25, 76 45 C 76 65, 24 65, 24 45 Z" fill="#F472B6" />
                    <ellipse cx="50" cy="46" rx="17" ry="19" fill="#FDE68A" />
                    {/* Faceless Happy Curve Eyes */}
                    <path d="M 40 46 Q 44 42 48 46" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                    <path d="M 52 46 Q 56 42 60 46" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
                    {/* Warm Smile */}
                    <path d="M 45 54 Q 50 58 55 54" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <span className="text-xs font-black text-rose-300 mt-1">Si Hafizah</span>
              </motion.div>
            </div>

            {/* Feature Teasers Pills */}
            <div className="w-full grid grid-cols-2 gap-2 mt-3 text-left">
              <div className="bg-emerald-950/40 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-amber-300 font-bold block">🌴 Kebun Pahala</span>
                <span className="text-xs font-bold text-white">Tumbuh 5 Tahap</span>
              </div>
              <div className="bg-emerald-950/40 p-2 rounded-xl border border-white/10">
                <span className="text-[10px] text-sky-300 font-bold block">🕌 Praktik Sholat</span>
                <span className="text-xs font-bold text-white">X-Ray 7 Titik Sujud</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Feature Highlights Grid (Replaced Raw Emojis with Lucide Icons & Fixed text-xs) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-white/15">
        {/* Fitur 1: Sholat Sunnah Salaf */}
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black mb-2.5 shadow-sm">
            <Compass className="w-5 h-5 text-amber-950" />
          </div>
          <h3 className="font-black text-sm text-white mb-1">
            13 Rukun Sholat Shahih
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            Tuntunan rukun sholat sesuai kitab <em>Sifat Shalat Nabi ﷺ</em> (Syaikh Al-Albani), lengkap dengan X-Ray 7 titik sujud dan varian bacaan sekolah.
          </p>
        </div>

        {/* Fitur 2: Kurikulum SDIT Otomatis */}
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-sky-400 text-sky-950 flex items-center justify-center font-black mb-2.5 shadow-sm">
            <BookOpen className="w-5 h-5 text-sky-950" />
          </div>
          <h3 className="font-black text-sm text-white mb-1">
            Kurikulum Kelas 1–6 SDIT
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            Juz 30, Hadis, dan Doa Harian tersaji otomatis per kelas dengan algoritma memori FSRS-6 dan fitur penambahan materi kustom sekolah.
          </p>
        </div>

        {/* Fitur 3: Kebun Pahala Ceria */}
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-black mb-2.5 shadow-sm">
            <Heart className="w-5 h-5 text-emerald-950 fill-emerald-900" />
          </div>
          <h3 className="font-black text-sm text-white mb-1">
            Kebun Pohon Kurma
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            Gamifikasi bernilai ibadah. Setiap sholat dan muroja'ah mengumpulkan tetes air untuk menumbuhkan Pohon Kurma dari benih hingga berbuah emas.
          </p>
        </div>

        {/* Fitur 4: Paraf Digital & Rapor PDF */}
        <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-rose-400 text-rose-950 flex items-center justify-center font-black mb-2.5 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-rose-950" />
          </div>
          <h3 className="font-black text-sm text-white mb-1">
            Paraf Digital & Rapor PDF
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            Portal terpisah orang tua untuk verifikasi 1-klik yang aman dari kecurangan, serta ekspor Rapor Mutaba'ah Resmi siap cetak.
          </p>
        </div>
      </div>

      {/* Trust & Offline Badges */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200 font-semibold">
        <span className="flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-300" />
          100% Offline-First (Muroja'ah tanpa internet)
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          Adab Visual Syar'i (Maskot Faceless Chibi)
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          Bebas Iklan & Aman untuk Anak
        </span>
      </div>
    </section>
  );
}
