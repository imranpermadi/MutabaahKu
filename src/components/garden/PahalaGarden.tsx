import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Award, Lock, Star, Info, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AchievementBreakdown } from '../../lib/db';

interface PahalaGardenProps {
  treeLevel?: number; // 1 to 5
  waterDrops?: number;
  starPoints?: number;
  unlockedStickers?: string[];
  breakdown?: AchievementBreakdown;
  onWaterTree?: () => void;
}

export const STICKERS_CATALOG = [
  { id: 'sticker_welcome_star', name: 'Bintang Sahabat', icon: '⭐', desc: 'Bintang penyambut anak sholih' },
  { id: 'sticker_kabah', name: 'Ka\'bah Bersinar', icon: '🕋', desc: 'Sholat fardhu berjamaah di masjid' },
  { id: 'sticker_lantern', name: 'Lentera Berkah', icon: '🏮', desc: 'Rajin Dhuha, Tahajjud, atau Puasa' },
  { id: 'sticker_camel', name: 'Unta Gurun', icon: '🐪', desc: 'Mencapai 5x ulangan Muroja\'ah' },
  { id: 'sticker_mosque', name: 'Masjid Nabawi', icon: '🕌', desc: 'Menumbuhkan pohon sampai Level 3' },
  { id: 'sticker_crown', name: 'Mahkota Hafiz', icon: '👑', desc: 'Lulus minimal 2 materi hafalan (L)' },
];

export const PahalaGarden: React.FC<PahalaGardenProps> = ({
  treeLevel = 1,
  waterDrops = 0,
  starPoints = 0,
  unlockedStickers = ['sticker_welcome_star'],
  breakdown,
  onWaterTree
}) => {
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showSourceDetail, setShowSourceDetail] = useState(false);
  const [isWatering, setIsWatering] = useState(false);

  const safeTreeLevel = Math.max(1, Math.min(5, treeLevel));

  const levelNames = [
    'Benih Berkah',
    'Tunas Hijau Muda',
    'Pohon Kurma Muda',
    'Pohon Berbunga Indah',
    'Pohon Kurma Emas Berbuah Lebat'
  ];

  const handleWater = () => {
    if (waterDrops < 10 || safeTreeLevel >= 5) return;
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 }
      });
      if (onWaterTree) onWaterTree();
    }, 800);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-4xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Background Decor Stars */}
      <div className="absolute top-2 right-4 text-amber-300 opacity-30 text-4xl animate-pulse">✨</div>
      <div className="absolute bottom-4 left-6 text-amber-200 opacity-20 text-3xl">🌴</div>

      {/* Top Header Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
              Kebun Pahala Virtual
            </span>
            <span className="text-[10px] font-bold text-emerald-100 bg-emerald-950/40 border border-white/15 px-2.5 py-0.5 rounded-full">
              ✓ Tersinkron Otomatis dengan Pencapaian Anak
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black mt-1">
            {levelNames[safeTreeLevel - 1] || 'Pohon Berkah'} (Level {safeTreeLevel}/5)
          </h3>
        </div>

        {/* Currency points pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-400 text-amber-950 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-sm">
            <Star className="w-4 h-4 fill-amber-950" />
            <span>{starPoints} Bintang</span>
          </div>
          <div className="flex items-center gap-1.5 bg-sky-400 text-sky-950 font-black text-xs px-3.5 py-1.5 rounded-2xl shadow-sm">
            <Droplets className="w-4 h-4 fill-sky-950" />
            <span>{waterDrops} Tetes Air</span>
          </div>
        </div>
      </div>

      {/* Garden Tree Center Stage */}
      <div className="flex flex-col items-center justify-center my-6 relative z-10">
        {/* Animated Tree SVG */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Soil / Grass Mound */}
          <ellipse cx="100" cy="180" rx="70" ry="18" fill="#064E3B" className="drop-shadow-md" />

          <motion.div
            animate={isWatering ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 0.6 }}
            className="w-full h-full flex items-center justify-center"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
              {/* STAGE 1: Seed / Benih */}
              {safeTreeLevel === 1 && (
                <g>
                  <ellipse cx="100" cy="175" rx="14" ry="10" fill="#92400E" />
                  <path d="M 100 170 Q 102 155 106 150" stroke="#34D399" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <ellipse cx="106" cy="148" rx="6" ry="4" fill="#34D399" />
                </g>
              )}

              {/* STAGE 2: Tunas Hijau */}
              {safeTreeLevel === 2 && (
                <g>
                  <path d="M 100 178 Q 98 140 100 120" stroke="#047857" strokeWidth="10" strokeLinecap="round" fill="none" />
                  {/* Leaves */}
                  <path d="M 100 135 Q 70 125 65 110 Q 80 115 100 130" fill="#10B981" />
                  <path d="M 100 135 Q 130 125 135 110 Q 120 115 100 130" fill="#34D399" />
                  <path d="M 100 120 Q 95 90 100 85 Q 105 90 100 120" fill="#6EE7B7" />
                </g>
              )}

              {/* STAGE 3: Pohon Kurma Muda */}
              {safeTreeLevel === 3 && (
                <g>
                  <path d="M 100 178 Q 96 110 100 80" stroke="#78350F" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <path d="M 100 80 Q 50 65 35 75 Q 60 55 100 80" fill="#059669" />
                  <path d="M 100 80 Q 150 65 165 75 Q 140 55 100 80" fill="#10B981" />
                  <path d="M 100 80 Q 80 40 70 30 Q 95 45 100 80" fill="#34D399" />
                  <path d="M 100 80 Q 120 40 130 30 Q 105 45 100 80" fill="#047857" />
                </g>
              )}

              {/* STAGE 4: Pohon Berbunga */}
              {safeTreeLevel === 4 && (
                <g>
                  <path d="M 100 178 Q 94 110 100 70" stroke="#78350F" strokeWidth="20" strokeLinecap="round" fill="none" />
                  <path d="M 100 70 Q 40 55 25 70 Q 55 45 100 70" fill="#047857" />
                  <path d="M 100 70 Q 160 55 175 70 Q 145 45 100 70" fill="#059669" />
                  <path d="M 100 70 Q 70 30 55 20 Q 85 35 100 70" fill="#10B981" />
                  <path d="M 100 70 Q 130 30 145 20 Q 115 35 100 70" fill="#34D399" />
                  {/* Yellow Flowers */}
                  <circle cx="85" cy="75" r="5" fill="#FBBF24" />
                  <circle cx="115" cy="75" r="5" fill="#FBBF24" />
                  <circle cx="100" cy="60" r="5" fill="#FCD34D" />
                </g>
              )}

              {/* STAGE 5: Pohon Kurma Emas Berbuah Lebat */}
              {safeTreeLevel >= 5 && (
                <g>
                  <path d="M 100 178 Q 92 100 100 65" stroke="#78350F" strokeWidth="24" strokeLinecap="round" fill="none" />
                  <path d="M 100 65 Q 30 50 15 65 Q 50 35 100 65" fill="#047857" />
                  <path d="M 100 65 Q 170 50 185 65 Q 150 35 100 65" fill="#059669" />
                  <path d="M 100 65 Q 60 20 40 10 Q 80 25 100 65" fill="#10B981" />
                  <path d="M 100 65 Q 140 20 160 10 Q 120 25 100 65" fill="#34D399" />
                  {/* Golden Dates Bunches */}
                  <g fill="#F59E0B">
                    <circle cx="80" cy="75" r="6" />
                    <circle cx="88" cy="80" r="6" />
                    <circle cx="82" cy="86" r="6" />
                    <circle cx="120" cy="75" r="6" />
                    <circle cx="112" cy="80" r="6" />
                    <circle cx="118" cy="86" r="6" />
                  </g>
                  {/* Glowing Sparkles */}
                  <circle cx="100" cy="40" r="3" fill="#FEF08A" className="animate-ping" />
                </g>
              )}
            </svg>
          </motion.div>
        </div>

        {/* Action Button: Siram Pohon */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleWater}
            disabled={waterDrops < 10 || isWatering || safeTreeLevel >= 5}
            className={`btn-chunky py-3 px-6 text-sm ${
              waterDrops >= 10 && safeTreeLevel < 5
                ? 'btn-chunky-amber shadow-chunky-amber'
                : 'bg-white/20 text-white/60 cursor-not-allowed border-none'
            }`}
          >
            <Droplets className="w-5 h-5 fill-current" />
            <span>
              {safeTreeLevel >= 5
                ? 'Pohon Sudah Level Maksimal (5/5) 🌴'
                : isWatering
                ? 'Menyiram...'
                : 'Siram Pohon (10 Tetes Air)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowStickerModal(true)}
            className="btn-chunky py-3 px-5 text-sm bg-white/20 hover:bg-white/30 text-white border-b-4 border-white/40 active:border-b-0 backdrop-blur-sm"
          >
            <Award className="w-5 h-5" />
            <span>Album Stiker ({unlockedStickers.length}/{STICKERS_CATALOG.length})</span>
          </button>
        </div>
      </div>

      {/* Progress to next level bar */}
      <div className="mt-2 bg-black/20 rounded-2xl p-3 border border-white/10 relative z-10 space-y-2.5">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>
              {safeTreeLevel >= 5
                ? 'MasyaAllah! Pohon Kurma Emas Berbuah Lebat (Level 5/5)'
                : `Progres Pertumbuhan Menuju Level ${Math.min(safeTreeLevel + 1, 5)}`}
            </span>
            <span>{Math.min(safeTreeLevel * 20, 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(safeTreeLevel * 20, 100)}%` }}
            />
          </div>
        </div>

        {/* Tombol & Panel Rincian Sumber Tetes Air & Bintang */}
        {breakdown && (
          <div className="pt-1 border-t border-white/15">
            <button
              type="button"
              onClick={() => setShowSourceDetail(!showSourceDetail)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-100 hover:text-white py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-300" />
                <span>Dari mana asal {waterDrops} Tetes Air &amp; {starPoints} Bintang ini? (Klik rincian)</span>
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSourceDetail ? 'rotate-180' : ''}`} />
            </button>

            {showSourceDetail && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] bg-emerald-950/60 p-3 rounded-xl border border-white/15 animate-fadeIn">
                <div className="space-y-1">
                  <div className="font-black text-sky-300 uppercase tracking-wider text-[10px]">
                    💧 Sumber Tetes Air (Real-Time)
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>• Sholat Fardhu ({breakdown.berjamaahCount}x Masjid, {breakdown.tepatWaktuCount}x Tepat):</span>
                    <strong className="text-white">+{breakdown.waterFromSholatFardhu} Air</strong>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>• Puasa, Dhuha &amp; Qiyamul Lail:</span>
                    <strong className="text-white">+{breakdown.waterFromSunnahAndPuasa} Air</strong>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>• Ulangan Muroja'ah ({breakdown.murojaahPassTotal}x ulang):</span>
                    <strong className="text-white">+{breakdown.waterFromMurojaah} Air</strong>
                  </div>
                  <div className="flex justify-between text-amber-300">
                    <span>• Dipakai Siram Pohon (Level {safeTreeLevel}):</span>
                    <strong>-{breakdown.waterSpentOnTree} Air</strong>
                  </div>
                  <div className="flex justify-between font-black text-sky-200 pt-1 border-t border-white/10">
                    <span>Total Tersedia Saat Ini:</span>
                    <span>{breakdown.totalWaterAvailable} Tetes Air</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="font-black text-amber-300 uppercase tracking-wider text-[10px]">
                    ⭐ Sumber Bintang Pahala (Paraf Ortu)
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>• Paraf Ibadah Harian ({breakdown.approvedYaumiyahCount} hari):</span>
                    <strong className="text-white">+{breakdown.starsFromApprovedYaumiyah} ⭐</strong>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>• Hafalan Lulus Mutqin ({breakdown.approvedHafalanCount} materi):</span>
                    <strong className="text-white">+{breakdown.starsFromMasteredHafalan} ⭐</strong>
                  </div>
                  <div className="flex justify-between text-emerald-100">
                    <span>• Latihan Gerakan Sholat:</span>
                    <strong className="text-white">+{breakdown.starsFromSholatPractice} ⭐</strong>
                  </div>
                  <div className="flex justify-between font-black text-amber-300 pt-1 border-t border-white/10">
                    <span>Total Bintang Terkumpul:</span>
                    <span>{breakdown.totalStars} Bintang</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticker Album Modal */}
      <AnimatePresence>
        {showStickerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-800 rounded-4xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  <h4 className="text-lg font-black text-slate-800">
                    Buku Stiker Anak Sholih
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStickerModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 max-h-80 overflow-y-auto">
                {STICKERS_CATALOG.map((st) => {
                  const isUnlocked = unlockedStickers.includes(st.id);
                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                        isUnlocked
                          ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                          : 'bg-slate-100 border-slate-200 opacity-50'
                      }`}
                    >
                      <span className="text-4xl mb-1">{st.icon}</span>
                      <div className="text-xs font-black text-slate-800">{st.name}</div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {st.desc}
                      </div>
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400 mt-1" />}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowStickerModal(false)}
                className="w-full btn-chunky-emerald py-2.5 text-xs"
              >
                Tutup Buku Stiker
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
