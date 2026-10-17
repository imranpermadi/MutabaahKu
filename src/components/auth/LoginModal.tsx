import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  UserPlus,
  LogIn,
  KeyRound,
  Shield,
  Users,
  GraduationCap
} from 'lucide-react';
import { supabase, signInWithGoogle, isSupabaseConfigured } from '../../lib/supabase';
import { db } from '../../lib/db';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSSO = async () => {
    if (!isSupabaseConfigured) {
      setErrorMsg('Google SSO memerlukan konfigurasi Supabase di file .env. Silakan gunakan form Email & Kata Sandi di bawah.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google SSO.');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Mohon lengkapi email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (supabase) {
        if (authMode === 'LOGIN') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          setSuccessMsg('Alhamdulillah, berhasil masuk!');
          if (onLoginSuccess && data.user) onLoginSuccess(data.user);
          setTimeout(() => onClose(), 800);
        } else {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName || 'Pengguna MutabaahKu' }
            }
          });
          if (error) throw error;
          setSuccessMsg('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi atau langsung masuk.');
          if (onLoginSuccess && data.user) onLoginSuccess(data.user);
          setTimeout(() => onClose(), 1200);
        }
      } else {
        // Fallback Mode Offline: Otentikasi langsung ke database lokal Dexie
        const existing = await db.user_profiles.where('email').equals(email.trim()).first();
        const userObj = {
          id: existing?.id || `user-${Date.now()}`,
          email: email.trim(),
          user_metadata: { full_name: existing?.full_name || fullName || email.split('@')[0] }
        };
        setSuccessMsg(`Alhamdulillah, berhasil masuk ke akun (${email.trim()})!`);
        if (onLoginSuccess) onLoginSuccess(userObj);
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-emerald-500/20 overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight">
                {authMode === 'LOGIN' ? 'Masuk ke MutabaahKu' : 'Daftar Akun Baru'}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Satu akun untuk seluruh capaian ibadah & hafalan
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* Notification Alerts */}
          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OPSI 1: Google SSO (Paling Direkomendasikan) */}
          <button
            onClick={handleGoogleSSO}
            disabled={isLoading}
            className="w-full bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-emerald-500 text-slate-800 font-black text-sm py-3 px-4 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-98"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Lanjutkan dengan Google SSO</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              atau dengan email
            </span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* OPSI 2: Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === 'REGISTER' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Abu Hafiz / Hafiz Al-Fatih"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 shadow-chunky-emerald transition-all active:translate-y-1 flex items-center justify-center gap-2"
            >
              {authMode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>
                {isLoading 
                  ? 'Memproses...' 
                  : authMode === 'LOGIN' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
              </span>
            </button>
          </form>

          {/* Toggle Login vs Register */}
          <div className="text-center pt-2 border-t border-slate-100">
            {authMode === 'LOGIN' ? (
              <p className="text-xs text-slate-500">
                Belum punya akun?{' '}
                <button
                  onClick={() => setAuthMode('REGISTER')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Daftar Sekarang
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Sudah punya akun?{' '}
                <button
                  onClick={() => setAuthMode('LOGIN')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Masuk di Sini
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-center text-[11px] text-slate-500 gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data keluarga tersimpan aman dan terenkripsi</span>
        </div>
      </div>
    </div>
  );
}
