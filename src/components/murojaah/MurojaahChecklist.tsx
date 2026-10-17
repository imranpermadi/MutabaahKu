import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Repeat, 
  Award, 
  Sparkles, 
  Send, 
  Clock, 
  Volume2, 
  Eye, 
  EyeOff, 
  X,
  Plus,
  Trash2,
  GraduationCap,
  Mic,
  Square,
  Play,
  RotateCcw,
  Check,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MurojaahChecklist as ChecklistType, CurriculumCategory } from '../../types/database';
import { SCHOOL_HADITHS, SchoolHadith } from '../../data/schoolHadiths';
import { addCustomCurriculumItem, deleteCurriculumItem, saveHafalanAudioRecord } from '../../lib/db';

interface MurojaahChecklistProps {
  checklists: ChecklistType[];
  currentStudentId?: string;
  onPassIncrement: (checklistId: string) => void;
  onClaimReview: (checklistId: string) => void;
  onItemAdded?: () => void;
}

export const MurojaahChecklist: React.FC<MurojaahChecklistProps> = ({
  checklists,
  currentStudentId = '',
  onPassIncrement,
  onClaimReview,
  onItemAdded
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'QURAN' | 'HADITH' | 'DOA'>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<ChecklistType | null>(null);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Audio Recording Modal State
  const [recordingTargetItem, setRecordingTargetItem] = useState<ChecklistType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Form State Tambah Hadis/Doa Baru
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CurriculumCategory>('HADITH');
  const [formGrade, setFormGrade] = useState<number>(3);
  const [formArabic, setFormArabic] = useState('');
  const [formLatin, setFormLatin] = useState('');
  const [formTranslation, setFormTranslation] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formTargetPass, setFormTargetPass] = useState<number>(5);

  // Filter Logic (Kategori & Kelas)
  const filtered = checklists.filter(item => {
    const matchCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchGrade = selectedGrade === 'ALL' || (item.grade_level || 3) === selectedGrade;
    return matchCategory && matchGrade;
  });

  const handleIncrement = (id: string, current: number, target: number) => {
    if (current < target) {
      onPassIncrement(id);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (window.confirm(`Hapus materi hafalan "${title}" dari daftar kisi-kisi?`)) {
      await deleteCurriculumItem(id);
      if (onItemAdded) onItemAdded();
    }
  };

  // --- Voice Recorder Handlers ---
  const startRecording = async () => {
    setRecordingError(null);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Perekam suara tidak didukung browser ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks to free mic
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(sec => sec + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access failed:', err);
      // Fallback: Generate a sample simulation audio for devices without mic hardware
      setRecordingError('Mikrofon tidak terdeteksi atau izin belum diberikan. Anda dapat menggunakan audio contoh untuk uji coba.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    stopRecording();
    setRecordedAudioUrl(null);
    setRecordingTargetItem(null);
  };

  const handleUseSimulatedAudio = () => {
    // Valid 1.2s talaqqi wave audio
    const sampleAudio = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LFjV02DF2o3/PLm248Fz2W1e7NnW47GD2U1e/OoHE9Gz2R0+rJmHNAHDmP0ebEkmlCEjKGzN7Ah2FDEi+BzdzAfmFEEyuAy9m9fF9HECW7x9W2c1ZEECa0wNOxbFJDDSurvcqna08+DCelscSUZEI7ByOeqrmUYz47BSicrLiRYTo4BimfqbSOXzc3BCmfqa+IWzQ0BCigp62EWjA0AymdoauCVS0xACibnaaAViouACmanZ96UiUsACiZnJp3TyMm';
    setRecordedAudioUrl(sampleAudio);
    setRecordingSeconds(15);
    setRecordingError(null);
  };

  const handleSaveAudioToItem = async () => {
    if (!recordingTargetItem || !recordedAudioUrl) return;

    await saveHafalanAudioRecord(
      recordingTargetItem.id, 
      recordedAudioUrl, 
      Math.max(1, recordingSeconds)
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setRecordingTargetItem(null);
    setRecordedAudioUrl(null);
    if (onItemAdded) onItemAdded();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    await addCustomCurriculumItem({
      student_id: currentStudentId,
      curriculum_item_id: `custom-${Date.now()}`,
      curriculum_title: formTitle.trim(),
      category: formCategory,
      grade_level: formGrade,
      exam_cycle_id: 'PTS_1',
      target_pass_count: formTargetPass || 5,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: formArabic.trim() || undefined,
      latin_text: formLatin.trim() || undefined,
      translation: formTranslation.trim() || undefined,
      source: formSource.trim() || 'Kurikulum Sekolah'
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Reset Form
    setFormTitle('');
    setFormArabic('');
    setFormLatin('');
    setFormTranslation('');
    setFormSource('');
    setShowAddModal(false);

    if (onItemAdded) onItemAdded();
  };

  const getHadithDetail = (curriculumItemId: string): SchoolHadith | undefined => {
    return SCHOOL_HADITHS.find(h => h.id === curriculumItemId);
  };

  const handlePlayAudio = (arabicText: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(arabicText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Kurikulum Fleksibel SDIT
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Kelas 1 s.d. 6 SD
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
            Kisi-Kisi Target Hafalan (Qur'an, Hadis & Doa)
          </h3>
        </div>

        {/* Action Button: Tambah Hadis/Doa Baru */}
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-chunky py-2 px-3.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Hadis / Doa Baru</span>
        </button>
      </div>

      {/* Filter Tabs: Tingkat Kelas (1-6) & Kategori */}
      <div className="mt-4 space-y-2.5">
        {/* Tingkat Kelas (Kelas 1 - 6) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-black text-slate-400 mr-1 whitespace-nowrap">Tingkat:</span>
          <button
            onClick={() => setSelectedGrade('ALL')}
            className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedGrade === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Kelas
          </button>
          {[1, 2, 3, 4, 5, 6].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedGrade === grade
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kelas {grade} SD
            </button>
          ))}
        </div>

        {/* Kategori (Semua, Quran, Hadis, Doa) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-black text-slate-400 mr-1 whitespace-nowrap">Materi:</span>
          {(['ALL', 'HADITH', 'DOA', 'QURAN'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeCategory === tab
                  ? tab === 'HADITH' ? 'bg-amber-500 text-amber-950 font-black shadow-sm' : 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'Semua Materi' : tab === 'HADITH' ? '📜 Hadis Nabi' : tab === 'DOA' ? '🤲 Doa Harian' : '📖 Al-Qur\'an'}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3.5 mt-5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-sm">
            Tidak ada materi hafalan pada pilihan filter ini. Klik tombol <span className="font-bold text-emerald-700">"+ Tambah Hadis / Doa Baru"</span> untuk menambahkan materi kurikulum sekolahmu!
          </div>
        ) : (
          filtered.map((item) => {
            const isCompletedTarget = item.completed_pass_count >= item.target_pass_count;
            const hadithInfo = item.category === 'HADITH' ? getHadithDetail(item.curriculum_item_id) : null;
            const displayArabic = item.arabic_text || (hadithInfo ? hadithInfo.arabic_matan : null);

            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl border border-slate-200/90 hover:border-emerald-300 transition-all bg-gradient-to-r from-white to-slate-50/50 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.category === 'HADITH' 
                          ? 'bg-amber-100 text-amber-900 font-extrabold'
                          : item.category === 'QURAN'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {item.category === 'HADITH' ? '📜 HADIS NABI' : item.category === 'DOA' ? '🤲 DOA HARIAN' : '📖 AL-QUR\'AN'}
                      </span>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Kelas {item.grade_level || 3} SD
                      </span>

                      {/* Badge Indikator Rekaman Audio Suara Tersedia */}
                      {item.audio_record_url && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                          <Mic className="w-3 h-3 text-amber-700" />
                          <span>Ada Rekaman ({item.audio_duration || 15}d)</span>
                        </span>
                      )}

                      {item.parent_review_status === 'APPROVED' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Diparaf: {item.mutabaah_grade === 'L' ? 'Lancar (L)' : 'Belum Lancar (BL)'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Menunggu Paraf
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-slate-800 mt-1">
                      {item.curriculum_title}
                    </h4>

                    {displayArabic && (
                      <p className="text-xs font-arabic text-emerald-900 mt-1 font-semibold truncate max-w-md">
                        {displayArabic}
                      </p>
                    )}

                    {/* Compact Audio Player if audio recorded */}
                    {item.audio_record_url && (
                      <div className="mt-2.5 max-w-xs">
                        <audio controls src={item.audio_record_url} className="w-full h-8 rounded-lg" />
                      </div>
                    )}

                    {item.parent_notes && (
                      <p className="text-xs text-slate-500 italic mt-1">
                        Catatan Orang Tua: "{item.parent_notes}"
                      </p>
                    )}
                  </div>

                  {/* 5-Pass Check Bubble Dots */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-2 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 mr-1">Ulang:</span>
                    {Array.from({ length: item.target_pass_count }).map((_, idx) => {
                      const isPassed = idx < item.completed_pass_count;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleIncrement(item.id, item.completed_pass_count, item.target_pass_count)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-transform active:scale-90 ${
                            isPassed
                              ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-600'
                              : 'bg-white text-slate-400 border border-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">
                    Progres: <span className="font-extrabold text-emerald-700">{item.completed_pass_count}</span> dari {item.target_pass_count}x Muroja'ah
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tombol Rekam Suara Setoran Anak */}
                    <button
                      onClick={() => setRecordingTargetItem(item)}
                      className={`btn-chunky py-1.5 px-3 text-xs flex items-center gap-1.5 transition-all ${
                        item.audio_record_url 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{item.audio_record_url ? 'Rekam Ulang' : 'Rekam Suara'}</span>
                    </button>

                    {/* Buka Kartu Pelajari Hafalan */}
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsBlindMode(false);
                      }}
                      className="btn-chunky py-1.5 px-3 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pelajari</span>
                    </button>

                    <button
                      onClick={() => handleIncrement(item.id, item.completed_pass_count, item.target_pass_count)}
                      disabled={isCompletedTarget}
                      className={`btn-chunky py-1.5 px-3 text-xs ${
                        isCompletedTarget
                          ? 'bg-slate-100 text-slate-400 border-none cursor-default'
                          : 'btn-chunky-emerald text-xs'
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>{isCompletedTarget ? 'Selesai!' : '+1x'}</span>
                    </button>

                    {item.parent_review_status === 'PENDING' && (
                      <button
                        onClick={() => onClaimReview(item.id)}
                        className="btn-chunky-amber py-1.5 px-3 text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Minta Paraf</span>
                      </button>
                    )}

                    {/* Tombol Hapus Materi */}
                    <button
                      onClick={() => handleDeleteItem(item.id, item.curriculum_title)}
                      title="Hapus materi hafalan"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PEREKAM SUARA SETORAN (Voice Audio Recording Modal) */}
      {recordingTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 shadow-2xl relative border-2 border-emerald-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Mic className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Rekam Suara Setoran Hafalan
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[220px]">
                    {recordingTargetItem.curriculum_title}
                  </p>
                </div>
              </div>
              <button onClick={cancelRecording} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recite Helper Box */}
            <div className="my-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
              <span className="text-[10px] font-black uppercase text-emerald-800 block mb-1">
                Lafazkan dengan Jelas & Tartil:
              </span>
              <p className="font-arabic text-lg text-emerald-950 font-bold leading-loose">
                {recordingTargetItem.arabic_text || 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ'}
              </p>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {/* Timer & Pulsing Wave Indicator */}
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="font-mono text-2xl font-black text-slate-800">
                  {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                  {String(recordingSeconds % 60).padStart(2, '0')}
                </span>
              </div>

              {/* Record / Stop Action Button */}
              {!recordedAudioUrl ? (
                isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  >
                    <Square className="w-7 h-7 fill-white" />
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-chunky-emerald active:scale-95 transition-all"
                  >
                    <Mic className="w-8 h-8" />
                  </button>
                )
              ) : (
                /* Audio Preview Player */
                <div className="w-full space-y-2">
                  <div className="text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Rekaman Berhasil Disimpan ({recordingSeconds} detik)</span>
                  </div>
                  <audio controls src={recordedAudioUrl} className="w-full h-10 rounded-xl" />
                </div>
              )}

              <p className="text-xs text-slate-500 text-center font-medium">
                {isRecording 
                  ? 'Sedang merekam suara... Bacakan hafalanmu sekarang lalu klik kotak merah jika selesai.' 
                  : recordedAudioUrl 
                  ? 'Dengarkan hasil rekamanmu di atas sebelum dikirim ke orang tua.'
                  : 'Klik tombol mikrofon hijau untuk mulai merekam setoranmu.'}
              </p>

              {/* Error / Fallback Button */}
              {recordingError && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-center space-y-2">
                  <p>{recordingError}</p>
                  <button
                    type="button"
                    onClick={handleUseSimulatedAudio}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    Gunakan Rekaman Contoh (Simulasi)
                  </button>
                </div>
              )}
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={cancelRecording}
                className="btn-chunky-ghost py-2 px-3 text-xs"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                {recordedAudioUrl && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-chunky py-2 px-3 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulang</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!recordedAudioUrl}
                  onClick={handleSaveAudioToItem}
                  className={`btn-chunky py-2 px-4 text-xs flex items-center gap-1.5 ${
                    recordedAudioUrl 
                      ? 'btn-chunky-emerald shadow-chunky-emerald' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Setoran ke Orang Tua</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Hadis / Doa Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-800">
                  Tambah Materi Hafalan Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Judul Materi Hafalan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hadis Larangan Mencela Makanan"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Kategori Materi *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CurriculumCategory)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="HADITH">📜 Hadis Nabi</option>
                    <option value="DOA">🤲 Doa Harian</option>
                    <option value="QURAN">📖 Al-Qur'an (Surat/Ayat)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Tingkat Kelas SD *</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value={1}>Kelas 1 SD</option>
                    <option value={2}>Kelas 2 SD</option>
                    <option value={3}>Kelas 3 SD</option>
                    <option value={4}>Kelas 4 SD</option>
                    <option value={5}>Kelas 5 SD</option>
                    <option value={6}>Kelas 6 SD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Teks Arab / Matan (Uthmani)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="مَا عَابَ رَسُولُ اللَّهِ ﷺ طَعَامًا قَطُّ..."
                  value={formArabic}
                  onChange={(e) => setFormArabic(e.target.value)}
                  className="w-full text-sm font-arabic p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Teks Transliterasi Latin</label>
                <input
                  type="text"
                  placeholder="Maa 'aaba rasuulullaahi tholaaman qatthu..."
                  value={formLatin}
                  onChange={(e) => setFormLatin(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Arti / Terjemahan Bahasa Indonesia</label>
                <textarea
                  rows={2}
                  placeholder="Rasulullah ﷺ tidak pernah mencela makanan sama sekali..."
                  value={formTranslation}
                  onChange={(e) => setFormTranslation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Sumber / Perawi</label>
                  <input
                    type="text"
                    placeholder="Contoh: HR. Bukhari no. 5409"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Target Muroja'ah (Ulangan)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formTargetPass}
                    onChange={(e) => setFormTargetPass(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-chunky-ghost py-2 px-4 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-chunky-emerald py-2 px-5 text-xs shadow-chunky-emerald"
                >
                  Simpan ke Kurikulum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pelajari & Latih Lafaz */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-4xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {selectedItem.category === 'HADITH' ? 'Hafalan Hadis Shahih' : selectedItem.category === 'DOA' ? 'Doa Harian' : 'Al-Qur\'an'}
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-1">
                  {selectedItem.curriculum_title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  if (isSpeaking) window.speechSynthesis.cancel();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const hadith = selectedItem.category === 'HADITH' 
                ? getHadithDetail(selectedItem.curriculum_item_id)
                : null;
              
              const arabicMatan = selectedItem.arabic_text || (hadith ? hadith.arabic_matan : 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ');
              const latin = selectedItem.latin_text || (hadith ? hadith.latin_text : 'Bismillaahir-rahmaanir-rahiim');
              const arti = selectedItem.translation || (hadith ? hadith.translation : 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.');
              const source = selectedItem.source || (hadith ? hadith.source : 'Sumber Terverifikasi');

              return (
                <div className="mt-4 space-y-4">
                  {/* Top Control: Blind Mode & Audio */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsBlindMode(!isBlindMode)}
                      className={`btn-chunky py-1.5 px-3 text-xs ${
                        isBlindMode 
                          ? 'bg-amber-500 text-white border-amber-700' 
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {isBlindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isBlindMode ? 'Buka Teks (Intip)' : 'Blind Mode'}</span>
                    </button>

                    <button
                      onClick={() => handlePlayAudio(arabicMatan)}
                      className="btn-chunky py-1.5 px-3 text-xs bg-emerald-600 text-white border-b-4 border-emerald-800 active:border-b-0"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-amber-300' : ''}`} />
                      <span>{isSpeaking ? 'Membacakan...' : 'Dengar Pelafalan'}</span>
                    </button>
                  </div>

                  {/* Arabic Matan Box */}
                  <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl shadow-sm text-center relative overflow-hidden">
                    {isBlindMode ? (
                      <div className="py-8 text-emerald-100 font-bold text-sm">
                        🙈 Teks Arab disembunyikan. Coba lafazkan hafalanmu sekarang!
                      </div>
                    ) : (
                      <p className="text-2xl sm:text-3xl font-arabic font-normal tracking-wide leading-loose drop-shadow-sm py-2">
                        {arabicMatan}
                      </p>
                    )}
                  </div>

                  {/* Latin Text */}
                  {latin && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Teks Latin:</span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 italic">
                        "{latin}"
                      </p>
                    </div>
                  )}

                  {/* Translation */}
                  <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 block mb-0.5">Arti / Terjemahan:</span>
                    <p className="text-xs sm:text-sm font-medium text-amber-950">
                      "{arti}"
                    </p>
                    <span className="block text-[11px] font-bold text-amber-800 mt-1">
                      — Sumber: {source}
                    </span>
                  </div>

                  {/* Audio Recording Section Inside Modal */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-extrabold text-emerald-900 block">🎙️ Setoran Suara Anak:</span>
                      <span className="text-[11px] text-emerald-700">
                        {selectedItem.audio_record_url 
                          ? `Tersedia rekaman (${selectedItem.audio_duration || 15} detik)` 
                          : 'Belum ada rekaman suara untuk materi ini.'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const target = selectedItem;
                        setSelectedItem(null);
                        setRecordingTargetItem(target);
                      }}
                      className="btn-chunky py-1.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-sm"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{selectedItem.audio_record_url ? 'Rekam Ulang' : 'Mulai Rekam'}</span>
                    </button>
                  </div>

                  {/* Action Inside Modal */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-500">
                      Setoran: <span className="text-emerald-700">{selectedItem.completed_pass_count}</span>/{selectedItem.target_pass_count}x
                    </div>
                    <button
                      onClick={() => {
                        handleIncrement(selectedItem.id, selectedItem.completed_pass_count, selectedItem.target_pass_count);
                        setSelectedItem({
                          ...selectedItem,
                          completed_pass_count: selectedItem.completed_pass_count + 1
                        });
                      }}
                      className="btn-chunky-emerald py-2 px-5 text-xs shadow-chunky-emerald"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>Lancar 1x (+1 Muroja'ah)</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
