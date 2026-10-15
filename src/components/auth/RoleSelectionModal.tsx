import React from 'react';
import { ShieldCheck, BookOpen, Sparkles, UserCheck, HeartHandshake } from 'lucide-react';
import { UserRole } from '../../types/database';

interface RoleSelectionModalProps {
  isOpen: boolean;
  userEmail?: string;
  userName?: string;
  onSelectRole: (role: UserRole) => void;
}

export function RoleSelectionModal({ 
  isOpen, 
  userEmail, 
  userName, 
  onSelectRole 
}: RoleSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-emerald-500/20 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6 text-white text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-black text-2xl tracking-tight">
            Selamat Datang di MutabaahKu!
          </h2>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            {userEmail ? `Akun Google: ${userEmail}` : 'Pilih peran untuk memulai aplikasi'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 text-center font-semibold mb-2">
            Tentukan peran akun ini. Setiap akun memiliki hak akses terpisah demi menjaga ketertiban dan adab mutaba'ah keluarga:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* OPSI 1: ORANG TUA / WALI */}
            <button
              onClick={() => onSelectRole('PARENT')}
              className="group text-left p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between active:scale-98"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-chunky-emerald group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-emerald-950 mb-1">
                  Orang Tua / Wali
                </h3>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Akses khusus Ayah/Bunda untuk memverifikasi hafalan, memberikan <strong>paraf digital</strong>, memantau retensi FSRS-6, dan mencetak <strong>rapor resmi SDIT</strong>.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs font-black text-emerald-700">
                <span>Pilih Orang Tua</span>
                <span>&rarr;</span>
              </div>
            </button>

            {/* OPSI 2: SISWA / ANAK */}
            <button
              onClick={() => onSelectRole('STUDENT')}
              className="group text-left p-4 rounded-2xl border-2 border-sky-200 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between active:scale-98"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center mb-3 shadow-chunky-sky group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-sky-950 mb-1">
                  Siswa / Anak
                </h3>
                <p className="text-[11px] text-sky-800 leading-relaxed font-medium">
                  Ruang ceria ananda untuk belajar <strong>13 gerakan sholat shahih</strong>, muroja'ah kisi-kisi hafalan Juz 30 & Hadis, merawat <strong>Kebun Pohon Kurma</strong>, dan catat sholat 5 waktu.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-200/60 flex items-center justify-between text-xs font-black text-sky-700">
                <span>Pilih Siswa</span>
                <span>&rarr;</span>
              </div>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 text-[11px] text-slate-500">
            <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Peran ini tersimpan permanen di akun Google Anda. Anak tidak akan bisa mengakses tombol paraf orang tua.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
