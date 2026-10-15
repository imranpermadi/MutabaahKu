import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  RotateCcw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SHOLAT_STEPS } from '../../data/sholatSteps';
import { SholatStepInfo, UserGender } from '../../types/database';

interface SholatAnimatorProps {
  gender?: UserGender;
  onStepCompleted?: (stepCode: string) => void;
}

export const SholatAnimator: React.FC<SholatAnimatorProps> = ({
  gender = 'PUTRA',
  onStepCompleted
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showXRay, setShowXRay] = useState(true);
  const [selectedOptionIdByStep, setSelectedOptionIdByStep] = useState<{ [stepCode: string]: string }>({});

  const step: SholatStepInfo = SHOLAT_STEPS[currentStepIndex];
  const isPutra = gender === 'PUTRA';

  // Resolusi varian bacaan aktif (jika ada lebih dari 1 opsi bacaan shahih)
  const activeOption = step.reading_options?.find(o => o.id === selectedOptionIdByStep[step.step_code]) || step.reading_options?.[0];
  const activeArabic = activeOption ? activeOption.arabic : step.arabic_reading;
  const activeLatin = activeOption ? activeOption.latin : step.latin_reading;
  const activeTranslation = activeOption ? activeOption.translation : step.translation;
  const activeSource = activeOption ? activeOption.source : step.dalil_source;

  // Auto-play timer effect
  useEffect(() => {
    let timer: any;
    if (isPlayingAuto) {
      timer = setTimeout(() => {
        if (currentStepIndex < SHOLAT_STEPS.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlayingAuto(false);
          triggerConfetti();
        }
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAuto, currentStepIndex]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleNext = () => {
    if (currentStepIndex < SHOLAT_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePlayRecitation = () => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(activeArabic);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85; // Slow & clear teacher rate
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePracticeDone = () => {
    triggerConfetti();
    if (onStepCompleted) {
      onStepCompleted(step.step_code);
    }
  };

  return (
    <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-7 relative overflow-hidden">
      {/* Header & Step Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              Langkah {step.step_order} dari {SHOLAT_STEPS.length}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Sifat Shalat Nabi ﷺ
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {step.title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            className={`btn-chunky py-2 px-3.5 text-xs ${
              isPlayingAuto ? 'bg-amber-500 text-white border-amber-700' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {isPlayingAuto ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingAuto ? 'Jeda Simulasi' : 'Putar Otomatis'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        {/* Posture Character Visual (Framer Motion Animated SVG) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50/60 to-amber-50/40 rounded-3xl border border-emerald-100 relative min-h-[320px]">
          {/* Stage floor grid */}
          <div className="absolute bottom-4 w-48 h-10 bg-emerald-900/10 rounded-full blur-md" />

          {/* Dynamic Posture Morphing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step.posture}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className="relative w-56 h-64 flex items-center justify-center"
            >
              <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-lg">
                {/* Sajadah / Prayer Rug under character */}
                <rect x="25" y="210" width="150" height="20" rx="4" fill="#047857" opacity="0.3" />

                {/* 1. STANDING / BERDIRI */}
                {step.posture === 'stand' && (
                  <g>
                    {/* Head */}
                    <circle cx="100" cy="50" r="24" fill="#FDE68A" />
                    {isPutra ? (
                      <rect x="78" y="26" width="44" height="20" rx="3" fill="#1E293B" />
                    ) : (
                      <path d="M 74 50 C 74 30, 126 30, 126 50 C 126 70, 74 70, 74 50 Z" fill="#F472B6" />
                    )}
                    {/* Smile/Faceless eyes */}
                    <path d="M 90 52 Q 94 48 98 52" stroke="#451A03" strokeWidth="2.5" fill="none" />
                    <path d="M 102 52 Q 106 48 110 52" stroke="#451A03" strokeWidth="2.5" fill="none" />

                    {/* Body Straight */}
                    <rect x="76" y="72" width="48" height="80" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />
                    {/* Arms down by side */}
                    <rect x="62" y="74" width="12" height="65" rx="6" fill={isPutra ? "#047857" : "#DB2777"} />
                    <rect x="126" y="74" width="12" height="65" rx="6" fill={isPutra ? "#047857" : "#DB2777"} />
                    <circle cx="68" cy="142" r="6" fill="#FDE68A" />
                    <circle cx="132" cy="142" r="6" fill="#FDE68A" />

                    {/* Legs Straight */}
                    <rect x="80" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                    <rect x="104" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                  </g>
                )}

                {/* 2. TAKBIR (Hands Raised) */}
                {step.posture === 'takbir' && (
                  <g>
                    <circle cx="100" cy="50" r="24" fill="#FDE68A" />
                    {isPutra ? (
                      <rect x="78" y="26" width="44" height="20" rx="3" fill="#1E293B" />
                    ) : (
                      <path d="M 74 50 C 74 30, 126 30, 126 50 C 126 70, 74 70, 74 50 Z" fill="#F472B6" />
                    )}
                    <path d="M 90 52 Q 94 48 98 52" stroke="#451A03" strokeWidth="2.5" fill="none" />
                    <path d="M 102 52 Q 106 48 110 52" stroke="#451A03" strokeWidth="2.5" fill="none" />

                    <rect x="76" y="72" width="48" height="80" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />
                    
                    {/* Hands raised parallel to shoulders/ears */}
                    <path d="M 76 80 L 52 50 L 52 38" stroke={isPutra ? "#059669" : "#EC4899"} strokeWidth="14" strokeLinecap="round" fill="none" />
                    <path d="M 124 80 L 148 50 L 148 38" stroke={isPutra ? "#059669" : "#EC4899"} strokeWidth="14" strokeLinecap="round" fill="none" />
                    {/* Palms facing Qibla */}
                    <ellipse cx="52" cy="34" rx="8" ry="10" fill="#FDE68A" />
                    <ellipse cx="148" cy="34" rx="8" ry="10" fill="#FDE68A" />

                    <rect x="80" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                    <rect x="104" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                  </g>
                )}

                {/* 3. BERSEDEKAP DI DADA (Folded on Chest) */}
                {step.posture === 'fold_chest' && (
                  <g>
                    <circle cx="100" cy="50" r="24" fill="#FDE68A" />
                    {isPutra ? (
                      <rect x="78" y="26" width="44" height="20" rx="3" fill="#1E293B" />
                    ) : (
                      <path d="M 74 50 C 74 30, 126 30, 126 50 C 126 70, 74 70, 74 50 Z" fill="#F472B6" />
                    )}
                    <path d="M 90 52 Q 94 48 98 52" stroke="#451A03" strokeWidth="2.5" fill="none" />
                    <path d="M 102 52 Q 106 48 110 52" stroke="#451A03" strokeWidth="2.5" fill="none" />

                    <rect x="76" y="72" width="48" height="80" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />

                    {/* Both arms folded across the chest */}
                    <path d="M 68 84 Q 100 102 132 84" stroke={isPutra ? "#047857" : "#DB2777"} strokeWidth="14" strokeLinecap="round" fill="none" />
                    {/* Right hand clutching left wrist/forearm */}
                    <rect x="90" y="86" width="22" height="12" rx="4" fill="#FDE68A" />

                    <rect x="80" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                    <rect x="104" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                  </g>
                )}

                {/* 4. RUKU' (90° Flat Back) */}
                {step.posture === 'ruku' && (
                  <g>
                    {/* Flat horizontal back */}
                    <rect x="45" y="105" width="85" height="40" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />
                    {/* Head aligned with flat back */}
                    <circle cx="36" cy="120" r="20" fill="#FDE68A" />
                    {isPutra && <rect x="20" y="105" width="18" height="30" rx="3" fill="#1E293B" />}

                    {/* Arms gripping knees */}
                    <path d="M 65 125 L 85 165" stroke={isPutra ? "#047857" : "#DB2777"} strokeWidth="12" strokeLinecap="round" fill="none" />
                    <circle cx="85" cy="165" r="7" fill="#FDE68A" />

                    {/* Legs upright */}
                    <rect x="110" y="125" width="18" height="85" rx="4" fill="#064E3B" />
                    {/* 90-degree guide arc */}
                    <path d="M 110 105 L 110 85" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" fill="none" />
                    <text x="118" y="98" fill="#D97706" fontSize="10" fontWeight="bold">90°</text>
                  </g>
                )}

                {/* 5. I'TIDAL */}
                {step.posture === 'itidal' && (
                  <g>
                    <circle cx="100" cy="50" r="24" fill="#FDE68A" />
                    {isPutra ? (
                      <rect x="78" y="26" width="44" height="20" rx="3" fill="#1E293B" />
                    ) : (
                      <path d="M 74 50 C 74 30, 126 30, 126 50 C 126 70, 74 70, 74 50 Z" fill="#F472B6" />
                    )}
                    <rect x="76" y="72" width="48" height="80" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />
                    <rect x="62" y="74" width="12" height="65" rx="6" fill={isPutra ? "#047857" : "#DB2777"} />
                    <rect x="126" y="74" width="12" height="65" rx="6" fill={isPutra ? "#047857" : "#DB2777"} />
                    <rect x="80" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                    <rect x="104" y="152" width="16" height="60" rx="4" fill="#064E3B" />
                  </g>
                )}

                {/* 6. SUJUD (7 Contact Points + X-Ray) */}
                {step.posture === 'sujud' && (
                  <g>
                    {/* Body bent down */}
                    <path d="M 50 190 Q 90 140 140 175" stroke={isPutra ? "#059669" : "#EC4899"} strokeWidth="35" strokeLinecap="round" fill="none" />
                    
                    {/* Forehead on floor */}
                    <circle cx="45" cy="195" r="16" fill="#FDE68A" />
                    {isPutra && <path d="M 32 185 L 55 185 L 50 200 Z" fill="#1E293B" />}

                    {/* Hands on floor beside head, elbows lifted */}
                    <path d="M 68 185 Q 75 160 85 180" stroke={isPutra ? "#047857" : "#DB2777"} strokeWidth="10" fill="none" strokeLinecap="round" />
                    <circle cx="65" cy="195" r="6" fill="#FDE68A" />

                    {/* Knees and Feet */}
                    <circle cx="115" cy="195" r="9" fill="#064E3B" />
                    <circle cx="155" cy="195" r="6" fill="#FDE68A" />

                    {/* X-RAY SPOT HIGHLIGHTER (7 Anggota Sujud) */}
                    {showXRay && (
                      <g>
                        {/* 1. Dahi & Hidung */}
                        <circle cx="43" cy="196" r="8" fill="#10B981" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s' }} />
                        <circle cx="43" cy="196" r="5" fill="#10B981" />
                        <text x="35" y="175" fill="#047857" fontSize="8" fontWeight="bold">1. Dahi</text>

                        {/* 2-3. Kedua Telapak Tangan */}
                        <circle cx="65" cy="195" r="5" fill="#10B981" />
                        <text x="58" y="175" fill="#047857" fontSize="8" fontWeight="bold">2-3. Tangan</text>

                        {/* 4-5. Kedua Lutut */}
                        <circle cx="115" cy="195" r="5" fill="#10B981" />
                        <text x="108" y="175" fill="#047857" fontSize="8" fontWeight="bold">4-5. Lutut</text>

                        {/* 6-7. Kedua Ujung Kaki */}
                        <circle cx="155" cy="195" r="5" fill="#10B981" />
                        <text x="145" y="175" fill="#047857" fontSize="8" fontWeight="bold">6-7. Ujung Kaki</text>
                      </g>
                    )}
                  </g>
                )}

                {/* 7. DUDUK IFTIRASY (Sitting on left foot, right upright) */}
                {step.posture === 'iftirasy' && (
                  <g>
                    <circle cx="110" cy="95" r="20" fill="#FDE68A" />
                    {isPutra ? (
                      <rect x="92" y="75" width="36" height="18" rx="3" fill="#1E293B" />
                    ) : (
                      <path d="M 88 95 C 88 75, 132 75, 132 95 Z" fill="#F472B6" />
                    )}
                    <path d="M 102 96 Q 106 92 110 96" stroke="#451A03" strokeWidth="2" fill="none" />

                    <rect x="88" y="115" width="44" height="60" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />
                    
                    {/* Hands on thighs */}
                    <path d="M 85 125 L 75 160" stroke={isPutra ? "#047857" : "#DB2777"} strokeWidth="10" strokeLinecap="round" fill="none" />
                    <circle cx="75" cy="162" r="6" fill="#FDE68A" />

                    {/* Sitting posture */}
                    <path d="M 90 170 Q 110 185 130 185 L 140 205 L 75 205 Z" fill="#064E3B" />
                    {/* Right foot upright */}
                    <rect x="135" y="195" width="8" height="14" rx="2" fill="#FDE68A" />
                  </g>
                )}

                {/* 8. DUDUK TAWARRUK (Foot under shin, hip on floor) */}
                {step.posture === 'tawarruk' && (
                  <g>
                    <circle cx="110" cy="95" r="20" fill="#FDE68A" />
                    {isPutra ? (
                      <rect x="92" y="75" width="36" height="18" rx="3" fill="#1E293B" />
                    ) : (
                      <path d="M 88 95 C 88 75, 132 75, 132 95 Z" fill="#F472B6" />
                    )}
                    <rect x="88" y="115" width="44" height="60" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />

                    {/* Hands on thighs with index finger pointing forward */}
                    <path d="M 85 125 L 70 160" stroke={isPutra ? "#047857" : "#DB2777"} strokeWidth="10" strokeLinecap="round" fill="none" />
                    <circle cx="70" cy="160" r="5" fill="#FDE68A" />
                    {/* Index finger pointer */}
                    <line x1="70" y1="160" x2="60" y2="155" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />

                    {/* Tawarruk hip on floor */}
                    <path d="M 85 170 Q 110 185 125 185 L 145 205 L 65 205 Z" fill="#064E3B" />
                    {/* Left foot emerges under right shin */}
                    <ellipse cx="60" cy="204" rx="7" ry="4" fill="#FDE68A" />
                  </g>
                )}

                {/* 9. SALAM (Turning Right & Left) */}
                {step.posture === 'salam' && (
                  <g>
                    {/* Head turned right */}
                    <circle cx="115" cy="95" r="20" fill="#FDE68A" />
                    {isPutra && <rect x="96" y="75" width="36" height="18" rx="3" fill="#1E293B" />}
                    {/* Side profile cheek visible */}
                    <ellipse cx="125" cy="96" rx="5" ry="4" fill="#FECACA" opacity="0.6" />
                    <path d="M 120 95 Q 123 92 126 95" stroke="#451A03" strokeWidth="2" fill="none" />

                    <rect x="88" y="115" width="44" height="60" rx="8" fill={isPutra ? "#059669" : "#EC4899"} />
                    <path d="M 90 170 Q 110 185 130 185 L 140 205 L 75 205 Z" fill="#064E3B" />
                  </g>
                )}
              </svg>
            </motion.div>
          </AnimatePresence>

          {/* X-Ray toggle for Sujud */}
          {step.posture === 'sujud' && (
            <button
              onClick={() => setShowXRay(!showXRay)}
              className="mt-3 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showXRay ? 'Sembunyikan 7 Titik Sujud' : 'Tampilkan 7 Titik Sujud'}</span>
            </button>
          )}

          {/* Zoom-in callout for Iftirasy vs Tawarruk */}
          {(step.posture === 'iftirasy' || step.posture === 'tawarruk') && (
            <div className="mt-3 text-[11px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-xl max-w-xs text-center">
              💡 <span className="font-bold">Tahukah Kamu?</span> {step.posture === 'iftirasy' ? 'Duduk Iftirasy menduduki kaki kiri dan menegakkan kaki kanan.' : 'Duduk Tawarruk mendudukkan pantat ke lantai dan kaki kiri dikeluarkan di bawah betis kanan.'}
            </div>
          )}
        </div>

        {/* Step Guide, Arabic Recitation, Translation & Dalil */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
          {/* Explanation */}
          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/80">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-1">
              Tata Cara Shahih Sesuai Sunnah:
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {step.description}
            </p>
          </div>

          {/* Varian Pilihan Bacaan Shahih (Jika ada lebih dari 1 opsi) */}
          {step.reading_options && step.reading_options.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Pilih Bacaan yang Diajarkan di Sekolahmu:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {step.reading_options.map((opt) => {
                  const isSelected = activeOption?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOptionIdByStep({
                        ...selectedOptionIdByStep,
                        [step.step_code]: opt.id
                      })}
                      className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Arabic Recitation Box */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                {activeOption ? activeOption.label : 'Bacaan Shahih'}
              </span>
              <button
                onClick={handlePlayRecitation}
                className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-95"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-500 animate-pulse' : ''}`} />
                <span>{isSpeaking ? 'Membacakan...' : 'Dengarkan Audio'}</span>
              </button>
            </div>

            {/* Arabic Uthmani Text */}
            <p className="text-right text-2xl sm:text-3xl font-arabic font-normal tracking-wide py-2 leading-loose drop-shadow-sm">
              {activeArabic}
            </p>

            {/* Latin */}
            {activeLatin && (
              <p className="text-xs sm:text-sm font-semibold text-emerald-100 italic mt-2 border-t border-white/20 pt-2">
                "{activeLatin}"
              </p>
            )}

            {/* Translation */}
            <p className="text-xs text-white/90 mt-1 font-medium">
              Artinya: {activeTranslation}
            </p>
          </div>

          {/* Authentic Dalil Box */}
          <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3">
            <BookOpen className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Dalil Hadits Shahih: </span>
              <span>"{step.dalil}"</span>
              <span className="block text-[11px] text-amber-700 font-bold mt-0.5">
                — {activeSource}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`btn-chunky py-2 px-4 text-xs ${
            currentStepIndex === 0 ? 'opacity-40 pointer-events-none bg-slate-100 text-slate-400' : 'btn-chunky-ghost'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <button
          onClick={handlePracticeDone}
          className="btn-chunky-amber py-2 px-5 text-xs shadow-chunky-amber"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-950" />
          <span>Sudah Hafal Gerakan & Bacaan Ini! (+10 Bintang)</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentStepIndex === SHOLAT_STEPS.length - 1}
          className={`btn-chunky py-2 px-4 text-xs ${
            currentStepIndex === SHOLAT_STEPS.length - 1 ? 'opacity-40 pointer-events-none bg-slate-100 text-slate-400' : 'btn-chunky-emerald'
          }`}
        >
          <span>Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
