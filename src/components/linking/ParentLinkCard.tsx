import React, { useState } from 'react';
import { Link2, Mail, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../../types/database';
import { linkParentByEmail } from '../../lib/linking';

interface ParentLinkCardProps {
  student: UserProfile;
  linkedParent?: UserProfile;
}

/**
 * Kartu di ruang anak: menampilkan status tautan ke orang tua,
 * atau form untuk menghubungkan akun dengan memasukkan email orang tua.
 */
export const ParentLinkCard: React.FC<ParentLinkCardProps> = ({ student, linkedParent }) => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (student.parent_id) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="font-black text-emerald-950">Terhubung ke orang tua</div>
          <div className="text-emerald-800 font-semibold truncate">
            {linkedParent
              ? `${linkedParent.full_name}${linkedParent.email ? ` · ${linkedParent.email}` : ''}`
              : 'Memuat data orang tua...'}
          </div>
          <div className="text-[11px] text-emerald-700/80">Setoranmu otomatis masuk ke akun orang tua.</div>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await linkParentByEmail(student, email);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungkan ke orang tua.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 text-xs">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <div>
          <div className="font-black text-amber-950 text-sm">Hubungkan ke orang tua</div>
          <p className="text-amber-900/80 font-medium">
            Masukkan email akun orang tuamu supaya hasil setoran sholat, puasa, dan hafalan bisa diparaf oleh mereka.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email-orang-tua@gmail.com"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{busy ? 'Menghubungkan...' : 'Hubungkan'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 p-2.5 font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
};
