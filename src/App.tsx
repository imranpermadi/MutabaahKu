import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Sparkles, 
  Flame, 
  Star, 
  Droplets, 
  User, 
  ShieldCheck, 
  Compass, 
  BookOpen, 
  Calendar, 
  RotateCw, 
  Eye, 
  Shield, 
  LogOut,
  Download,
  X
} from 'lucide-react';
import { db, purgeDemoData, ensureStarterChecklists, deleteChildProfile, todayLocal } from './lib/db';
import { isSupabaseConfigured, supabase, executeFullSync, pullRemoteDataFromSupabase, backgroundSync } from './lib/supabase';
import { linkChildByEmail, unlinkChild } from './lib/linking';
import { UserRole, UserGender, UserProfile, IbadahDailyLog } from './types/database';
import { ParentLinkCard } from './components/linking/ParentLinkCard';
import { MascotCharacter } from './components/mascot/MascotCharacter';
import { SholatAnimator } from './components/prayer/SholatAnimator';
import { PrayerTimesCard } from './components/prayer/PrayerTimesCard';
import { QiblaCompass } from './components/prayer/QiblaCompass';
import { PahalaGarden } from './components/garden/PahalaGarden';
import { MurojaahChecklist } from './components/murojaah/MurojaahChecklist';
import { IbadahTracker } from './components/yaumiyah/IbadahTracker';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { SyncModal } from './components/sync/SyncModal';
import { RoleSelectionModal } from './components/auth/RoleSelectionModal';
import { LoginModal } from './components/auth/LoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuestLandingHero } from './components/landing/GuestLandingHero';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isPreviewingStudent, setIsPreviewingStudent] = useState(false);
  const [activeTab, setActiveTab] = useState<'SHOLAT' | 'PRAYER_QIBLA' | 'MUROJAAH' | 'YAUMIYAH'>('SHOLAT');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<{ show: boolean; msg: string; isError?: boolean } | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Multi-Child Control State
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Initialize offline seed data, listen for Google SSO Auth, and listen for PWA install prompt
  useEffect(() => {
    purgeDemoData().catch(console.error);

    // PWA Install Event Listener
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          handleAuthUser(session.user);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          handleAuthUser(session.user);
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleAuthUser = async (user: any) => {
    setCurrentUser(user);
    const email = (user.email || '').trim().toLowerCase();
    let existing = await db.user_profiles.where('email').equalsIgnoreCase(email).first();

    // Tarik profil terbaru dari cloud: tautan orang tua↔anak bisa saja dibuat dari perangkat lain
    if (supabase && navigator.onLine && email) {
      try {
        await pullRemoteDataFromSupabase(email);
        existing = (await db.user_profiles.where('email').equalsIgnoreCase(email).first()) || existing;
      } catch (e) {
        console.warn('Gagal menarik profil dari cloud saat login:', e);
      }
    }

    if (existing && existing.role) {
      setCurrentRole(existing.role);
      if (existing.role === 'STUDENT') {
        await ensureStarterChecklists(existing.id, existing.current_grade || 1);
      }
    } else {
      setShowRolePicker(true);
    }
  };

  const handleSelectRole = async (selectedRole: UserRole) => {
    setShowRolePicker(false);
    setCurrentRole(selectedRole);

    if (currentUser) {
      const newProfile: UserProfile = {
        id: currentUser.id,
        email: (currentUser.email || '').trim().toLowerCase(),
        full_name: currentUser.user_metadata?.full_name || (selectedRole === 'PARENT' ? 'Orang Tua' : 'Anak Sholih'),
        role: selectedRole,
        gender: 'PUTRA',
        prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
        prayer_city_name: 'KOTA MEDAN',
        latitude: 3.5952,
        longitude: 98.6722,
        qibla_bearing: 292.8,
        daily_streak: 1,
        star_points: 0,
        water_drops: 0,
        garden_tree_level: 1,
        unlocked_stickers: ['sticker_welcome_star']
      };
      await db.user_profiles.put(newProfile);
      if (selectedRole === 'STUDENT') {
        await ensureStarterChecklists(newProfile.id, 1);
      }
    }
  };

  // Periodic Background Sync (tiap 15 detik jika user login & online)
  useEffect(() => {
    if (!currentUser?.email) return;
    const interval = setInterval(() => {
      if (navigator.onLine) {
        backgroundSync(currentUser.email).catch(() => {});
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.email]);

  // Dexie Live Queries
  const studentProfile = useLiveQuery(async () => {
    if (currentUser?.email) {
      const byEmail = await db.user_profiles.where('email').equalsIgnoreCase(currentUser.email).first();
      if (byEmail && byEmail.role === 'STUDENT') return byEmail;
      if (byEmail) return byEmail;
    }
    return db.user_profiles.where('role').equals('STUDENT').first();
  }, [currentUser?.email]);

  const parentProfile = useLiveQuery(async () => {
    if (currentUser?.email) {
      const byEmail = await db.user_profiles.where('email').equalsIgnoreCase(currentUser.email).first();
      if (byEmail && byEmail.role === 'PARENT') return byEmail;
      if (byEmail) return byEmail;
    }
    return db.user_profiles.where('role').equals('PARENT').first();
  }, [currentUser?.email]);

  const allChildren = useLiveQuery(async () => {
    if (parentProfile?.id) {
      return db.user_profiles.where('parent_id').equals(parentProfile.id).toArray();
    }
    return [];
  }, [parentProfile?.id]) || [];

  const linkedParent = useLiveQuery(async () => {
    if (studentProfile?.parent_id) {
      return db.user_profiles.get(studentProfile.parent_id);
    }
    return null;
  }, [studentProfile?.parent_id]);

  // Fallback tamu jika pengunjung belum login agar demo tetap bisa dicoba
  const guestStudentFallback: UserProfile = {
    id: 'guest-student',
    full_name: 'Anak Sholih',
    email: '',
    role: 'STUDENT',
    gender: 'PUTRA',
    current_grade: 1,
    school_name: 'SDIT MutabaahKu',
    prayer_city_id: '58a2fc6ed39fd083f55d4182bf88826d',
    prayer_city_name: 'KOTA MEDAN',
    latitude: 3.5952,
    longitude: 98.6722,
    qibla_bearing: 292.8,
    daily_streak: 1,
    star_points: 0,
    water_drops: 0,
    garden_tree_level: 1,
    unlocked_stickers: ['sticker_welcome_star']
  };

  // Active child being monitored or practicing
  const activeChild: UserProfile | undefined = (
    currentRole === 'STUDENT'
      ? (studentProfile || (!currentUser ? guestStudentFallback : undefined))
      : (allChildren.find(c => Boolean(c && c.id === selectedChildId)) || allChildren[0] || undefined)
  );

  const targetStudentId = currentRole === 'STUDENT'
    ? (studentProfile?.id || (!currentUser ? 'guest-student' : ''))
    : (activeChild?.id || '');

  const checklists = useLiveQuery(async () => {
    if (!targetStudentId) return [];
    return db.murojaah_checklists.where('student_id').equals(targetStudentId).toArray();
  }, [targetStudentId]) || [];

  const today = todayLocal();
  const todayIbadahLog = useLiveQuery(() => 
    db.ibadah_daily_logs.where('student_id').equals(activeChild?.id || '').first(),
    [activeChild?.id]
  );

  const defaultIbadahLog: IbadahDailyLog = {
    id: `log-${activeChild?.id || 'std-1'}-${today}`,
    student_id: activeChild?.id || 'std-1',
    log_date: today,
    sholat_subuh: 'BERJAMAAH',
    sholat_dzuhur: 'BERJAMAAH',
    sholat_ashar: 'BERJAMAAH',
    sholat_maghrib: 'BERJAMAAH',
    sholat_isya: 'BERJAMAAH',
    dzikir_bada_sholat_count: 5,
    sholat_dhuha_rakaat: 2,
    sholat_rawatib_count: 4,
    sholat_qiyamul_lail: false,
    puasa_type: 'SENIN_KAMIS',
    puasa_completion: 'PENUH_MAGHRIB',
    parent_review_status: 'PENDING',
    reward_stars_awarded: 0,
    created_at: new Date().toISOString()
  };

  const handleAutoSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncToast({ show: true, msg: 'Sedang menyinkronkan data dengan Cloud...' });
    try {
      const res = await executeFullSync(currentUser?.email);
      if (res.success) {
        setSyncToast({ 
          show: true, 
          msg: `✅ Sinkronisasi Berhasil! (${res.pushed} data diunggah, ${res.pulled} data ditarik)` 
        });
      } else {
        setSyncToast({ 
          show: true, 
          msg: `⚠️ ${res.error || 'Sinkronisasi offline: data tersimpan di perangkat.'}`,
          isError: true 
        });
      }
    } catch (err: any) {
      setSyncToast({ 
        show: true, 
        msg: `⚠️ Gagal sinkronisasi: ${err.message || 'Koneksi bermasalah'}`,
        isError: true 
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncToast(null);
      }, 4000);
    }
  };

  const handleWaterTree = async () => {
    if (!activeChild) return;
    const newDrops = Math.max(0, activeChild.water_drops - 10);
    const newLevel = Math.min(5, activeChild.garden_tree_level + 1);
    await db.user_profiles.update(activeChild.id, {
      water_drops: newDrops,
      garden_tree_level: newLevel
    });
  };

  const handleStepCompleted = async () => {
    if (!activeChild) return;
    await db.user_profiles.update(activeChild.id, {
      star_points: activeChild.star_points + 10,
      water_drops: activeChild.water_drops + 5
    });
  };

  const handlePassIncrement = async (id: string) => {
    const item = await db.murojaah_checklists.get(id);
    if (!item) return;
    const newCount = item.completed_pass_count + 1;
    await db.murojaah_checklists.update(id, {
      completed_pass_count: newCount,
      child_self_claim: true,
      parent_review_status: 'PENDING'
    });
  };

  const handleApproveChecklist = async (id: string, grade: 'L' | 'BL', notes: string) => {
    await db.murojaah_checklists.update(id, {
      parent_review_status: 'APPROVED',
      mutabaah_grade: grade,
      parent_notes: notes,
      reviewed_at: new Date().toISOString()
    });

    if (activeChild) {
      await db.user_profiles.update(activeChild.id, {
        star_points: activeChild.star_points + 20,
        water_drops: activeChild.water_drops + 10
      });
    }
  };

  const handleApproveIbadah = async (logId: string, stars: number, notes?: string) => {
    const existing = await db.ibadah_daily_logs.get(logId);
    if (!existing) {
      await db.ibadah_daily_logs.put({
        ...defaultIbadahLog,
        id: logId,
        student_id: activeChild?.id || 'std-1',
        parent_review_status: 'APPROVED',
        reward_stars_awarded: stars,
        parent_review_notes: notes || 'Alhamdulillah, sholat dan ibadahnya sangat tertib!',
        reviewed_at: new Date().toISOString()
      });
    } else {
      await db.ibadah_daily_logs.update(logId, {
        parent_review_status: 'APPROVED',
        reward_stars_awarded: stars,
        parent_review_notes: notes || 'Alhamdulillah, sholat dan ibadahnya sangat tertib!',
        reviewed_at: new Date().toISOString()
      });
    }

    if (activeChild) {
      await db.user_profiles.update(activeChild.id, {
        star_points: activeChild.star_points + stars,
        water_drops: activeChild.water_drops + 15
      });
    }
  };

  const handleSaveIbadah = async (updated: any) => {
    await db.ibadah_daily_logs.put(updated);
  };

  const handleToggleGender = async () => {
    if (!activeChild) return;
    const nextGender: UserGender = activeChild.gender === 'PUTRA' ? 'PUTRI' : 'PUTRA';
    await db.user_profiles.update(activeChild.id, { gender: nextGender });
  };

  const pendingChecklists = checklists.filter(c => c.parent_review_status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#F0FDF4]/80 text-slate-800 pb-16 selection:bg-emerald-200 overflow-x-hidden w-full max-w-full">
      {/* PWA INSTALL BANNER (Tampil jika browser mendukung PWA) */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-300 flex-shrink-0 animate-bounce" />
            <span>Pasang <strong>MutabaahKu PWA</strong> di HP Anda untuk akses instan & 100% offline!</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallPWA}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black px-3 py-1 rounded-xl text-xs shadow-sm transition-all active:scale-95"
            >
              Pasang Sekarang
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Application Bar (Optimized for Mobile Responsiveness & No Horizontal Overflow) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-emerald-500/10 shadow-sm max-w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-base sm:text-xl shadow-chunky-emerald">
              M
            </div>
            <div>
              <span className="font-black text-base sm:text-xl text-emerald-950 tracking-tight">
                Mutabaah<span className="text-emerald-600">Ku</span>
              </span>
              <p className="text-[10px] text-slate-400 font-semibold hidden md:block">
                Sahabat Ceria Hafalan & Ibadah
              </p>
            </div>
          </div>

          {/* User Gamification Stats Strip / Mode Tamu Indicator */}
          {!currentUser ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-100/90 text-emerald-950 font-black text-xs px-2.5 py-1 rounded-xl border border-emerald-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500 animate-pulse" />
              <span>Mode Tamu</span>
            </div>
          ) : (
            currentRole === 'STUDENT' && activeChild && (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Daily Streak */}
                <div className="flex items-center gap-1 bg-amber-50 text-amber-950 font-black text-xs px-2 py-1 rounded-xl border border-amber-200">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{activeChild.daily_streak || 1}d</span>
                </div>

                {/* Star Points */}
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-950 font-black text-xs px-2 py-1 rounded-xl border border-emerald-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{activeChild.star_points || 0}</span>
                </div>

                {/* Water Drops */}
                <div className="hidden sm:flex items-center gap-1 bg-sky-50 text-sky-950 font-black text-xs px-2 py-1 rounded-xl border border-sky-200">
                  <Droplets className="w-3.5 h-3.5 fill-sky-400 text-sky-500" />
                  <span>{activeChild.water_drops || 0}</span>
                </div>
              </div>
            )
          )}

          {/* Role Switcher & Cloud Sync Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Sync Cloud Otomatis */}
            <button
              onClick={handleAutoSync}
              disabled={isSyncing}
              title="Sinkronisasi Langsung Otomatis 2-Arah dengan Cloud"
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs border active:scale-95 ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sync...' : 'Sync'}</span>
            </button>

            {/* Tombol Akses Admin Console jika akun imranpermadi@gmail.com */}
            {currentUser?.email?.toLowerCase() === 'imranpermadi@gmail.com' && (
              <button
                onClick={() => setIsAdminOpen(true)}
                title="Kelola Data Live Cloud Supabase (CRUD)"
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-2 py-1.5 sm:px-2.5 rounded-xl shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all border border-purple-400"
              >
                <Shield className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Role Badge & Identity */}
            {currentRole === 'PARENT' ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-emerald-800 text-white font-black text-xs px-2.5 py-1.5 rounded-xl border border-emerald-700 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Portal Orang Tua</span>
                  <span className="sm:hidden">Ortu</span>
                </div>

                {/* Pratinjau Ruang Anak */}
                <button
                  onClick={() => setIsPreviewingStudent(!isPreviewingStudent)}
                  title="Lihat tampilan aplikasi persis seperti yang dilihat anak"
                  className="hidden md:flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-2 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isPreviewingStudent ? 'Dashboard' : 'Pratinjau'}</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 bg-sky-100 text-sky-900 font-black text-xs px-2.5 py-1.5 rounded-xl border border-sky-300 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Siswa</span>
              </div>
            )}

            {/* Login / Profile Avatar Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  title={`Akun: ${currentUser.email} (${currentRole}) - Buka Pengaturan`}
                  className="w-8 h-8 rounded-full border-2 border-emerald-500 overflow-hidden flex items-center justify-center bg-emerald-100 text-emerald-800 font-black text-xs hover:ring-2 hover:ring-emerald-400 transition-all active:scale-95"
                >
                  {currentUser.user_metadata?.avatar_url ? (
                    <img src={currentUser.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.email?.[0]?.toUpperCase() || 'U'
                  )}
                </button>
                <button
                  onClick={async () => {
                    if (supabase) await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  title="Keluar dari Akun"
                  className="p-1 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-chunky-emerald flex items-center gap-1 active:scale-95 transition-all flex-shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification Sinkronisasi Otomatis */}
      {syncToast && (
        <div className="fixed top-16 right-4 z-50 max-w-sm shadow-xl rounded-2xl bg-slate-900/95 text-white border border-slate-700 p-3.5 flex items-center gap-2.5 text-xs font-bold backdrop-blur-md animate-fadeIn">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${syncToast.isError ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="leading-tight">{syncToast.msg}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-6 max-w-full overflow-x-hidden">
        {/* Showcase Banner Iklan & Demo Khusus Pengunjung Belum Login */}
        {!currentUser && (
          <GuestLandingHero
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onExploreDemo={() => {
              const el = document.getElementById('demo-workspace');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        <div id="demo-workspace" className="space-y-6">
          {/* Banner Eksplorasi Demo jika Pengunjung Belum Login */}
          {!currentUser && (
            <div className="bg-emerald-50/95 border-2 border-emerald-300/80 text-emerald-950 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <span>✨ Anda sedang mencoba <strong>Demo Interaktif MutabaahKu</strong> di perangkat ini. Coba dengarkan audio rekaman atau tes gerakan sholat.</span>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-1.5 rounded-xl shadow-2xs text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Simpan Permanen ke Akun</span>
              </button>
            </div>
          )}

          {/* Banner Mode Pratinjau Jika Orang Tua Sedang Memeriksa Ruang Anak */}
          {currentRole === 'PARENT' && isPreviewingStudent && (
            <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Anda sedang melihat <strong>Pratinjau Ruang Belajar Anak</strong> ({activeChild?.full_name}).</span>
              </div>
              <button
                onClick={() => setIsPreviewingStudent(false)}
                className="bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-black hover:bg-amber-700 transition-colors shadow-2xs"
              >
                Kembali ke Dashboard
              </button>
            </div>
          )}

          {/* STUDENT WORKSPACE (Tampil jika role STUDENT atau Orang Tua dalam Mode Pratinjau) */}
          {currentRole === 'STUDENT' || isPreviewingStudent ? (
            <>
              {/* Mascot Greeting Strip */}
              <MascotCharacter
                gender={activeChild?.gender || 'PUTRA'}
                message={`Assalamu'alaikum, ${activeChild?.full_name || 'Hafiz'}! Yuk bersiap sholat tepat waktu dan muroja'ah hafalan Juz 30 hari ini!`}
                actionText={`Ganti Mode Karakter (${activeChild?.gender === 'PUTRA' ? 'Si Hafiz' : 'Si Hafizah'})`}
                onActionClick={handleToggleGender}
              />

              {/* Status Tautan Orang Tua (Khusus Siswa yang Login, Bukan Mode Pratinjau Ortu) */}
              {currentUser && studentProfile && !isPreviewingStudent && (
                <ParentLinkCard student={studentProfile} linkedParent={linkedParent || undefined} />
              )}

              {/* Virtual Garden Widget */}
              <PahalaGarden
                treeLevel={activeChild?.garden_tree_level || 2}
                waterDrops={activeChild?.water_drops || 42}
                starPoints={activeChild?.star_points || 135}
                unlockedStickers={activeChild?.unlocked_stickers || ['sticker_welcome_star', 'sticker_kabah']}
                onWaterTree={handleWaterTree}
              />

              {/* Student Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-emerald-500/20">
                <button
                  onClick={() => setActiveTab('SHOLAT')}
                  className={`btn-chunky py-2.5 px-4 text-xs font-black whitespace-nowrap ${
                    activeTab === 'SHOLAT'
                      ? 'btn-chunky-emerald shadow-chunky-emerald'
                      : 'btn-chunky-ghost'
                  }`}
                >
                  <span>🕌 Belajar Gerakan & Bacaan Sholat</span>
                </button>

                <button
                  onClick={() => setActiveTab('PRAYER_QIBLA')}
                  className={`btn-chunky py-2.5 px-4 text-xs font-black whitespace-nowrap ${
                    activeTab === 'PRAYER_QIBLA'
                      ? 'btn-chunky-sky shadow-chunky-sky'
                      : 'btn-chunky-ghost'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Jadwal Sholat & Kompas Ka'bah</span>
                </button>

                <button
                  onClick={() => setActiveTab('MUROJAAH')}
                  className={`btn-chunky py-2.5 px-4 text-xs font-black whitespace-nowrap ${
                    activeTab === 'MUROJAAH'
                      ? 'btn-chunky-amber shadow-chunky-amber'
                      : 'btn-chunky-ghost'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Ceklis Muroja'ah Ujian</span>
                </button>

                <button
                  onClick={() => setActiveTab('YAUMIYAH')}
                  className={`btn-chunky py-2.5 px-4 text-xs font-black whitespace-nowrap ${
                    activeTab === 'YAUMIYAH'
                      ? 'btn-chunky-lavender'
                      : 'btn-chunky-ghost'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Mutaba'ah Yaumiyah (Sholat & Puasa)</span>
                </button>
              </div>

              {/* Active Tab View */}
              {activeTab === 'SHOLAT' && (
                <SholatAnimator
                  gender={activeChild?.gender || 'PUTRA'}
                  onStepCompleted={handleStepCompleted}
                />
              )}

              {activeTab === 'PRAYER_QIBLA' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <PrayerTimesCard
                      cityId={activeChild?.prayer_city_id}
                      cityName={activeChild?.prayer_city_name}
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <QiblaCompass
                      latitude={activeChild?.latitude}
                      longitude={activeChild?.longitude}
                      cityName={activeChild?.prayer_city_name}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'MUROJAAH' && (
                <MurojaahChecklist
                  checklists={checklists}
                  currentStudentId={activeChild?.id}
                  onPassIncrement={handlePassIncrement}
                  onClaimReview={(id) => handlePassIncrement(id)}
                />
              )}

              {activeTab === 'YAUMIYAH' && (
                <IbadahTracker
                  initialLog={todayIbadahLog || defaultIbadahLog}
                  onSaveLog={handleSaveIbadah}
                />
              )}
            </>
          ) : (
            /* PARENT DASHBOARD DENGAN PEMBAGIAN ANAK-ANAK & REVIEW AUDIO HAFALAN */
            parentProfile && (
              <ParentDashboard
                parentProfile={parentProfile}
                childProfile={activeChild}
                allChildren={allChildren}
                activeChildId={activeChild?.id || selectedChildId}
                onSelectChild={(id) => setSelectedChildId(id)}
                onAddChild={async (childData) => {
                  try {
                    const res = await linkChildByEmail(parentProfile, {
                      email: childData.email,
                      fullName: childData.fullName,
                      gender: childData.gender,
                      grade: childData.grade,
                      schoolName: childData.schoolName
                    });
                    setSelectedChildId(res.profile.id);
                    setSyncToast({
                      show: true,
                      msg: `✅ Berhasil menghubungkan akun anak: ${res.profile.full_name} (${res.profile.email})`
                    });
                    setTimeout(() => setSyncToast(null), 4000);
                  } catch (err: any) {
                    setSyncToast({
                      show: true,
                      msg: `⚠️ ${err.message || 'Gagal menghubungkan anak'}`,
                      isError: true
                    });
                    setTimeout(() => setSyncToast(null), 4000);
                    throw err;
                  }
                }}
                onDeleteChild={async (childId) => {
                  await deleteChildProfile(childId);
                  if (supabase) {
                    try {
                      await supabase.from('murojaah_checklists').delete().eq('student_id', childId);
                      await supabase.from('ibadah_daily_logs').delete().eq('student_id', childId);
                      await supabase.from('academic_levels').delete().eq('student_id', childId);
                      await supabase.from('exam_cycles').delete().eq('student_id', childId);
                      await supabase.from('curriculum_items').delete().eq('student_id', childId);
                      await supabase.from('sholat_learning_progress').delete().eq('student_id', childId);
                      await supabase.from('fsrs_memory_states').delete().eq('student_id', childId);
                      await supabase.from('mutabaah_logs').delete().eq('student_id', childId);
                      await supabase.from('user_profiles').delete().eq('id', childId);
                    } catch (remoteErr) {
                      console.warn('Gagal menghapus relasi di remote Supabase:', remoteErr);
                    }
                  }
                  const remaining = allChildren.filter(c => c.id !== childId);
                  setSelectedChildId(remaining[0]?.id || '');
                }}
                pendingChecklists={checklists.filter(c => c.parent_review_status === 'PENDING')}
                pendingIbadahLog={todayIbadahLog || defaultIbadahLog}
                onApproveChecklist={handleApproveChecklist}
                onApproveIbadah={handleApproveIbadah}
              />
            )
          )}
        </div>
      </main>

      {/* Modal Login & Register */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setIsLoginModalOpen(false);
          handleAuthUser(user);
        }}
      />

      {/* Halaman Admin Cloud Supabase */}
      {isAdminOpen && (
        <AdminDashboard
          currentUserEmail={currentUser?.email}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Modal Sinkronisasi Cloud & Multi-Device Google SSO */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

      {/* Modal Pemilihan Peran Pertama Kali Login Google */}
      <RoleSelectionModal
        isOpen={showRolePicker}
        userEmail={currentUser?.email}
        userName={currentUser?.user_metadata?.full_name}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
}

export default App;
