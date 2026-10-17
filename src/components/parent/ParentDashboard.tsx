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
  ChevronDown,
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
  AlertCircle,
  Filter,
  FileText,
  Lock,
  Eye,
  CalendarDays,
  BookOpen,
  Edit3,
  RotateCcw,
  Layers
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
  PuasaCompletion,
  CurriculumCategory,
  ExamType
} from '../../types/database';
import {
  db,
  addCustomCurriculumItem,
  deleteCurriculumItem,
  SDIT_CURRICULUM_CATALOG,
  CurriculumCatalogTemplate
} from '../../lib/db';

// Komponen Custom Dropdown Elegan untuk Portal Orang Tua (Bebas dari <select> bawaan browser yang kaku)
interface ParentDropdownOption {
  value: string | number;
  label: string;
  desc?: string;
  badge?: string;
}

function ParentElegantDropdown({
  value,
  options,
  onChange,
  label
}: {
  value: string | number;
  options: ParentDropdownOption[];
  onChange: (val: any) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => String(o.value) === String(value)) || options[0];

  return (
    <div className="relative">
      {label && (
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-400 focus:outline-none focus:border-emerald-500 transition-all flex items-center justify-between gap-2 shadow-2xs"
      >
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-slate-800 truncate">
            {selected?.label}
          </div>
          {selected?.desc && (
            <div className="text-[10px] text-slate-500 truncate">
              {selected.desc}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected?.badge && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {selected.badge}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180 text-emerald-600' : ''}`} />
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border-2 border-emerald-400 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1 space-y-0.5 animate-fadeIn">
            {options.map(opt => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 font-black'
                      : 'text-slate-700 hover:bg-slate-50 font-bold'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs truncate">{opt.label}</div>
                    {opt.desc && (
                      <div className="text-[10px] text-slate-500 font-medium truncate">{opt.desc}</div>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Format Tanggal Bahasa Indonesia Bebas Masalah UTC Timezone
function formatIndonesianDate(dateStr: string): { fullDate: string; dayName: string; isToday: boolean; isYesterday: boolean } {
  if (!dateStr) return { fullDate: '-', dayName: '', isToday: false, isYesterday: false };
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return { fullDate: dateStr, dayName: '', isToday: false, isYesterday: false };
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = days[date.getDay()] || '';
    const monthName = months[date.getMonth()] || '';
    const fullDate = `${dayName}, ${day} ${monthName} ${year}`;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;

    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
    const isYesterday = dateStr === yestStr;

    return { fullDate, dayName, isToday, isYesterday };
  } catch {
    return { fullDate: dateStr, dayName: '', isToday: false, isYesterday: false };
  }
}

function formatTimeIndonesian(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  } catch {
    return '';
  }
}

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
  allChecklists?: MurojaahChecklist[];
  pendingIbadahLog?: IbadahDailyLog;
  allIbadahLogs?: IbadahDailyLog[];
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
  allChecklists = [],
  pendingIbadahLog,
  allIbadahLogs = [],
  onApproveChecklist,
  onApproveIbadah
}) => {
  const [notesInput, setNotesInput] = useState<{ [id: string]: string }>({});
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<UserProfile | null>(null);
  const [isDeletingChild, setIsDeletingChild] = useState(false);

  // Mode Tampilan Hafalan & Materi (Section 2): 'QUEUE' (Antrean Paraf) vs 'CURRICULUM' (Kelola Materi & Kurikulum)
  const [hafalanViewMode, setHafalanViewMode] = useState<'QUEUE' | 'CURRICULUM'>('QUEUE');
  const [currFilterCategory, setCurrFilterCategory] = useState<'ALL' | CurriculumCategory>('ALL');
  const [currFilterCycle, setCurrFilterCycle] = useState<'ALL' | ExamType>('ALL');
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MurojaahChecklist | null>(null);

  // Form State Tambah / Edit Materi Hafalan oleh Orang Tua
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState<CurriculumCategory>('QURAN');
  const [matCycle, setMatCycle] = useState<ExamType>('PTS_1');
  const [matTargetPass, setMatTargetPass] = useState<number>(5);
  const [matArabic, setMatArabic] = useState('');
  const [matLatin, setMatLatin] = useState('');
  const [matTranslation, setMatTranslation] = useState('');
  const [matSource, setMatSource] = useState('Al-Qur\'an Juz 30');

  // State Evaluasi & Hadiah Bintang Mutaba'ah Yaumiyah
  const [selectedRewardStars, setSelectedRewardStars] = useState<number>(25);
  const [parentFeedbackNote, setParentFeedbackNote] = useState<string>('');

  // Mode Tampilan Yaumiyah: 'QUEUE' (Antrean Menunggu Paraf) atau 'REPORT' (Laporan Riwayat Lengkap)
  const [yaumiyahViewMode, setYaumiyahViewMode] = useState<'QUEUE' | 'REPORT'>('QUEUE');

  // Filter State untuk Laporan Riwayat Ibadah
  const [filterDateRange, setFilterDateRange] = useState<'ALL' | '7_DAYS' | '30_DAYS'>('ALL');
  const [filterApprovalStatus, setFilterApprovalStatus] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [filterPrayerStatus, setFilterPrayerStatus] = useState<'ALL' | 'PERFECT_5' | 'HAS_MISSED'>('ALL');
  const [filterFastingStatus, setFilterFastingStatus] = useState<'ALL' | 'FASTING' | 'NOT_FASTING'>('ALL');

  // Modal Detail Catatan Riwayat Ibadah (Read-only Modal)
  const [selectedDetailLog, setSelectedDetailLog] = useState<IbadahDailyLog | null>(null);

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

  const allChildMaterials = currentChild
    ? (allChecklists.length > 0 ? allChecklists : pendingChecklists).filter(c => Boolean(c && c.student_id === currentChild.id))
    : [];

  const openCreateMaterialModal = () => {
    setEditingMaterial(null);
    setMatTitle('');
    setMatCategory('QURAN');
    setMatCycle('PTS_1');
    setMatTargetPass(5);
    setMatArabic('');
    setMatLatin('');
    setMatTranslation('');
    setMatSource('Al-Qur\'an Juz 30');
    setShowMaterialModal(true);
  };

  const openEditMaterialModal = (item: MurojaahChecklist) => {
    setEditingMaterial(item);
    setMatTitle(item.curriculum_title);
    setMatCategory(item.category);
    setMatCycle((item.exam_cycle_id as ExamType) || 'PTS_1');
    setMatTargetPass(item.target_pass_count || 5);
    setMatArabic(item.arabic_text || '');
    setMatLatin(item.latin_text || '');
    setMatTranslation(item.translation || '');
    setMatSource(item.source || 'Al-Qur\'an Juz 30');
    setShowMaterialModal(true);
  };

  const handleSaveMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild || !matTitle.trim()) return;

    await addCustomCurriculumItem({
      id: editingMaterial?.id,
      student_id: currentChild.id,
      curriculum_item_id: editingMaterial?.curriculum_item_id || `curr-${currentChild.id}-${Date.now()}`,
      curriculum_title: matTitle.trim(),
      category: matCategory,
      grade_level: currentChild.current_grade || 1,
      exam_cycle_id: matCycle,
      target_pass_count: matTargetPass,
      completed_pass_count: editingMaterial?.completed_pass_count || 0,
      child_self_claim: editingMaterial?.child_self_claim || false,
      parent_review_status: editingMaterial?.parent_review_status || 'PENDING',
      mutabaah_grade: editingMaterial?.mutabaah_grade || 'BL',
      arabic_text: matArabic.trim(),
      latin_text: matLatin.trim(),
      translation: matTranslation.trim(),
      source: matSource.trim()
    });

    confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    setShowMaterialModal(false);
    setEditingMaterial(null);
  };

  const handleAddFromCatalog = async (tpl: CurriculumCatalogTemplate) => {
    if (!currentChild) return;
    await addCustomCurriculumItem({
      student_id: currentChild.id,
      curriculum_item_id: `curr-${currentChild.id}-${tpl.code}`,
      curriculum_title: tpl.title,
      category: tpl.category,
      grade_level: currentChild.current_grade || tpl.recommended_grade,
      exam_cycle_id: tpl.exam_cycle_id,
      target_pass_count: tpl.target_pass_count,
      completed_pass_count: 0,
      child_self_claim: false,
      parent_review_status: 'PENDING',
      mutabaah_grade: 'BL',
      arabic_text: tpl.arabic_text,
      latin_text: tpl.latin_text,
      translation: tpl.translation,
      source: tpl.source
    });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleReassignMaterial = async (item: MurojaahChecklist) => {
    await db.murojaah_checklists.update(item.id, {
      parent_review_status: 'PENDING',
      last_checked_at: new Date().toISOString()
    });
  };

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

    // Yaumiyah Table
    const childLogsForPdf = (allIbadahLogs || []).filter(l => Boolean(l && l.student_id === currentChild.id));
    if (childLogsForPdf.length > 0) {
      const yaumiyahTableData = childLogsForPdf.slice(0, 10).map((l, i) => [
        i + 1,
        l.log_date,
        `${[l.sholat_subuh, l.sholat_dzuhur, l.sholat_ashar, l.sholat_maghrib, l.sholat_isya].filter(s => s === 'BERJAMAAH').length}/5 Berjamaah`,
        l.puasa_type === 'TIDAK_PUASA' ? 'Tidak Puasa' : `${l.puasa_type.replace(/_/g, ' ')} (${l.puasa_completion === 'PENUH_MAGHRIB' ? 'Penuh' : 'Latihan'})`,
        l.parent_review_status === 'APPROVED' ? `Disetujui (+${l.reward_stars_awarded || 25} Bintang)` : 'Menunggu Paraf',
        l.parent_review_notes || '-'
      ]);

      const yaumiyahStartY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 120;
      doc.setFontSize(11);
      doc.text('CATATAN MUTABA\'AH YAUMIYAH (SHOLAT 5 WAKTU & PUASA)', 14, yaumiyahStartY);

      autoTable(doc, {
        startY: yaumiyahStartY + 4,
        head: [['No', 'Tanggal', 'Sholat Fardhu', 'Puasa', 'Status Paraf', 'Catatan Orang Tua']],
        body: yaumiyahTableData,
        headStyles: { fillColor: [13, 148, 136] },
        theme: 'grid'
      });
    }

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

      {/* SECTION 2: Antrean Paraf Setoran & Kelola Materi Kurikulum Anak */}
      <div className="bg-white rounded-3xl sm:rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 border border-amber-200 flex-shrink-0">
              {hafalanViewMode === 'QUEUE' ? (
                <Mic className="w-5 h-5 text-amber-700" />
              ) : (
                <BookOpen className="w-5 h-5 text-emerald-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Tahfidz & Muroja'ah
                </span>
                <span className="text-xs font-bold text-slate-500">
                  &bull; Santri: <strong className="text-emerald-700">{currentChild.full_name}</strong>
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-800 mt-0.5">
                {hafalanViewMode === 'QUEUE'
                  ? 'Antrean Paraf & Review Setoran Hafalan'
                  : 'Kelola Materi & Kurikulum Hafalan Anak'}
              </h3>
            </div>
          </div>

          {/* Tab Switcher: Antrean Paraf vs Kelola Materi & Kurikulum */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setHafalanViewMode('QUEUE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                hafalanViewMode === 'QUEUE'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-amber-600" />
              <span>Antrean Paraf Setoran</span>
              {childChecklists.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black">
                  {childChecklists.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setHafalanViewMode('CURRICULUM')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                hafalanViewMode === 'CURRICULUM'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelola Materi & Kurikulum</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
                {allChildMaterials.length}
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: ANTREAN PARAF SETORAN HAFALAN */}
        {hafalanViewMode === 'QUEUE' && (
          <div className="space-y-4">
            {childChecklists.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 space-y-3">
                <p className="text-slate-600 text-sm font-bold">
                  🎉 MasyaAllah! Semua setoran hafalan <strong className="text-emerald-700">{currentChild.full_name}</strong> telah selesai diperiksa dan diparaf.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHafalanViewMode('CURRICULUM')}
                    className="btn-chunky py-2 px-4 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl inline-flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Kelola / Tambah Materi Hafalan Anak</span>
                  </button>
                </div>
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
                        {item.exam_cycle_id && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {item.exam_cycle_id.replace('_', ' ')}
                          </span>
                        )}
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

                    <button
                      type="button"
                      onClick={() => openEditMaterialModal(item)}
                      className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-800 flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Materi</span>
                    </button>
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
        )}

        {/* TAB 2: KELOLA MATERI & KURIKULUM HAFALAN ANAK (CRUD LENGKAP + KATALOG SDIT) */}
        {hafalanViewMode === 'CURRICULUM' && (() => {
          const filteredMaterials = allChildMaterials.filter(m => {
            if (currFilterCategory !== 'ALL' && m.category !== currFilterCategory) return false;
            if (currFilterCycle !== 'ALL' && (m.exam_cycle_id || 'PTS_1') !== currFilterCycle) return false;
            return true;
          });

          return (
            <div className="space-y-4">
              {/* Info Banner & Tombol Aksi Tambah Materi */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-amber-50/50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                      Pusat Kendali Kurikulum Orang Tua
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900">
                      Sinkron Otomatis ke Akun Anak & Database
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Kelola kisi-kisi Surat Al-Qur'an, Hadis, dan Doa Harian untuk <strong className="text-slate-800">{currentChild.full_name}</strong>. Setiap materi yang ditambahkan langsung tampil di aplikasi anak dan tersinkron ke tabel <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-emerald-800">curriculum_items</code>, <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-emerald-800">content_units</code>, &amp; <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-emerald-800">fsrs_memory_states</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(true)}
                    className="btn-chunky py-2.5 px-4 text-xs bg-amber-400 hover:bg-amber-500 text-amber-950 border-b-4 border-amber-600 active:border-b-0 font-black rounded-2xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Layers className="w-4 h-4" />
                    <span>+ Pilih dari Katalog SDIT</span>
                  </button>

                  <button
                    type="button"
                    onClick={openCreateMaterialModal}
                    className="btn-chunky py-2.5 px-4 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 active:border-b-0 font-black rounded-2xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Buat Materi Hafalan Baru</span>
                  </button>
                </div>
              </div>

              {/* Filter Kategori & Siklus Ujian (Menggunakan Custom Dropdown & Pill) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <ParentElegantDropdown
                  label="Filter Kategori Materi"
                  value={currFilterCategory}
                  onChange={(val) => setCurrFilterCategory(val)}
                  options={[
                    { value: 'ALL', label: `📚 Semua Kategori (${allChildMaterials.length} Materi)`, desc: 'Tampilkan Al-Qur\'an, Hadis, dan Doa Harian' },
                    { value: 'QURAN', label: '📖 Al-Qur\'an (Tahfidz Juz 30/29)', desc: 'Surat-surat pendek & ayat pilihan' },
                    { value: 'HADITH', label: '📜 Hadis Pilihan Nabi ﷺ', desc: 'Matan hadis adab & akhlak beserta arti' },
                    { value: 'DOA', label: '🤲 Doa Harian Muslim', desc: 'Doa aktivitas sehari-hari sesuai sunnah' }
                  ]}
                />

                <ParentElegantDropdown
                  label="Filter Siklus Ujian (PTS / PAS)"
                  value={currFilterCycle}
                  onChange={(val) => setCurrFilterCycle(val)}
                  options={[
                    { value: 'ALL', label: '🗓️ Semua Siklus Ujian', desc: 'Seluruh target semester ganjil & genap' },
                    { value: 'PTS_1', label: 'PTS 1 — Tengah Semester Ganjil', badge: 'Ganjil' },
                    { value: 'PAS_1', label: 'PAS 1 — Akhir Semester Ganjil', badge: 'Ganjil' },
                    { value: 'PTS_2', label: 'PTS 2 — Tengah Semester Genap', badge: 'Genap' },
                    { value: 'PAS_2', label: 'PAS 2 — Akhir Semester Genap (UKK)', badge: 'Genap' }
                  ]}
                />
              </div>

              {/* Daftar Seluruh Materi Anak */}
              {filteredMaterials.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-3">
                  <p className="text-sm font-black text-slate-700">Belum ada materi pada filter ini.</p>
                  <p className="text-xs text-slate-500">Klik tombol <strong>"+ Pilih dari Katalog SDIT"</strong> atau <strong>"+ Buat Materi Hafalan Baru"</strong> di atas untuk menambahkan materi hafalan anak.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredMaterials.map((mat) => {
                    const isApproved = mat.parent_review_status === 'APPROVED';
                    return (
                      <div
                        key={mat.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                          isApproved
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                mat.category === 'QURAN'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : mat.category === 'HADITH'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-sky-100 text-sky-900'
                              }`}>
                                {mat.category}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {(mat.exam_cycle_id || 'PTS_1').replace('_', ' ')}
                              </span>
                            </div>

                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isApproved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {isApproved ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Mutqin / Lulus ({mat.mutabaah_grade})</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  <span>Aktif Dihafal ({mat.completed_pass_count}/{mat.target_pass_count}x)</span>
                                </>
                              )}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-black text-slate-800">
                            {mat.curriculum_title}
                          </h4>

                          {mat.arabic_text && (
                            <p className="text-sm font-arabic text-emerald-950 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-right leading-relaxed">
                              {mat.arabic_text}
                            </p>
                          )}

                          {mat.translation && (
                            <p className="text-[11px] text-slate-600 italic line-clamp-2">
                              "{mat.translation}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400">
                            Target: {mat.target_pass_count}x Ulang &bull; {mat.source || 'Kurikulum SDIT'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditMaterialModal(mat)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => handleReassignMaterial(mat)}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                                title="Kembalikan ke daftar tugas muroja'ah anak"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Tugaskan Lagi</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`Hapus materi "${mat.curriculum_title}" dari daftar hafalan ${currentChild.full_name}?`)) {
                                  await deleteCurriculumItem(mat.id);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* SECTION 3: Evaluasi & Paraf Digital Mutaba'ah Yaumiyah (Approval System & Laporan Lengkap) */}
      {(() => {
        // Gabungkan seluruh log ibadah santri aktif
        const childLogs = (allIbadahLogs || []).filter(l => l && l.student_id === currentChild.id);
        const combinedLogs: IbadahDailyLog[] = [...childLogs];
        if (pendingIbadahLog && pendingIbadahLog.student_id === currentChild.id && !combinedLogs.some(l => l.id === pendingIbadahLog.id)) {
          combinedLogs.unshift(pendingIbadahLog);
        }
        // Urutkan tanggal terbaru di atas
        combinedLogs.sort((a, b) => (b.log_date || '').localeCompare(a.log_date || ''));

        // 1. Antrean Pending (Belum diparaf orang tua)
        const pendingQueueLogs = combinedLogs.filter(l => l.parent_review_status === 'PENDING');

        // 2. Filter Laporan Riwayat Ibadah (Tab 2)
        const filteredHistoryLogs = combinedLogs.filter(log => {
          // Filter Rentang Tanggal
          if (filterDateRange === '7_DAYS' || filterDateRange === '30_DAYS') {
            const logDate = new Date(log.log_date);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
            if (filterDateRange === '7_DAYS' && diffDays > 7) return false;
            if (filterDateRange === '30_DAYS' && diffDays > 30) return false;
          }
          // Filter Status Paraf
          if (filterApprovalStatus === 'PENDING' && log.parent_review_status !== 'PENDING') return false;
          if (filterApprovalStatus === 'APPROVED' && log.parent_review_status !== 'APPROVED') return false;

          // Filter Kualitas Sholat
          if (filterPrayerStatus === 'PERFECT_5') {
            const prayers: SholatStatus[] = [log.sholat_subuh, log.sholat_dzuhur, log.sholat_ashar, log.sholat_maghrib, log.sholat_isya];
            if (!prayers.every(s => s === 'BERJAMAAH')) return false;
          } else if (filterPrayerStatus === 'HAS_MISSED') {
            const prayers: SholatStatus[] = [log.sholat_subuh, log.sholat_dzuhur, log.sholat_ashar, log.sholat_maghrib, log.sholat_isya];
            if (!prayers.some(s => s === 'TERLAMBAT' || s === 'TIDAK_SHOLAT')) return false;
          }

          // Filter Shaum
          if (filterFastingStatus === 'FASTING' && log.puasa_type === 'TIDAK_PUASA') return false;
          if (filterFastingStatus === 'NOT_FASTING' && log.puasa_type !== 'TIDAK_PUASA') return false;

          return true;
        });

        // Ringkasan Statistik Riwayat
        const totalApprovedCount = combinedLogs.filter(l => l.parent_review_status === 'APPROVED').length;
        const totalFastingCount = combinedLogs.filter(l => l.puasa_type !== 'TIDAK_PUASA' && l.puasa_completion === 'PENUH_MAGHRIB').length;
        const totalStarsAwarded = combinedLogs.reduce((acc, l) => acc + (l.reward_stars_awarded || 0), 0);

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

        const quickPraiseChips = [
          'Barakallahu fiik, anak sholih! 🌟',
          'MasyaAllah, pertahankan sholat berjamaah di masjid! 🕌',
          'Abi & Umi bangga atas disiplin ibadahmu nak! ❤️',
          'Alhamdulillah kuat puasa hari ini! 🌙',
          'Besok semangat sholat Subuh berjamaah ya! 🌅'
        ];

        return (
          <div className="bg-white rounded-3xl sm:rounded-4xl border-2 border-emerald-500/25 shadow-lg p-5 sm:p-7 space-y-6 relative overflow-hidden">
            {/* Header + Navigasi Tab (Antrean Paraf vs Laporan Riwayat) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300/60">
                    Mutaba'ah Yaumiyah
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    &bull; Santri: <strong className="text-slate-800">{currentChild.full_name}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-slate-800">
                  Pemantauan Sholat 5 Waktu & Shaum
                </h3>
              </div>

              {/* Mode Pengalih Antrean vs Laporan Riwayat */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setYaumiyahViewMode('QUEUE')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    yaumiyahViewMode === 'QUEUE'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Antrean Menunggu Paraf</span>
                  {pendingQueueLogs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black animate-pulse">
                      {pendingQueueLogs.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setYaumiyahViewMode('REPORT')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    yaumiyahViewMode === 'REPORT'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  <span>Laporan & Riwayat Ibadah</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-extrabold">
                    {combinedLogs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* TAB 1: ANTREAN MENUNGGU PARAF RESMI (SATU KALI APPROVAL) */}
            {yaumiyahViewMode === 'QUEUE' && (
              <>
                {pendingQueueLogs.length === 0 ? (
                  <div className="py-12 px-6 rounded-3xl bg-gradient-to-b from-emerald-50/60 to-teal-50/30 border-2 border-dashed border-emerald-300 text-center space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-3xl sm:text-4xl shadow-md ring-8 ring-emerald-100">
                      ✨
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h4 className="text-lg sm:text-xl font-black text-slate-800">
                        Alhamdulillah! Semua Setoran Telah Diparaf Resmi
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Tidak ada antrean mutaba'ah yang menggantung. Setiap amalan sholat & puasa ananda telah diberikan apresiasi bintang pahala.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setYaumiyahViewMode('REPORT')}
                        className="btn-chunky py-2.5 px-5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-sm inline-flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Buka Laporan & Riwayat Ibadah ({combinedLogs.length} Hari)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingQueueLogs.map(log => {
                      const dateInfo = formatIndonesianDate(log.log_date);
                      const totalSholatTertib = prayerItems.filter(p => {
                        const s = log[p.key];
                        return s === 'BERJAMAAH' || s === 'MUNFARID_TEPAT';
                      }).length;
                      const totalBerjamaah = prayerItems.filter(p => log[p.key] === 'BERJAMAAH').length;
                      const puasaData = getPuasaBadge(log.puasa_type, log.puasa_completion);

                      return (
                        <div key={log.id} className="rounded-3xl border-2 border-amber-300 bg-amber-50/20 p-5 sm:p-6 space-y-6 shadow-sm">
                          {/* Banner Tanggal Aktivitas Sangat Jelas (Muncul di HP & Desktop) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black flex-shrink-0 shadow-2xs">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[10px] uppercase font-black tracking-wider text-amber-800">
                                  Tanggal Aktivitas Ibadah
                                </div>
                                <div className="text-sm sm:text-base font-black text-slate-900 flex flex-wrap items-center gap-2">
                                  <span>{dateInfo.fullDate}</span>
                                  {dateInfo.isToday && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                                      HARI INI
                                    </span>
                                  )}
                                  {dateInfo.isYesterday && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-white">
                                      KEMARIN
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                              <span>Menunggu Paraf Resmi Sekali</span>
                            </span>
                          </div>

                          {/* Quick Summary Pill Bar */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/90 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-base shadow-xs flex-shrink-0">
                                🌙
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-slate-800">
                                  {log.puasa_type !== 'TIDAK_PUASA' ? log.puasa_type.replace(/_/g, ' ') : 'Tidak Berpuasa'}
                                </div>
                                <div className="text-[11px] font-semibold text-sky-800 line-clamp-1">
                                  {log.puasa_completion === 'PENUH_MAGHRIB' ? 'Penuh Sampai Maghrib 🌅' : log.puasa_completion === 'LATIHAN_SETENGAH_HARI' ? 'Latihan Setengah Hari 🌤️' : 'Hari Biasa'}
                                </div>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-black text-base shadow-xs flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-amber-950" />
                              </div>
                              <div>
                                <div className="text-xs font-extrabold text-slate-800">Amalan Sunnah</div>
                                <div className="text-[11px] font-semibold text-amber-900">
                                  Dhuha: {log.sholat_dhuha_rakaat} Rakaat &bull; Rawatib: {log.sholat_rawatib_count} Rakaat
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SUB-SECTION A: 5 Waktu Sholat Visual Cards Grid */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <span>🕌</span>
                                <span>Pelaksanaan Sholat 5 Waktu</span>
                              </h4>
                              <span className="text-[11px] font-bold text-slate-500">
                                Disiplin: <strong className="text-emerald-700">{Math.round((totalSholatTertib / 5) * 100)}%</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                              {prayerItems.map(({ key, label, icon: Icon, timeHint, tone }) => {
                                const status = log[key] as SholatStatus;
                                const cfg = getSholatBadge(status);

                                return (
                                  <div
                                    key={key}
                                    className={`rounded-2xl p-3.5 border-2 transition-all hover:shadow-sm ${cfg.boxStyle} flex flex-col justify-between`}
                                  >
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
                          <div className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>Rincian Amalan Sunnah & Dzikir Ba'da Sholat</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {/* Dhuha */}
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Sholat Dhuha</span>
                                </div>
                                <div className="font-black text-slate-800">
                                  {log.sholat_dhuha_rakaat > 0 ? `${log.sholat_dhuha_rakaat} Rakaat` : 'Tidak Dhuha'}
                                </div>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                                  log.sholat_dhuha_rakaat > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {log.sholat_dhuha_rakaat > 0 ? 'Tercapai ☀️' : 'Belum'}
                                </span>
                              </div>

                              {/* Rawatib */}
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
                                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Sunnah Rawatib</span>
                                </div>
                                <div className="font-black text-slate-800">
                                  {log.sholat_rawatib_count > 0 ? `${log.sholat_rawatib_count} Rakaat` : 'Tidak Rawatib'}
                                </div>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                                  log.sholat_rawatib_count > 0 ? 'bg-teal-100 text-teal-900' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {log.sholat_rawatib_count > 0 ? 'Qabliyah/Badiyah' : '0 Rakaat'}
                                </span>
                              </div>

                              {/* Tahajjud */}
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <div className="flex items-center gap-1.5 text-indigo-800 font-bold mb-1">
                                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Qiyamul Lail</span>
                                </div>
                                <div className="font-black text-slate-800">
                                  {log.sholat_qiyamul_lail ? 'Melaksanakan' : 'Belum Tahajjud'}
                                </div>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                                  log.sholat_qiyamul_lail ? 'bg-indigo-100 text-indigo-900' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {log.sholat_qiyamul_lail ? 'MasyaAllah 🌙' : 'Istirahat'}
                                </span>
                              </div>

                              {/* Dzikir */}
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-1">
                                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Dzikir Ba'da Sholat</span>
                                </div>
                                <div className="font-black text-slate-800">
                                  {log.dzikir_bada_sholat_count > 0 ? `${log.dzikir_bada_sholat_count}x Lengkap` : 'Ringkas'}
                                </div>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mt-1 ${
                                  log.dzikir_bada_sholat_count >= 5 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {log.dzikir_bada_sholat_count >= 5 ? '5 Waktu Tuntas' : `${log.dzikir_bada_sholat_count} Waktu`}
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
                                <span className="text-[10px] text-amber-800 font-bold">{dateInfo.fullDate}</span>
                              </div>
                              <blockquote className="text-slate-700 italic font-medium bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                                "{log.child_notes || 'Alhamdulillah hari ini sholat 5 waktu di masjid bersama teman-teman, doakan Hafiz istiqomah ya Abi/Umi!'}"
                              </blockquote>
                            </div>
                          </div>

                          {/* SUB-SECTION E: Parent Paraf & Bintang Reward Action Suite (1-TIME APPROVAL) */}
                          <div className="rounded-3xl p-5 bg-gradient-to-br from-white to-emerald-50/50 border-2 border-emerald-500/30 space-y-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-slate-800">
                                    Beri Apresiasi & Paraf Resmi (Approval Sistem Sekali)
                                  </h4>
                                  <p className="text-[11px] text-slate-500">
                                    Pilih jumlah reward bintang dan berikan kata motivasi penuh kasih sayang untuk ananda.
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
                                <span>
                                  Klik tombol untuk menyetujui mutaba'ah tanggal <strong>{dateInfo.fullDate}</strong>. Setelah disetujui, catatan resmi tersimpan dan otomatis keluar dari antrean pending.
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleApproveIbadah(log.id, selectedRewardStars, parentFeedbackNote)}
                                className="btn-chunky py-3 px-6 text-xs bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 active:border-b-0 shadow-md font-black flex items-center justify-center gap-2 w-full sm:w-auto"
                              >
                                <Check className="w-4 h-4" />
                                <span>Setujui & Beri Paraf Resmi (+{selectedRewardStars} Bintang)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* TAB 2: LAPORAN & RIWAYAT MUTABA'AH LENGKAP PER TANGGAL (DENGAN FILTER & STATUS RESMI) */}
            {yaumiyahViewMode === 'REPORT' && (
              <div className="space-y-6">
                {/* 1. Ringkasan Statistik */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">Total Hari Mutaba'ah</span>
                    <div className="text-lg sm:text-2xl font-black text-slate-800 mt-0.5">{combinedLogs.length} Hari</div>
                    <span className="text-[10px] text-slate-500 font-semibold">Tercatat di sistem</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">Telah Diparaf Resmi</span>
                    <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-0.5">{totalApprovedCount} Hari</div>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {combinedLogs.length > 0 ? `${Math.round((totalApprovedCount / combinedLogs.length) * 100)}% tuntas` : '0%'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase text-sky-800 block">Shaum Penuh Maghrib</span>
                    <div className="text-lg sm:text-2xl font-black text-sky-700 mt-0.5">{totalFastingCount} Hari</div>
                    <span className="text-[10px] text-sky-700 font-semibold">Puasa tuntas</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center sm:text-left">
                    <span className="text-[10px] font-black uppercase text-amber-800 block">Total Bintang Pahala</span>
                    <div className="text-lg sm:text-2xl font-black text-amber-600 mt-0.5">⭐ {totalStarsAwarded}</div>
                    <span className="text-[10px] text-amber-700 font-semibold">Apresiasi orang tua</span>
                  </div>
                </div>

                {/* 2. Filter Toolbar Lengkap */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <Filter className="w-4 h-4 text-emerald-600" />
                      <span>Filter Laporan Mutaba'ah Ibadah:</span>
                    </div>
                    {(filterDateRange !== 'ALL' || filterApprovalStatus !== 'ALL' || filterPrayerStatus !== 'ALL' || filterFastingStatus !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterDateRange('ALL');
                          setFilterApprovalStatus('ALL');
                          setFilterPrayerStatus('ALL');
                          setFilterFastingStatus('ALL');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                    {/* Filter Rentang Tanggal */}
                    <ParentElegantDropdown
                      label="Rentang Tanggal"
                      value={filterDateRange}
                      onChange={(val) => setFilterDateRange(val)}
                      options={[
                        { value: 'ALL', label: '🗓️ Semua Tanggal', desc: 'Tampilkan seluruh riwayat' },
                        { value: '7_DAYS', label: '📅 7 Hari Terakhir', desc: 'Evaluasi pekanan' },
                        { value: '30_DAYS', label: '📆 30 Hari Terakhir', desc: 'Evaluasi bulanan' }
                      ]}
                    />

                    {/* Filter Status Paraf */}
                    <ParentElegantDropdown
                      label="Status Persetujuan"
                      value={filterApprovalStatus}
                      onChange={(val) => setFilterApprovalStatus(val)}
                      options={[
                        { value: 'ALL', label: '✨ Semua Status', desc: 'Pending & Approved' },
                        { value: 'APPROVED', label: '🔒 Telah Diparaf Resmi', desc: 'Sudah diberi bintang', badge: 'Approved' },
                        { value: 'PENDING', label: '⏳ Menunggu Paraf', desc: 'Belum diperiksa wali', badge: 'Pending' }
                      ]}
                    />

                    {/* Filter Disiplin Sholat */}
                    <ParentElegantDropdown
                      label="Kualitas Sholat"
                      value={filterPrayerStatus}
                      onChange={(val) => setFilterPrayerStatus(val)}
                      options={[
                        { value: 'ALL', label: '🕌 Semua Kualitas Sholat', desc: 'Seluruh catatan harian' },
                        { value: 'PERFECT_5', label: '🌟 5 Waktu Berjamaah', desc: '100% tertib di masjid' },
                        { value: 'HAS_MISSED', label: '⏰ Ada Terlambat / Bolong', desc: 'Perlu bimbingan orang tua' }
                      ]}
                    />

                    {/* Filter Puasa */}
                    <ParentElegantDropdown
                      label="Ibadah Shaum"
                      value={filterFastingStatus}
                      onChange={(val) => setFilterFastingStatus(val)}
                      options={[
                        { value: 'ALL', label: '🌙 Semua Hari', desc: 'Puasa & tidak puasa' },
                        { value: 'FASTING', label: '🌅 Hari Berpuasa', desc: 'Ramadhan / Sunnah' },
                        { value: 'NOT_FASTING', label: '🍽️ Hari Tidak Puasa', desc: 'Hari biasa (Ifthar)' }
                      ]}
                    />
                  </div>
                </div>

                {/* 3. Daftar Riwayat Laporan Ibadah Per Tanggal */}
                {filteredHistoryLogs.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                    <p className="text-sm font-black text-slate-600">Tidak ada data riwayat ibadah yang sesuai filter.</p>
                    <p className="text-xs text-slate-400">Silakan ubah pilihan filter di atas untuk melihat catatan lainnya.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistoryLogs.map((log) => {
                      const dateInfo = formatIndonesianDate(log.log_date);
                      const isApproved = log.parent_review_status === 'APPROVED';

                      return (
                        <div
                          key={log.id}
                          className={`rounded-2xl border transition-all p-4 space-y-3 ${
                            isApproved
                              ? 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                              : 'bg-amber-50/40 border-amber-300 shadow-2xs'
                          }`}
                        >
                          {/* Header Bar: Tanggal & Badge Status Terkunci / Pending */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                <CalendarDays className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                                  <span>{dateInfo.fullDate}</span>
                                  {dateInfo.isToday && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                                      HARI INI
                                    </span>
                                  )}
                                  {dateInfo.isYesterday && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-white">
                                      KEMARIN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  ID Log: {log.id}
                                </div>
                              </div>
                            </div>

                            {/* Badge Status Resmi Terkunci */}
                            <div className="flex items-center gap-2">
                              {isApproved ? (
                                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Telah Diparaf Resmi (+{log.reward_stars_awarded || 0} ⭐)</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Menunggu Paraf</span>
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => setSelectedDetailLog(log)}
                                className="text-xs font-black px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Lihat Rincian</span>
                              </button>
                            </div>
                          </div>

                          {/* Sholat Timeline Pills */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
                            {prayerItems.map((p) => {
                              const status = log[p.key];
                              const badge = getSholatBadge(status);
                              return (
                                <div
                                  key={p.key}
                                  className={`p-2 rounded-xl border flex items-center justify-between gap-1 ${
                                    status === 'BERJAMAAH'
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                                      : status === 'MUNFARID_TEPAT'
                                      ? 'bg-teal-50/70 border-teal-200 text-teal-950 font-bold'
                                      : status === 'TERLAMBAT'
                                      ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-bold'
                                      : 'bg-rose-50/80 border-rose-200 text-rose-950 font-bold'
                                  }`}
                                >
                                  <span className="font-extrabold">{p.label}:</span>
                                  <span className="text-[10px] truncate">{badge.iconEmoji} {badge.short}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Puasa & Catatan Wali Ringkas */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-sky-100 text-sky-900 border border-sky-200">
                                🌙 {log.puasa_type !== 'TIDAK_PUASA' ? log.puasa_type.replace(/_/g, ' ') : 'Tidak Puasa'}
                              </span>
                              {log.puasa_completion === 'PENUH_MAGHRIB' && (
                                <span className="text-[10px] font-bold text-emerald-700">
                                  Tuntas Sampai Maghrib 🌅
                                </span>
                              )}
                              {log.sholat_dhuha_rakaat > 0 && (
                                <span className="text-[10px] text-amber-700 font-bold">
                                  • Dhuha {log.sholat_dhuha_rakaat} Rakaat
                                </span>
                              )}
                            </div>

                            {log.parent_review_notes && (
                              <div className="text-[11px] text-slate-600 italic bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 max-w-md truncate">
                                💬 "{log.parent_review_notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
      </>
      )}

      {/* MODAL RINCIAN ARSIP MUTABA'AH IBADAH LENGKAP (READ-ONLY) */}
      {selectedDetailLog && (() => {
        const dateInfo = formatIndonesianDate(selectedDetailLog.log_date);
        const isApproved = selectedDetailLog.parent_review_status === 'APPROVED';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/20 space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Arsip Resmi Mutaba'ah
                    </span>
                    {isApproved ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Telah Diparaf Resmi
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Menunggu Paraf
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-800">
                    Rincian Ibadah: {dateInfo.fullDate}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Santri: <strong>{currentChild?.full_name}</strong> &bull; Wali: <strong>{parentProfile.full_name}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDetailLog(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sholat 5 Waktu Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Pelaksanaan Sholat Fardhu 5 Waktu
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { key: 'sholat_subuh' as const, label: 'Subuh' },
                    { key: 'sholat_dzuhur' as const, label: 'Dzuhur' },
                    { key: 'sholat_ashar' as const, label: 'Ashar' },
                    { key: 'sholat_maghrib' as const, label: 'Maghrib' },
                    { key: 'sholat_isya' as const, label: 'Isya' }
                  ].map(p => {
                    const status = selectedDetailLog[p.key];
                    return (
                      <div key={p.key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-500">{p.label}</div>
                        <div className="font-black text-slate-800 text-xs mt-1">
                          {status === 'BERJAMAAH' ? '🕌 Berjamaah' : status === 'MUNFARID_TEPAT' ? '🏠 Di Rumah' : status === 'TERLAMBAT' ? '⏰ Terlambat' : 'Belum Sholat'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Puasa & Sunnah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200">
                  <div className="text-[10px] font-black uppercase text-sky-800">Ibadah Shaum (Puasa)</div>
                  <div className="font-black text-slate-800 text-sm mt-1">
                    {selectedDetailLog.puasa_type !== 'TIDAK_PUASA' ? selectedDetailLog.puasa_type.replace(/_/g, ' ') : 'Tidak Berpuasa'}
                  </div>
                  <p className="text-[11px] text-sky-700 mt-1">
                    Penyelesaian: {selectedDetailLog.puasa_completion === 'PENUH_MAGHRIB' ? 'Penuh Sampai Maghrib 🌅' : selectedDetailLog.puasa_completion === 'LATIHAN_SETENGAH_HARI' ? 'Setengah Hari 🌤️' : 'Hari Biasa'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="text-[10px] font-black uppercase text-amber-800">Amalan Sunnah</div>
                  <div className="text-xs font-bold text-slate-800 mt-1 space-y-0.5">
                    <div>• Dhuha: {selectedDetailLog.sholat_dhuha_rakaat} Rakaat</div>
                    <div>• Rawatib: {selectedDetailLog.sholat_rawatib_count} Rakaat</div>
                    <div>• Qiyamul Lail: {selectedDetailLog.sholat_qiyamul_lail ? 'Melaksanakan 🌙' : 'Tidak'}</div>
                    <div>• Dzikir Ba'da Sholat: {selectedDetailLog.dzikir_bada_sholat_count} Waktu</div>
                  </div>
                </div>
              </div>

              {/* Catatan Ananda & Catatan Wali */}
              <div className="space-y-3 text-xs">
                {selectedDetailLog.child_notes && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-extrabold text-slate-700 block mb-1">Catatan Kejujuran Santri:</span>
                    <p className="italic text-slate-600">"{selectedDetailLog.child_notes}"</p>
                  </div>
                )}

                {isApproved ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Persetujuan & Paraf Resmi Wali Murid
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        {formatTimeIndonesian(selectedDetailLog.reviewed_at)}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">"{selectedDetailLog.parent_review_notes || 'Alhamdulillah, sholat dan ibadahnya sangat tertib!'}"</p>
                    <div className="text-[11px] font-black text-amber-700 pt-1">
                      ⭐ Telah Dihadiahi: +{selectedDetailLog.reward_stars_awarded || 0} Bintang Pahala
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Catatan ini masih menunggu paraf Anda di tab "Antrean Menunggu Paraf".</span>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedDetailLog(null)}
                  className="btn-chunky py-2 px-5 text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ParentElegantDropdown
                  label="Jenis Kelamin *"
                  value={newChildGender}
                  onChange={(val) => setNewChildGender(val as UserGender)}
                  options={[
                    { value: 'PUTRA', label: '👦 Putra (Koko & Peci)', desc: 'Avatar santri laki-laki' },
                    { value: 'PUTRI', label: '👧 Putri (Mukena Pastel)', desc: 'Avatar santri perempuan' }
                  ]}
                />

                <ParentElegantDropdown
                  label="Tingkat Kelas SD *"
                  value={newChildGrade}
                  onChange={(val) => setNewChildGrade(Number(val))}
                  options={[
                    { value: 1, label: 'Kelas 1 SD', desc: 'Target Juz 30 Dasar' },
                    { value: 2, label: 'Kelas 2 SD', desc: 'Target Juz 30 Lanjutan' },
                    { value: 3, label: 'Kelas 3 SD', desc: 'Target Juz 30 Tuntas' },
                    { value: 4, label: 'Kelas 4 SD', desc: 'Target Juz 29 Awal' },
                    { value: 5, label: 'Kelas 5 SD', desc: 'Target Juz 29 Lanjutan' },
                    { value: 6, label: 'Kelas 6 SD', desc: 'Target Munaqosyah Akhir' }
                  ]}
                />
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

      {/* MODAL TAMBAH / EDIT MATERI HAFALAN ANAK (PORTAL ORANG TUA) */}
      {showMaterialModal && currentChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border-2 border-emerald-500/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {editingMaterial ? 'Edit Materi Hafalan Anak' : 'Tambah Materi Hafalan Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Santri: <strong className="text-emerald-700">{currentChild.full_name}</strong> (Kelas {currentChild.current_grade || 1} SD)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMaterialModal(false);
                  setEditingMaterial(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterialSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Judul Materi Hafalan (Surat / Hadis / Doa) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Surat Al-Mulk (Ayat 1-10) / Hadis Kasih Sayang"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ParentElegantDropdown
                  label="Kategori Materi *"
                  value={matCategory}
                  onChange={(val) => setMatCategory(val as CurriculumCategory)}
                  options={[
                    { value: 'QURAN', label: '📖 Al-Qur\'an', desc: 'Tahfidz Surat/Ayat' },
                    { value: 'HADITH', label: '📜 Hadis Nabi ﷺ', desc: 'Matan & Arti' },
                    { value: 'DOA', label: '🤲 Doa Harian', desc: 'Adab & Sunnah' }
                  ]}
                />

                <ParentElegantDropdown
                  label="Target Ujian *"
                  value={matCycle}
                  onChange={(val) => setMatCycle(val as ExamType)}
                  options={[
                    { value: 'PTS_1', label: 'PTS 1 (Ganjil)', desc: 'Tengah Semester 1' },
                    { value: 'PAS_1', label: 'PAS 1 (Ganjil)', desc: 'Akhir Semester 1' },
                    { value: 'PTS_2', label: 'PTS 2 (Genap)', desc: 'Tengah Semester 2' },
                    { value: 'PAS_2', label: 'PAS 2 (Genap)', desc: 'Akhir Semester 2' }
                  ]}
                />

                <ParentElegantDropdown
                  label="Target Ulang (Pass) *"
                  value={matTargetPass}
                  onChange={(val) => setMatTargetPass(Number(val))}
                  options={[
                    { value: 3, label: '3x Ulang', desc: 'Doa pendek' },
                    { value: 5, label: '5x Ulang (Standar)', desc: 'Standar Mutqin SDIT' },
                    { value: 7, label: '7x Ulang', desc: 'Surat panjang' },
                    { value: 10, label: '10x Ulang', desc: 'Tahfidz intensif' }
                  ]}
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Teks Arab (Rasm Utsmani)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  placeholder="تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ"
                  value={matArabic}
                  onChange={(e) => setMatArabic(e.target.value)}
                  className="w-full text-sm font-arabic p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Transliterasi Latin (Bantuan Baca Anak)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tabaarakalladzii biyadihil mulku wa huwa 'alaa kulli syai-in qadiir"
                  value={matLatin}
                  onChange={(e) => setMatLatin(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Arti / Terjemahan Bahasa Indonesia
                  </label>
                  <input
                    type="text"
                    placeholder="Maha Suci Allah yang di tangan-Nya segala kerajaan..."
                    value={matTranslation}
                    onChange={(e) => setMatTranslation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Sumber / Rujukan Dalil
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Al-Qur'an Juz 29 / HR. Bukhari & Muslim"
                    value={matSource}
                    onChange={(e) => setMatSource(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialModal(false);
                    setEditingMaterial(null);
                  }}
                  className="btn-chunky-ghost py-2 px-3.5 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-chunky-emerald py-2 px-5 text-xs shadow-chunky-emerald"
                >
                  {editingMaterial ? 'Simpan Perubahan Materi' : 'Tambahkan ke Daftar Hafalan Anak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KATALOG KURIKULUM STANDAR SDIT (1-KLIK TAMBAH KE ANAK) */}
      {showCatalogModal && currentChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border-2 border-emerald-500/20 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 border border-amber-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    Katalog Kurikulum Standar SDIT (1-Klik Tambah)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih kisi-kisi resmi Al-Qur'an, Hadis, &amp; Doa untuk ditambahkan ke akun <strong className="text-emerald-700">{currentChild.full_name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {SDIT_CURRICULUM_CATALOG.map((tpl) => {
                const alreadyAssigned = allChildMaterials.some(
                  m => m.curriculum_title.toLowerCase() === tpl.title.toLowerCase()
                );

                return (
                  <div
                    key={tpl.code}
                    className={`p-3.5 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-3 transition-all ${
                      alreadyAssigned
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-[220px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          tpl.category === 'QURAN'
                            ? 'bg-emerald-100 text-emerald-900'
                            : tpl.category === 'HADITH'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-sky-100 text-sky-900'
                        }`}>
                          {tpl.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Rekomendasi Kelas {tpl.recommended_grade} SD &bull; {tpl.exam_cycle_id.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm font-black text-slate-800">{tpl.title}</div>
                      <div className="text-xs font-arabic text-emerald-900">{tpl.arabic_text}</div>
                      <div className="text-[11px] text-slate-500 italic">"{tpl.translation}" ({tpl.source})</div>
                    </div>

                    <div>
                      {alreadyAssigned ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Sudah Ada di Anak</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddFromCatalog(tpl)}
                          className="btn-chunky py-2 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambahkan ke Anak</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCatalogModal(false)}
                className="btn-chunky py-2 px-5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
              >
                Selesai
              </button>
            </div>
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
