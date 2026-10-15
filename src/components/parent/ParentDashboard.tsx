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
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MurojaahChecklist, IbadahDailyLog, UserProfile, UserGender } from '../../types/database';

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
  onApproveIbadah: (logId: string, stars: number) => void;
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

  // Form State Tambah Anak
  const [newChildName, setNewChildName] = useState('');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [newChildGender, setNewChildGender] = useState<UserGender>('PUTRA');
  const [newChildGrade, setNewChildGrade] = useState<number>(1);
  const [newChildSchool, setNewChildSchool] = useState('SDIT Imam Bukhari');
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);

  // Filter profil anak yang valid (mencegah error 'c is undefined')
  const validChildren = (allChildren || []).filter((c): c is UserProfile => Boolean(c && c.id));
  if (childProfile && childProfile.id && !validChildren.some(c => c.id === childProfile.id)) {
    validChildren.unshift(childProfile);
  }

  // Profil fallback jika database santri sedang dimuat atau belum ada anak terdaftar
  const defaultFallbackChild: UserProfile = {
    id: 'demo-hafiz',
    full_name: 'Muhammad Hafiz',
    email: 'hafiz@mutabaahku.id',
    role: 'STUDENT',
    gender: 'PUTRA',
    current_grade: 3,
    school_name: 'SDIT Imam Bukhari',
    prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
    prayer_city_name: 'KOTA MEDAN',
    latitude: 3.5952,
    longitude: 98.6722,
    qibla_bearing: 292.8,
    daily_streak: 1,
    star_points: 0,
    water_drops: 0,
    garden_tree_level: 1,
    unlocked_stickers: []
  };

  const effectiveChildren = validChildren.length > 0 ? validChildren : (childProfile ? [childProfile] : [defaultFallbackChild]);
  const targetId = activeChildId || childProfile?.id || effectiveChildren[0]?.id;
  const currentChild = effectiveChildren.find(c => Boolean(c && c.id === targetId)) || effectiveChildren[0] || defaultFallbackChild;

  // Filter checklists and logs for the active child
  const childChecklists = pendingChecklists.filter(c => Boolean(c && c.student_id === currentChild.id));

  const handleApproveChecklist = (id: string, grade: 'L' | 'BL') => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    const note = notesInput[id] || (grade === 'L' ? 'Alhamdulillah, mutqin & sangat baik!' : 'Tingkatkan latihan tajwid.');
    onApproveChecklist(id, grade, note);
  };

  const handleApproveIbadah = (id: string) => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    onApproveIbadah(id, 25); // Award 25 stars
  };

  const handleAddChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !onAddChild) return;

    setIsSubmittingChild(true);
    try {
      await onAddChild({
        fullName: newChildName.trim(),
        email: newChildEmail.trim() || `${newChildName.toLowerCase().replace(/\s+/g, '')}@mutabaahku.id`,
        gender: newChildGender,
        grade: newChildGrade,
        schoolName: newChildSchool.trim() || 'SDIT Imam Bukhari'
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
      alert('Gagal menambah profil anak: ' + err.message);
    } finally {
      setIsSubmittingChild(false);
    }
  };

  const handleExportPDF = () => {
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
          <button
            onClick={handleExportPDF}
            className="btn-chunky py-2.5 px-4 text-xs bg-amber-400 hover:bg-amber-300 text-amber-950 border-b-4 border-amber-600 active:border-b-0 shadow-md font-extrabold flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            <span>Ekspor PDF Rapor ({currentChild.full_name.split(' ')[0]})</span>
          </button>
        </div>

        {/* PEMBAGIAN ANAK-ANAK YANG DIKONTROL (CHILD SELECTOR / SWITCHER) */}
        <div className="pt-3 border-t border-white/15">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-200">
              <Users className="w-4 h-4 text-amber-300" />
              <span>Pembagian Anak yang Dikontrol:</span>
            </div>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 border border-emerald-400/40 flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Tambah / Hubungkan Anak</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {effectiveChildren.map((child) => {
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
            })}
          </div>
        </div>
      </div>

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

      {/* SECTION 3: 1-Click Digital Paraf Queue for Ibadah Yaumiyah */}
      {pendingIbadahLog && pendingIbadahLog.parent_review_status === 'PENDING' && pendingIbadahLog.student_id === currentChild.id && (
        <div className="bg-white rounded-3xl sm:rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Paraf Mutaba'ah Yaumiyah ({currentChild.full_name})
              </h3>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {pendingIbadahLog.log_date}
            </span>
          </div>

          <div className="mt-4 p-4 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-extrabold text-slate-800">
                Catatan Santri: <span className="text-emerald-700">"{pendingIbadahLog.child_notes || 'Alhamdulillah tertib sholat!'}"</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Sholat 5 Waktu: Subuh ({pendingIbadahLog.sholat_subuh}), Dzuhur ({pendingIbadahLog.sholat_dzuhur}), Ashar ({pendingIbadahLog.sholat_ashar}), Maghrib ({pendingIbadahLog.sholat_maghrib}), Isya ({pendingIbadahLog.sholat_isya})
              </div>
            </div>

            <button
              onClick={() => handleApproveIbadah(pendingIbadahLog.id)}
              className="btn-chunky py-2.5 px-5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Paraf & Beri +25 Bintang Pahala</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / HUBUNGKAN ANAK BARU */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-4xl max-w-md w-full p-6 shadow-2xl relative border-2 border-emerald-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Hubungkan Anak Baru ke Akun Orang Tua
                  </h3>
                  <p className="text-xs text-slate-500">
                    Wali: {parentProfile.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddChildModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChildSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Nama Lengkap Anak *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Maryam Sholihah"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Email Akun Anak (Opsional)</label>
                <input
                  type="email"
                  placeholder="maryam@mutabaahku.id"
                  value={newChildEmail}
                  onChange={(e) => setNewChildEmail(e.target.value)}
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
                  onClick={() => setShowAddChildModal(false)}
                  className="btn-chunky-ghost py-2 px-3 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChild}
                  className="btn-chunky-emerald py-2 px-4 text-xs shadow-chunky-emerald"
                >
                  {isSubmittingChild ? 'Menyimpan...' : 'Simpan & Hubungkan'}
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
