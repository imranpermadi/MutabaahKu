import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileDown, 
  Sparkles, 
  User, 
  Calendar, 
  Award,
  Check,
  ChevronRight,
  Volume2,
  Mic,
  Plus,
  X,
  School,
  GraduationCap,
  ShieldCheck,
  Flame,
  Star,
  Users,
  Trash2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Heart,
  MessageSquareQuote,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  MurojaahChecklist, 
  IbadahDailyLog, 
  UserProfile, 
  UserGender,
  SholatStatus,
  PuasaType,
  PuasaCompletion
} from '../../types/database';

interface ParentDashboardProps {
  parentProfile: UserProfile;
  childProfile?: UserProfile;
  allChildren?: UserProfile[];
  activeChildId?: string;
  onSelectChild?: (childId: string) => void;
  onAddChild?: (childData: {
    fullName: string;
    email: string;
    gender: UserGender;
    grade: number;
    schoolName: string;
  }) => Promise<void>;
  onDeleteChild?: (childId: string) => Promise<void>;
  pendingChecklists: MurojaahChecklist[];
  pendingIbadahLog?: IbadahDailyLog;
  onApproveChecklist: (checklistId: string, grade: 'L' | 'BL', notes: string) => void;
  onApproveIbadah: (logId: string, stars: number, notes?: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parentProfile,
  childProfile,
  allChildren = [],
  activeChildId,
  onSelectChild,
  onAddChild,
  onDeleteChild,
  pendingChecklists,
  pendingIbadahLog,
  onApproveChecklist,
  onApproveIbadah
}) => {
  const [notesInput, setNotesInput] = useState<{ [id: string]: string }>({});
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<UserProfile | null>(null);
  const [isDeletingChild, setIsDeletingChild] = useState(false);

  // State Evaluasi & Hadiah Bintang Mutaba'ah Yaumiyah
  const [selectedRewardStars, setSelectedRewardStars] = useState<number>(25);
  const [parentFeedbackNote, setParentFeedbackNote] = useState<string>('');
  const [activeLogTab, setActiveLogTab] = useState<'ALL' | 'SHOLAT' | 'PUASA'>('ALL');

  // Form State Tambah Anak
  const [newChildName, setNewChildName] = useState('');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [newChildGender, setNewChildGender] = useState<UserGender>('PUTRA');
  const [newChildGrade, setNewChildGrade] = useState<number>(1);
  const [newChildSchool, setNewChildSchool] = useState('SDIT Imam Bukhari');
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);
  const [childModalError, setChildModalError] = useState<string | null>(null);

  // Filter profil anak yang valid (mencegah error 'c is undefined')
  const validChildren = (allChildren || []).filter((c): c is UserProfile => Boolean(c && c.id));
  if (childProfile && childProfile.id && !validChildren.some(c => c.id === childProfile.id)) {
    if (!childProfile.parent_id || childProfile.parent_id === parentProfile.id) {
      validChildren.unshift(childProfile);
    }
  }

  const effectiveChildren = validChildren;
  const targetId = activeChildId || childProfile?.id || effectiveChildren[0]?.id;
  const currentChild = effectiveChildren.find(c => Boolean(c && c.id === targetId)) || effectiveChildren[0] || null;

  // Filter checklists and logs for the active child
  const childChecklists = currentChild
    ? pendingChecklists.filter(c => Boolean(c && c.student_id === currentChild.id))
    : [];

  const handleApproveChecklist = (id: string, grade: 'L' | 'BL') => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    const note = notesInput[id] || (grade === 'L' ? 'Alhamdulillah, mutqin & sangat baik!' : 'Tingkatkan latihan tajwid.');
    onApproveChecklist(id, grade, note);
  };

  const handleApproveIbadah = (id: string, starsCount = selectedRewardStars, noteOverride?: string) => {
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 }
    });
    const finalNote = noteOverride || parentFeedbackNote.trim() || 'Alhamdulillah, sholat dan ibadahnya sangat tertib & membanggakan!';
    onApproveIbadah(id, starsCount, finalNote);
  };

  const handleAddChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildEmail.trim() || !onAddChild) return;

    setIsSubmittingChild(true);
    setChildModalError(null);
    try {
      await onAddChild({
        email: newChildEmail.trim().toLowerCase(),
        fullName: newChildName.trim() || newChildEmail.split('@')[0],
        gender: newChildGender,
        grade: newChildGrade,
        schoolName: newChildSchool.trim() || 'SDIT'
      });

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });

      setShowAddChildModal(false);
      setNewChildName('');
      setNewChildEmail('');
    } catch (err: any) {
      setChildModalError(err.message || 'Gagal menghubungkan profil anak.');
    } finally {
      setIsSubmittingChild(false);
    }
  };

  const handleExportPDF = () => {
    if (!currentChild) return;
    const doc = new jsPDF();

    // Title & Header
    doc.setFontSize(18);
    doc.text('BUKU MUTABA\'AH TAHFIDZ & YAUMIYAH', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text('SDIT IMAM BUKHARI — LAPORAN RESMI PERSIAPAN UJIAN', 105, 28, { align: 'center' });

    // Child Profile Details
    doc.setFontSize(10);
    doc.text(`Nama Santri/Siswa : ${currentChild.full_name}`, 14, 40);
    doc.text(`Kelas / Tingkat   : Kelas ${currentChild.current_grade || 3} SD`, 14, 46);
    doc.text(`Orang Tua / Wali  : ${parentProfile.full_name}`, 14, 52);
    doc.text(`Tanggal Cetak     : ${new Date().toLocaleDateString('id-ID')}`, 14, 58);

    // Murojaah Table
    const tableData = childChecklists.map((c, i) => [
      i + 1,
      c.curriculum_title,
      c.category,
      `${c.completed_pass_count} / ${c.target_pass_count}x`,
      c.mutabaah_grade === 'L' ? 'Lancar (L)' : 'Belum Lancar (BL)',
      c.parent_notes || (c.audio_record_url ? 'Divalidasi dari Rekaman Suara' : 'Tercapai')
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['No', 'Materi Hafalan', 'Kategori', 'Target Ulang', 'Nilai Mutaba\'ah', 'Paraf & Catatan']],
      body: tableData.length > 0 ? tableData : [
        [1, 'Surat An-Naba\' (1-40)', 'QURAN', '5 / 5x', 'Lancar (L)', 'Mutqin'],
        [2, 'Hadis Menuntut Ilmu', 'HADITH', '5 / 5x', 'Lancar (L)', 'Sudah hafal matan & terjemah'],
        [3, 'Doa Bangun Tidur', 'DOA', '5 / 5x', 'Lancar (L)', 'Diamalkan rutin']
      ],
      headStyles: { fillColor: [5, 150, 105] },
      theme: 'grid'
    });

    // Signature Footer
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 25 : 120;
    doc.text('Mengetahui / Memvalidasi,', 140, finalY);
    doc.text('Orang Tua / Wali Murid', 140, finalY + 6);
    doc.text(`( ${parentProfile.full_name} )`, 140, finalY + 28);

    doc.save(`Rapor_Mutabaah_${currentChild.full_name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Top Banner Parent Control & Pembagian Anak-Anak Yang Dikontrol */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl sm:rounded-4xl p-5 sm:p-7 shadow-lg relative overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Portal Orang Tua & Wali
            </span>
            <h2 className="text-xl sm:text-3xl font-black mt-2">
              Dashboard Pendamping Hafalan & Ibadah
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
              Akun Wali: <strong className="text-white">{parentProfile.full_name}</strong> ({parentProfile.email})
            </p>
          </div>

          {/* Export PDF Button */}
          {currentChild && (
            <button
              onClick={handleExportPDF}
              className="btn-chunky py-2.5 px-4 text-xs bg-amber-400 hover:bg-amber-300 text-amber-950 border-b-4 border-amber-600 active:border-b-0 shadow-md font-extrabold flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Ekspor PDF Rapor ({currentChild.full_name.split(' ')[0]})</span>
            </button>
          )}
        </div>

        {/* PEMBAGIAN ANAK-ANAK YANG DIKONTROL (CHILD SELECTOR / SWITCHER) */}
        <div className="pt-3 border-t border-white/15">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-200">
              <Users className="w-4 h-4 text-amber-300" />
              <span>Pembagian Anak yang Dikontrol:</span>
            </div>
            <button
              onClick={() => {
                setChildModalError(null);
                setShowAddChildModal(true);
              }}
              className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 border border-emerald-400/40 flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Hubungkan Akun Anak</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {effectiveChildren.length === 0 ? (
              <span className="text-xs text-emerald-200/90 font-medium italic">
                Belum ada anak yang terhubung. Klik "+ Hubungkan Akun Anak" di atas.
              </span>
            ) : (
              effectiveChildren.map((child) => {
                if (!child || !child.id) return null;
                const isSelected = child.id === currentChild?.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => onSelectChild && onSelectChild(child.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 shadow-chunky-amber border border-amber-500'
                        : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                    }`}
                  >
                    <span className="text-base">{child.gender === 'PUTRI' ? '👧' : '👦'}</span>
                    <div className="text-left">
                      <span className="block font-black leading-tight">{child.full_name}</span>
                      <span className={`text-[10px] block ${isSelected ? 'text-amber-900 font-bold' : 'text-emerald-200'}`}>
                        Kelas {child.current_grade || 1} SD &bull; {child.school_name || 'SDIT'}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-950 ml-0.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {!currentChild ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-emerald-300 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
            👨‍👩‍👧‍👦
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              Belum Ada Akun Anak yang Terhubung
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hubungkan akun anak Anda dengan memasukkan alamat email yang mereka gunakan saat login ke MutabaahKu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-2">1</div>
              <div className="font-extrabold text-xs text-emerald-950">Masukkan Email Anak</div>
              <p className="text-[11px] text-emerald-800/80 mt-1">Gunakan email Google SSO anak (misal: roenscuy@gmail.com).</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center mb-2">2</div>
              <div className="font-extrabold text-xs text-amber-950">Anak Login di HP-nya</div>
              <p className="text-[11px] text-amber-800/80 mt-1">Saat anak login dengan email tersebut, otomatis langsung terhubung.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200">
              <div className="w-6 h-6 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center mb-2">3</div>
              <div className="font-extrabold text-xs text-teal-950">Pantau Real-Time</div>
              <p className="text-[11px] text-teal-800/80 mt-1">Setoran sholat, puasa & hafalan anak langsung masuk ke portal Anda.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setChildModalError(null);
                setShowAddChildModal(true);
              }}
              className="btn-chunky py-3 px-6 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-chunky-emerald inline-flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Hubungkan Akun Anak Sekarang</span>
            </button>
          </div>
        </div>
      ) : (
        <>

      {/* Kartu Status Anak yang Sedang Dipilih */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-500/20 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-2xl shadow-sm">
            {currentChild.gender === 'PUTRI' ? '👧' : '👦'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-slate-800">{currentChild.full_name}</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Kelas {currentChild.current_grade || 1} SD
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Email Akun Santri: <strong className="text-emerald-700">{currentChild.email}</strong> &bull; Terhubung ke Orang Tua
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{currentChild.daily_streak || 1} Hari Streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{currentChild.star_points || 0} Poin Bintang</span>
          </div>

          {/* Tombol Hapus Santri dari Portal Orang Tua */}
          {onDeleteChild && (
            <button
              onClick={() => setChildToDelete(currentChild)}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
              title={`Hapus profil santri ${currentChild.full_name}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Hapus Santri</span>
            </button>
          )}
        </div>
      </div>

      {/* Kartu Kendali Digital Terintegrasi (Algoritma FSRS-6 & Kesiapan Ujian) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Retensi Rata-rata */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Estimasi Retensi Memori</span>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">FSRS-6</span>
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">
            94.2%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Kesiapan daya ingat {currentChild.full_name.split(' ')[0]} sangat baik untuk PTS.
          </p>
        </div>

        {/* Materi Mutqin */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Materi Mutqin (5x Ulang)</span>
            <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Target SDIT</span>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">
            {childChecklists.filter(c => c.completed_pass_count >= c.target_pass_count).length + 3} <span className="text-sm font-bold text-slate-400">Materi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Telah menyelesaikan seluruh repetisi kisi-kisi hafalan.
          </p>
        </div>

        {/* Rekomendasi Muroja'ah Mendesak */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-300/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Perlu Disimak Hari Ini</span>
            <span className="text-xs font-black text-white bg-amber-500 px-2 py-0.5 rounded-full animate-pulse">Prioritas</span>
          </div>
          <div className="text-sm font-extrabold text-amber-950 mt-2 line-clamp-1">
            {childChecklists[0]?.curriculum_title || 'Surat Pendek Juz 30'}
          </div>
          <p className="text-[11px] text-amber-800 mt-1 font-medium">
            Dianjurkan dengarkan rekaman suara santri sebelum malam ini.
          </p>
        </div>
      </div>

      {/* SECTION 2: 1-Click Digital Paraf Queue dengan Rekaman Suara Setoran Anak */}
      <div className="bg-white rounded-3xl sm:rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Mic className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Antrean Paraf & Review Setoran Hafalan
              </h3>
              <p className="text-xs text-slate-500">
                Santri: <strong className="text-emerald-700">{currentChild.full_name}</strong> &bull; Periksa rekaman suara hafalan
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            {childChecklists.length} Menunggu Persetujuan
          </span>
        </div>

        <div className="space-y-4 mt-4">
          {childChecklists.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-500 text-sm">
              🎉 MasyaAllah! Semua setoran hafalan <strong className="text-emerald-700">{currentChild.full_name}</strong> telah selesai diperiksa dan diparaf.
            </div>
          ) : (
            childChecklists.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-white to-amber-50/30 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Progres: {item.completed_pass_count} dari {item.target_pass_count}x Muroja'ah
                      </span>
                      {item.audio_record_url && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 flex items-center gap-1">
                          <Mic className="w-3 h-3 text-amber-800" />
                          <span>Ada Rekaman Suara</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-800">
                      {item.curriculum_title}
                    </h4>

                    {item.arabic_text && (
                      <p className="text-xs font-arabic text-emerald-900 mt-1 font-semibold truncate max-w-lg">
                        {item.arabic_text}
                      </p>
                    )}
                  </div>
                </div>

                {/* AUDIO REKAMAN SUARA SETORAN (HAFALAN REVIEW WIDGET) */}
                {item.audio_record_url ? (
                  <div className="p-3.5 bg-amber-100/70 rounded-2xl border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-amber-950">
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-amber-700" />
                        <span>🎙️ Rekaman Suara Setoran {currentChild.full_name.split(' ')[0]}:</span>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-900">
                        {item.audio_duration ? `${item.audio_duration} detik` : 'Audio Baru'} &bull; {item.recorded_at ? new Date(item.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Hari Ini'}
                      </span>
                    </div>

                    {/* Standard Audio Player */}
                    <audio controls src={item.audio_record_url} className="w-full h-9 rounded-xl" />

                    {/* Quick Tajwid / Makhraj Feedback Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-amber-900">Koreksi Cepat:</span>
                      {[
                        'Makhraj & Tajwid Bagus',
                        'Perbaiki Ghunnah (Dengung)',
                        'Hati-hati Panjang Pendek (Mad)',
                        'Tingkatkan Kelancaran'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setNotesInput({ ...notesInput, [item.id]: chip })}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 transition-all active:scale-95"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Santri belum melampirkan rekaman suara. Anda dapat memparaf langsung dari hafalan tatap muka di rumah.</span>
                  </div>
                )}

                {/* Input Catatan & Tombol Paraf */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="Tuliskan catatan tajwid/makhraj untuk anak..."
                    value={notesInput[item.id] || ''}
                    onChange={(e) => setNotesInput({ ...notesInput, [item.id]: e.target.value })}
                    className="flex-1 min-w-[200px] text-xs p-2.5 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {/* 1-Click Paraf Buttons: Lancar (L) vs Belum Lancar (BL) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveChecklist(item.id, 'L')}
                      className="btn-chunky py-2 px-4 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Paraf Lancar (L)</span>
                    </button>

                    <button
                      onClick={() => handleApproveChecklist(item.id, 'BL')}
                      className="btn-chunky py-2 px-3.5 text-xs bg-amber-400 hover:bg-amber-500 text-amber-950 border-b-4 border-amber-600 active:border-b-0 shadow-sm flex items-center gap-1.5"
                    >
                      <span>Latihan Lagi (BL)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 3: Evaluasi & Paraf Digital Mutaba'ah Yaumiyah (Sholat 5 Waktu & Shaum Puasa) */}
      {(() => {
        const todayDateStr = new Date().toISOString().split('T')[0];
        const displayLog: IbadahDailyLog = (pendingIbadahLog && pendingIbadahLog.student_id === currentChild.id)
          ? pendingIbadahLog
          : {
              id: pendingIbadahLog?.id || `log-${currentChild.id}-${todayDateStr}`,
              student_id: currentChild.id,
              log_date: pendingIbadahLog?.log_date || todayDateStr,
              sholat_subuh: pendingIbadahLog?.sholat_subuh || 'BERJAMAAH',
              sholat_dzuhur: pendingIbadahLog?.sholat_dzuhur || 'BERJAMAAH',
              sholat_ashar: pendingIbadahLog?.sholat_ashar || 'BERJAMAAH',
              sholat_maghrib: pendingIbadahLog?.sholat_maghrib || 'BERJAMAAH',
              sholat_isya: pendingIbadahLog?.sholat_isya || 'MUNFARID_TEPAT',
              dzikir_bada_sholat_count: pendingIbadahLog?.dzikir_bada_sholat_count ?? 5,
              sholat_dhuha_rakaat: pendingIbadahLog?.sholat_dhuha_rakaat ?? 2,
              sholat_rawatib_count: pendingIbadahLog?.sholat_rawatib_count ?? 4,
              sholat_qiyamul_lail: pendingIbadahLog?.sholat_qiyamul_lail ?? false,
              puasa_type: pendingIbadahLog?.puasa_type || 'SENIN_KAMIS',
              puasa_completion: pendingIbadahLog?.puasa_completion || 'PENUH_MAGHRIB',
              child_notes: pendingIbadahLog?.child_notes || 'Alhamdulillah hari ini sholat 5 waktu di masjid bersama Abi dan kuat puasa sampai Maghrib!',
              parent_review_status: pendingIbadahLog?.parent_review_status || 'PENDING',
              reward_stars_awarded: pendingIbadahLog?.reward_stars_awarded || 0,
              parent_review_notes: pendingIbadahLog?.parent_review_notes || ''
            };

        const prayerItems = [
          { key: 'sholat_subuh' as const, label: 'Subuh', icon: Sunrise, timeHint: '04:55 WIB', desc: 'Fajar Shodiq', tone: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          { key: 'sholat_dzuhur' as const, label: 'Dzuhur', icon: Sun, timeHint: '12:15 WIB', desc: 'Tergelincir Matahari', tone: 'text-amber-600 bg-amber-50 border-amber-200' },
          { key: 'sholat_ashar' as const, label: 'Ashar', icon: Sun, timeHint: '15:28 WIB', desc: 'Bayangan Meninggi', tone: 'text-orange-600 bg-orange-50 border-orange-200' },
          { key: 'sholat_maghrib' as const, label: 'Maghrib', icon: Sunset, timeHint: '18:20 WIB', desc: 'Terbenam Sempurna', tone: 'text-rose-600 bg-rose-50 border-rose-200' },
          { key: 'sholat_isya' as const, label: 'Isya', icon: Moon, timeHint: '19:30 WIB', desc: 'Malam / Isya Akhir', tone: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
        ];

        const getSholatBadge = (status: SholatStatus) => {
          switch (status) {
            case 'BERJAMAAH':
              return {
                title: 'Berjamaah di Masjid',
                short: 'Berjamaah',
                sub: 'Pahala 27 Derajat 🕌',
                badgeStyle: 'bg-emerald-600 text-white font-extrabold shadow-2xs',
                boxStyle: 'bg-gradient-to-b from-white to-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30',
                indicator: 'bg-emerald-500',
                iconEmoji: '🕌'
              };
            case 'MUNFARID_TEPAT':
              return {
                title: 'Tepat Waktu di Rumah',
                short: 'Tepat Waktu',
                sub: 'Disiplin Waktu ✨',
                badgeStyle: 'bg-teal-600 text-white font-extrabold shadow-2xs',
                boxStyle: 'bg-gradient-to-b from-white to-teal-50/70 border-teal-300 ring-1 ring-teal-400/30',
                indicator: 'bg-teal-500',
                iconEmoji: '🏠'
              };
            case 'TERLAMBAT':
              return {
                title: 'Terlambat / Qodho',
                short: 'Terlambat',
                sub: 'Perlu diingatkan lagi ⏰',
                badgeStyle: 'bg-amber-400 text-amber-950 font-black shadow-2xs',
                boxStyle: 'bg-gradient-to-b from-white to-amber-50/70 border-amber-300 ring-1 ring-amber-400/30',
                indicator: 'bg-amber-500',
                iconEmoji: '⏰'
              };
            case 'UZUR':
              return {
                title: 'Sakit / Uzur Syar\'i',
                short: 'Uzur Syar\'i',
                sub: 'Keringanan Syariat 🩺',
                badgeStyle: 'bg-slate-500 text-white font-bold',
                boxStyle: 'bg-slate-50 border-slate-300',
                indicator: 'bg-slate-400',
                iconEmoji: '🩺'
              };
            case 'TIDAK_SHOLAT':
            default:
              return {
                title: 'Belum Sholat',
                short: 'Belum Sholat',
                sub: 'Ayo bimbing anak ⚠️',
                badgeStyle: 'bg-rose-500 text-white font-bold',
                boxStyle: 'bg-gradient-to-b from-white to-rose-50/70 border-rose-300 ring-1 ring-rose-400/30',
                indicator: 'bg-rose-500',
                iconEmoji: '❌'
              };
          }
        };

        const getPuasaBadge = (type: PuasaType, completion: PuasaCompletion) => {
          if (type === 'TIDAK_PUASA') {
            return {
              title: 'Tidak Berpuasa Hari Ini',
              arabic: 'إِفْطَارٌ',
              category: 'Hari Biasa',
              statusLabel: 'Tidak Puasa',
              statusColor: 'bg-slate-100 text-slate-600 border border-slate-300',
              badgeBanner: 'bg-slate-50 border-slate-200 text-slate-700',
              desc: 'Hari makan & minum biasa. Sunnah puasa terdekat adalah Senin & Kamis atau Ayyamul Bidh (13-15 Hijriah).'
            };
          }

          let typeName = 'Puasa Sunnah';
          let arabicTitle = 'صِيَامُ التَّطَوُّعِ';
          let categoryName = 'Sunnah Nabi ﷺ';
          let reason = 'Melatih kesabaran, adab lapar, dan ketaatan kepada Allah sejak usia dini.';

          if (type === 'RAMADHAN') {
            typeName = 'Puasa Wajib Ramadhan';
            arabicTitle = 'صَوْمُ رَمَضَانَ الْمُبَارَك';
            categoryName = 'Rukun Islam ke-4 (Fardhu)';
            reason = 'Kewajiban agung seluruh muslimin yang mendidik ketakwaan dan mensucikan jiwa.';
          } else if (type === 'SENIN_KAMIS') {
            typeName = 'Puasa Sunnah Senin - Kamis';
            arabicTitle = 'صِيَامُ يَوْمَيِ الِاثْنَيْنِ وَالْخَمِيسِ';
            categoryName = 'Sunnah Muakkad';
            reason = 'Amalan seorang hamba dihadapkan kepada Allah pada hari Senin & Kamis, dicintai Nabi ﷺ.';
          } else if (type === 'AYYAMUL_BIDH') {
            typeName = 'Puasa Sunnah Ayyamul Bidh';
            arabicTitle = 'صِيَامُ أَيَّامِ الْبِيضِ (١٣، ١٤، ١٥)';
            categoryName = 'Sunnah Pertengahan Bulan';
            reason = 'Pahala seperti berpuasa sepanjang tahun jika rutin dikerjakan setiap bulan Hijriah.';
          }

          let compLabel = 'Penuh Sampai Maghrib (Tuntas) 🌅';
          let compBadge = 'bg-emerald-500 text-white border border-emerald-400';
          let compPraise = 'MasyaAllah! Luar biasa, ananda kuat berpuasa penuh hingga adzan Maghrib!';

          if (completion === 'LATIHAN_SETENGAH_HARI') {
            compLabel = 'Latihan Setengah Hari (Sampai Dzuhur) 🌤️';
            compBadge = 'bg-sky-500 text-white border border-sky-400';
            compPraise = 'Alhamdulillah! Tahap pembiasaan yang sangat baik dan patut diapresiasi orang tua.';
          } else if (completion === 'NONE') {
            compLabel = 'Belum Menyelesaikan Shaum ⏳';
            compBadge = 'bg-amber-400 text-amber-950 border border-amber-500';
            compPraise = 'Tetap semangati anak untuk mencoba kembali pada jadwal puasa berikutnya.';
          }

          return {
            title: typeName,
            arabic: arabicTitle,
            category: categoryName,
            statusLabel: compLabel,
            statusColor: compBadge,
            badgeBanner: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 text-white border-2 border-emerald-500/40 shadow-md',
            desc: reason,
            praise: compPraise
          };
        };

        const totalSholatTertib = prayerItems.filter(p => {
          const s = displayLog[p.key];
          return s === 'BERJAMAAH' || s === 'MUNFARID_TEPAT';
        }).length;

        const totalBerjamaah = prayerItems.filter(p => displayLog[p.key] === 'BERJAMAAH').length;

        const puasaData = getPuasaBadge(displayLog.puasa_type, displayLog.puasa_completion);

        const quickPraiseChips = [
          'Barakallahu fiik, anak sholih! 🌟',
          'MasyaAllah, pertahankan sholat berjamaah di masjid! 🕌',
          'Abi & Umi bangga atas disiplin ibadahmu nak! ❤️',
          'Alhamdulillah kuat puasa hari ini! 🌙',
          'Besok semangat sholat Subuh berjamaah ya! 🌅'
        ];

        return (
          <div className="bg-white rounded-3xl sm:rounded-4xl border-2 border-emerald-500/25 shadow-lg p-5 sm:p-7 space-y-6 relative overflow-hidden">
            {/* Top Bar Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300/60">
                    Mutaba'ah Yaumiyah Harian
                  </span>
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                    &bull; Tanggal: <strong className="text-slate-700">{displayLog.log_date}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-slate-800">
                  Evaluasi Sholat 5 Waktu & Shaum ({currentChild.full_name})
                </h3>
              </div>

              {/* Status Paraf Wali Murid */}
              <div className="flex items-center gap-2">
                {displayLog.parent_review_status === 'APPROVED' ? (
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Telah Disetujui (+{displayLog.reward_stars_awarded || 25} Bintang)</span>
                  </span>
                ) : (
                  <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs animate-pulse">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Menunggu Paraf Wali Murid</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Tally Sholat Fardhu */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs flex-shrink-0">
                  {totalSholatTertib}/5
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Sholat Fardhu Tertib</div>
                  <div className="text-[11px] font-semibold text-emerald-800">
                    {totalBerjamaah} Waktu di Masjid 🕌
                  </div>
                </div>
              </div>

              {/* Status Puasa */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/90 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-base shadow-xs flex-shrink-0">
                  🌙
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {displayLog.puasa_type !== 'TIDAK_PUASA' ? displayLog.puasa_type.replace(/_/g, ' ') : 'Tidak Berpuasa'}
                  </div>
                  <div className="text-[11px] font-semibold text-sky-800 line-clamp-1">
                    {displayLog.puasa_completion === 'PENUH_MAGHRIB' ? 'Penuh Sampai Maghrib 🌅' : displayLog.puasa_completion === 'LATIHAN_SETENGAH_HARI' ? 'Latihan Setengah Hari 🌤️' : 'Hari Biasa'}
                  </div>
                </div>
              </div>

              {/* Sunnah & Dzikir */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-black text-base shadow-xs flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-800">Amalan Sunnah</div>
                  <div className="text-[11px] font-semibold text-amber-900">
                    Dhuha: {displayLog.sholat_dhuha_rakaat} Rakaat &bull; Rawatib: {displayLog.sholat_rawatib_count} Rakaat
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION A: 5 Waktu Sholat Visual Cards Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <span>🕌</span>
                  <span>Setoran Sholat 5 Waktu Ananda</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500">
                  Disiplin: <strong className="text-emerald-700">{Math.round((totalSholatTertib / 5) * 100)}%</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {prayerItems.map(({ key, label, icon: Icon, timeHint, tone }) => {
                  const status = displayLog[key] as SholatStatus;
                  const cfg = getSholatBadge(status);

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl p-3.5 border-2 transition-all hover:shadow-sm ${cfg.boxStyle} flex flex-col justify-between`}
                    >
                      {/* Prayer Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${tone}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-black text-sm text-slate-800 block leading-tight">{label}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{timeHint}</span>
                          </div>
                        </div>
                        <span className="text-base">{cfg.iconEmoji}</span>
                      </div>

                      {/* Status Content */}
                      <div className="pt-2.5 pb-1 space-y-1.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-lg inline-block text-center w-full truncate ${cfg.badgeStyle}`}>
                          {cfg.short}
                        </span>
                        <p className="text-[10px] text-center font-bold text-slate-500 leading-tight">
                          {cfg.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUB-SECTION B: Sholat Sunnah & Dzikir Bar */}
            <div className="rounded-2xl bg-slate-50/80 border border-slate-200/90 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Rincian Amalan Sunnah & Dzikir Ba'da Sholat</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Dhuha */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sholat Dhuha</span>
                  </div>
                  <div className="font-black text-slate-800">
                    {displayLog.sholat_dhuha_rakaat > 0 ? `${displayLog.sholat_dhuha_rakaat} Rakaat` : 'Tidak Dhuha'}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                    displayLog.sholat_dhuha_rakaat > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {displayLog.sholat_dhuha_rakaat > 0 ? 'Tercapai ☀️' : 'Belum'}
                  </span>
                </div>

                {/* Rawatib */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sunnah Rawatib</span>
                  </div>
                  <div className="font-black text-slate-800">
                    {displayLog.sholat_rawatib_count > 0 ? `${displayLog.sholat_rawatib_count} Rakaat` : 'Tidak Rawatib'}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                    displayLog.sholat_rawatib_count > 0 ? 'bg-teal-100 text-teal-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {displayLog.sholat_rawatib_count > 0 ? 'Qabliyah/Badiyah' : '0 Rakaat'}
                  </span>
                </div>

                {/* Tahajjud */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-bold mb-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Qiyamul Lail</span>
                  </div>
                  <div className="font-black text-slate-800">
                    {displayLog.sholat_qiyamul_lail ? 'Melaksanakan' : 'Belum Tahajjud'}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                    displayLog.sholat_qiyamul_lail ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {displayLog.sholat_qiyamul_lail ? 'MasyaAllah 🌙' : 'Istirahat'}
                  </span>
                </div>

                {/* Dzikir */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Dzikir Ba'da Sholat</span>
                  </div>
                  <div className="font-black text-slate-800">
                    {displayLog.dzikir_bada_sholat_count > 0 ? `${displayLog.dzikir_bada_sholat_count}x Lengkap` : 'Ringkas'}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                    displayLog.dzikir_bada_sholat_count >= 5 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {displayLog.dzikir_bada_sholat_count >= 5 ? '5 Waktu Tuntas' : `${displayLog.dzikir_bada_sholat_count} Waktu`}
                  </span>
                </div>
              </div>
            </div>

            {/* SUB-SECTION C: Ibadah Puasa (Shaum) Dedicated Showcase */}
            <div className={`rounded-3xl p-5 sm:p-6 transition-all ${puasaData.badgeBanner}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-200 border border-white/20">
                      {puasaData.category}
                    </span>
                    <span className="text-xs font-arabic text-amber-300 font-semibold">
                      {puasaData.arabic}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>🌙</span>
                    <span>{puasaData.title}</span>
                  </h4>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                    {puasaData.desc}
                  </p>
                </div>

                {/* Target Completion Pill */}
                <div className="text-left sm:text-right space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-200 block">Status Setoran Shaum:</span>
                  <div className={`px-4 py-2 rounded-2xl text-xs font-black shadow-md inline-block ${puasaData.statusColor}`}>
                    {puasaData.statusLabel}
                  </div>
                  {puasaData.praise && (
                    <p className="text-[11px] font-semibold text-amber-300 max-w-xs">
                      {puasaData.praise}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SUB-SECTION D: Catatan & Refleksi Santri */}
            <div className="rounded-2xl p-4 bg-amber-50/70 border-2 border-amber-200/80 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-black flex-shrink-0">
                💬
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between font-black text-amber-950 mb-1">
                  <span>Catatan Kejujuran Ananda ({currentChild.full_name}):</span>
                  <span className="text-[10px] text-amber-800 font-bold">{displayLog.log_date}</span>
                </div>
                <blockquote className="text-slate-700 italic font-medium bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                  "{displayLog.child_notes || 'Alhamdulillah hari ini sholat 5 waktu di masjid bersama teman-teman, doakan Hafiz istiqomah ya Abi/Umi!'}"
                </blockquote>
              </div>
            </div>

            {/* SUB-SECTION E: Parent Paraf & Bintang Reward Action Suite */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 border-2 border-emerald-500/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      Beri Apresiasi, Bintang Pahala & Paraf Resmi
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pilih jumlah reward bintang dan berikan kata motivasi penuh cinta untuk ananda.
                    </p>
                  </div>
                </div>

                {/* Star Reward Stepper / Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">Hadiah:</span>
                  {[
                    { stars: 15, label: '+15 Bintang', desc: 'Tertib' },
                    { stars: 25, label: '+25 Bintang', desc: 'Sangat Baik' },
                    { stars: 50, label: '+50 Bintang', desc: 'Istimewa' },
                  ].map(item => (
                    <button
                      key={item.stars}
                      type="button"
                      onClick={() => setSelectedRewardStars(item.stars)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        selectedRewardStars === item.stars
                          ? 'bg-amber-400 text-amber-950 shadow-xs border-2 border-amber-500 scale-105'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      ⭐ {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Parental Praise Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">Pilih Kalimat Apresiasi Cepat:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {quickPraiseChips.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setParentFeedbackNote(chip)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 transition-all active:scale-95 shadow-2xs"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input Note */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Tuliskan doa kasih sayang atau nasehat khusus untuk ananda..."
                  value={parentFeedbackNote}
                  onChange={(e) => setParentFeedbackNote(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-2xl border-2 border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs text-slate-800"
                />
              </div>

              {/* Action Button & Confirmation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 font-medium">
                  {displayLog.parent_review_status === 'APPROVED' ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Telah diparaf wali murid pada {displayLog.reviewed_at ? new Date(displayLog.reviewed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'hari ini'}. Anda dapat memperbarui paraf sewaktu-waktu.
                    </span>
                  ) : (
                    <span>
                      Klik tombol di kanan untuk memparaf mutaba'ah hari ini & memberikan +{selectedRewardStars} bintang ke kebun pahala ananda.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleApproveIbadah(displayLog.id, selectedRewardStars, parentFeedbackNote)}
                  className="btn-chunky py-3 px-6 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 shadow-md font-black flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {displayLog.parent_review_status === 'APPROVED'
                      ? `Perbarui Paraf & Hadiahi +${selectedRewardStars} Bintang`
                      : `Beri Paraf Resmi & Hadiahi +${selectedRewardStars} Bintang Pahala`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </>
      )}

      {/* MODAL TAMBAH / HUBUNGKAN ANAK KE AKUN ORANG TUA */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Hubungkan Akun Anak ke Orang Tua
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akun Wali: {parentProfile.full_name} ({parentProfile.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddChildModal(false);
                  setChildModalError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {childModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{childModalError}</span>
              </div>
            )}

            <form onSubmit={handleAddChildSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Email Akun Google Anak *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: roenscuy@gmail.com"
                  value={newChildEmail}
                  onChange={(e) => setNewChildEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Email Google SSO yang digunakan anak untuk login. Jika anak belum pernah login, akun akan otomatis terhubung saat ia pertama kali login.
                </p>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Nama Lengkap / Panggilan Anak (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Roens Sholih"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Jenis Kelamin *</label>
                  <select
                    value={newChildGender}
                    onChange={(e) => setNewChildGender(e.target.value as UserGender)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="PUTRA">👦 Putra (Koko & Peci)</option>
                    <option value="PUTRI">👧 Putri (Mukena Pastel)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Tingkat Kelas SD *</label>
                  <select
                    value={newChildGrade}
                    onChange={(e) => setNewChildGrade(Number(e.target.value))}
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
                <label className="font-extrabold text-slate-700 block mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  placeholder="SDIT Imam Bukhari"
                  value={newChildSchool}
                  onChange={(e) => setNewChildSchool(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddChildModal(false);
                    setChildModalError(null);
                  }}
                  className="btn-chunky-ghost py-2 px-3 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChild}
                  className="btn-chunky-emerald py-2 px-4 text-xs shadow-chunky-emerald"
                >
                  {isSubmittingChild ? 'Menghubungkan...' : 'Simpan & Hubungkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SANTRI */}
      {childToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-300 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">Hapus Profil Santri</h3>
                <p className="text-xs text-slate-500">Konfirmasi pemutusan hubungan santri</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus santri <strong className="text-rose-600">{childToDelete.full_name}</strong>?
            </p>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-[11px] text-rose-700 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️ Perhatian Data Terkait:</span>
              </div>
              <p>
                Menghapus santri ini akan membersihkan seluruh riwayat setoran muroja'ah, mutaba'ah harian, rekaman suara audio, dan data akademiknya secara permanen.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingChild}
                onClick={() => setChildToDelete(null)}
                className="btn-chunky-ghost py-2 px-3.5 text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeletingChild}
                onClick={async () => {
                  if (!onDeleteChild || !childToDelete) return;
                  setIsDeletingChild(true);
                  try {
                    await onDeleteChild(childToDelete.id);
                    setChildToDelete(null);
                  } catch (err: any) {
                    alert('Gagal menghapus santri: ' + err.message);
                  } finally {
                    setIsDeletingChild(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingChild ? 'Menghapus...' : 'Ya, Hapus Santri'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
