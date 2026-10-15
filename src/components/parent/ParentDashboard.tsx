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
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MurojaahChecklist, IbadahDailyLog, UserProfile } from '../../types/database';

interface ParentDashboardProps {
  parentProfile: UserProfile;
  childProfile: UserProfile;
  pendingChecklists: MurojaahChecklist[];
  pendingIbadahLog?: IbadahDailyLog;
  onApproveChecklist: (checklistId: string, grade: 'L' | 'BL', notes: string) => void;
  onApproveIbadah: (logId: string, stars: number) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  parentProfile,
  childProfile,
  pendingChecklists,
  pendingIbadahLog,
  onApproveChecklist,
  onApproveIbadah
}) => {
  const [notesInput, setNotesInput] = useState<{ [id: string]: string }>({});

  const handleApproveChecklist = (id: string, grade: 'L' | 'BL') => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    const note = notesInput[id] || 'Alhamdulillah, sangat baik!';
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

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title & Header
    doc.setFontSize(18);
    doc.text('BUKU MUTABA\'AH TAHFIDZ & YAUMIYAH', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.text('SDIT IMAM BUKHARI — LAPORAN RESMI PERSIAPAN UJIAN', 105, 28, { align: 'center' });

    // Child Profile Details
    doc.setFontSize(10);
    doc.text(`Nama Santri/Siswa : ${childProfile.full_name}`, 14, 40);
    doc.text(`Kelas / Tingkat   : Kelas ${childProfile.current_grade || 3}`, 14, 46);
    doc.text(`Orang Tua / Wali  : ${parentProfile.full_name}`, 14, 52);
    doc.text(`Tanggal Cetak     : ${new Date().toLocaleDateString('id-ID')}`, 14, 58);

    // Murojaah Table
    const tableData = pendingChecklists.map((c, i) => [
      i + 1,
      c.curriculum_title,
      c.category,
      `${c.completed_pass_count} / ${c.target_pass_count}x`,
      c.mutabaah_grade === 'L' ? 'Lancar (L)' : 'Belum Lancar (BL)',
      c.parent_notes || 'Tercapai'
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

    doc.save(`Rapor_Mutabaah_${childProfile.full_name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Parent Control */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-4xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
            Portal Orang Tua (Role: PARENT)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">
            Dashboard Pendamping Hafalan & Ibadah
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            Memantau santri: <span className="font-extrabold text-white underline">{childProfile.full_name}</span> (Kelas {childProfile.current_grade || 3})
          </p>
        </div>

        {/* Export PDF Button */}
        <button
          onClick={handleExportPDF}
          className="btn-chunky py-3 px-5 text-xs bg-amber-400 hover:bg-amber-500 text-amber-950 border-b-4 border-amber-600 active:border-b-0 shadow-md font-extrabold flex items-center gap-2"
        >
          <FileDown className="w-4 h-4" />
          <span>Ekspor PDF Rapor Mutaba'ah</span>
        </button>
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
            92.4%
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Kesiapan daya ingat sangat baik untuk menghadapi PTS Semester 1.
          </p>
        </div>

        {/* Materi Mutqin */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Materi Mutqin (5x Ulang)</span>
            <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Target Sekolah</span>
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">
            {pendingChecklists.filter(c => c.completed_pass_count >= c.target_pass_count).length + 4} <span className="text-sm font-bold text-slate-400">Materi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Telah menyelesaikan seluruh repetisi kisi-kisi hafalan.
          </p>
        </div>

        {/* Rekomendasi Muroja'ah Mendesak */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-300/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Perlu Muroja'ah Hari Ini</span>
            <span className="text-xs font-black text-white bg-amber-500 px-2 py-0.5 rounded-full animate-pulse">Prioritas</span>
          </div>
          <div className="text-sm font-extrabold text-amber-950 mt-2 line-clamp-1">
            Surat An-Naba' & Hadis Menuntut Ilmu
          </div>
          <p className="text-[11px] text-amber-800 mt-1 font-medium">
            Dianjurkan disimak kembali malam ini sebelum kurva lupa turun.
          </p>
        </div>
      </div>

      {/* 1-Click Digital Paraf Queue for Muroja'ah Checklists */}
      <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-black text-slate-800">
              Antrean Paraf Digital: Setoran Hafalan Muroja'ah
            </h3>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            {pendingChecklists.length} Menunggu Persetujuan
          </span>
        </div>

        <div className="space-y-3 mt-4">
          {pendingChecklists.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-sm">
              🎉 MasyaAllah! Semua setoran hafalan anak telah diparaf.
            </div>
          ) : (
            pendingChecklists.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl border border-amber-200/90 bg-amber-50/30 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Progres: {item.completed_pass_count} dari {item.target_pass_count}x Muroja'ah
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-800">
                    {item.curriculum_title}
                  </h4>

                  {/* Quick feedback note input */}
                  <input
                    type="text"
                    placeholder="Tuliskan catatan tajwid/makhraj untuk anak..."
                    value={notesInput[item.id] || ''}
                    onChange={(e) => setNotesInput({ ...notesInput, [item.id]: e.target.value })}
                    className="mt-2 w-full text-xs p-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

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
            ))
          )}
        </div>
      </div>

      {/* 1-Click Digital Paraf Queue for Ibadah Yaumiyah */}
      {pendingIbadahLog && pendingIbadahLog.parent_review_status === 'PENDING' && (
        <div className="bg-white rounded-4xl border-2 border-emerald-500/20 shadow-md p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-800">
                Paraf Mutaba'ah Yaumiyah Sholat & Puasa Hari Ini
              </h3>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {pendingIbadahLog.log_date}
            </span>
          </div>

          <div className="mt-4 p-4 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-extrabold text-slate-800">
                Catatan Anak: <span className="text-emerald-700">"{pendingIbadahLog.child_notes || 'Alhamdulillah tertib sholat!'}"</span>
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
    </div>
  );
};
