import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { UserGender } from '../../types/database';

interface MascotCharacterProps {
  gender?: UserGender;
  message?: string;
  actionText?: string;
  onActionClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MascotCharacter: React.FC<MascotCharacterProps> = ({
  gender = 'PUTRA',
  message = "Assalamu'alaikum sahabat sholih! Yuk belajar dan jaga hafalan hari ini!",
  actionText,
  onActionClick,
  size = 'md'
}) => {
  const isPutra = gender === 'PUTRA';
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.25 : 1;

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 rounded-3xl border-2 border-emerald-500/20 shadow-sm relative overflow-hidden">
      {/* Decorative background stars */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

      {/* SVG Character Mascot */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: [0, 1, -1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="flex-shrink-0 relative"
        style={{ width: 90 * scale, height: 110 * scale }}
      >
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
          {/* Shadow */}
          <ellipse cx="50" cy="115" rx="30" ry="5" fill="#000000" opacity="0.1" />

          {/* Body / Clothes */}
          {isPutra ? (
            // Baju Koko Hijau Zamrud Putra
            <g>
              <path d="M 28 65 L 72 65 L 78 110 L 22 110 Z" fill="#059669" rx="10" />
              {/* Kerah Koko */}
              <path d="M 40 65 L 50 78 L 60 65" fill="#34D399" stroke="#047857" strokeWidth="2" />
              {/* Kancing */}
              <circle cx="50" cy="85" r="2.5" fill="#FBBF24" />
              <circle cx="50" cy="95" r="2.5" fill="#FBBF24" />
              {/* Celana */}
              <path d="M 25 108 L 47 108 L 47 114 L 25 114 Z" fill="#064E3B" />
              <path d="M 53 108 L 75 108 L 75 114 L 53 114 Z" fill="#064E3B" />
            </g>
          ) : (
            // Mukena / Gamis Pastel Putri
            <g>
              <path d="M 22 65 L 78 65 L 85 112 L 15 112 Z" fill="#EC4899" opacity="0.85" rx="12" />
              <path d="M 26 70 L 74 70 L 80 110 L 20 110 Z" fill="#F472B6" />
              <path d="M 42 70 L 50 82 L 58 70" fill="#FCE7F3" />
            </g>
          )}

          {/* Hands */}
          <circle cx="20" cy="85" r="7" fill="#FCD34D" />
          <circle cx="80" cy="85" r="7" fill="#FCD34D" />

          {/* Head (Warm Peach Skin Tone) */}
          <circle cx="50" cy="45" r="24" fill="#FDE68A" />

          {/* Peci (Putra) or Mukena Headwear (Putri) */}
          {isPutra ? (
            <g>
              {/* Peci Hitam Songkok dengan aksen emas */}
              <rect x="27" y="22" width="46" height="18" rx="4" fill="#1E293B" />
              <rect x="27" y="36" width="46" height="4" fill="#F59E0B" />
              {/* Rambut tipis samping */}
              <path d="M 28 40 Q 30 46 28 50" stroke="#1E293B" strokeWidth="3" fill="none" />
              <path d="M 72 40 Q 70 46 72 50" stroke="#1E293B" strokeWidth="3" fill="none" />
            </g>
          ) : (
            <g>
              {/* Mukena Penutup Kepala Lembut */}
              <path d="M 24 45 C 24 25, 76 25, 76 45 C 76 65, 24 65, 24 45 Z" fill="#F472B6" />
              <ellipse cx="50" cy="46" rx="17" ry="19" fill="#FDE68A" />
              {/* Renda Mukena */}
              <path d="M 33 32 Q 50 36 67 32" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3,3" fill="none" />
            </g>
          )}

          {/* Adab-compliant Faceless/Minimalist Chibi Eyes (Smiling curves) */}
          <g>
            {/* Smiling happy curve eyes */}
            <path d="M 40 46 Q 44 42 48 46" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 52 46 Q 56 42 60 46" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Rosy Cheeks */}
            <circle cx="36" cy="50" r="4" fill="#F87171" opacity="0.4" />
            <circle cx="64" cy="50" r="4" fill="#F87171" opacity="0.4" />
            {/* Gentle smile */}
            <path d="M 46 53 Q 50 57 54 53" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        </svg>

        {/* Small floating badge */}
        <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </motion.div>

      {/* Speech Bubble */}
      <div className="flex-1">
        <div className="relative bg-white rounded-2xl p-3.5 border-2 border-emerald-400/40 shadow-sm">
          {/* Bubble Pointer Tail */}
          <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent" />
          
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {isPutra ? 'Si Hafiz' : 'Si Hafizah'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Sahabat Sholih</span>
          </div>

          <p className="text-sm font-semibold text-slate-700 leading-snug">
            {message}
          </p>

          {actionText && (
            <button
              onClick={onActionClick}
              className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 transition-colors inline-flex items-center gap-1"
            >
              <span>{actionText}</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
