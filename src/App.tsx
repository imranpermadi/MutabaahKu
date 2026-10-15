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
  Heart,
  Wifi,
  WifiOff,
  RefreshCw,
  Cloud,
  Eye
} from 'lucide-react';
import { db, seedInitialData } from './lib/db';
import { syncOfflineQueueToSupabase, isSupabaseConfigured, supabase } from './lib/supabase';
import { UserRole, UserGender, UserProfile } from './types/database';
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

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isPreviewingStudent, setIsPreviewingStudent] = useState(false);
  const [activeTab, setActiveTab] = useState<'SHOLAT' | 'PRAYER_QIBLA' | 'MUROJAAH' | 'YAUMIYAH'>('SHOLAT');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Initialize offline seed data and listen for Google SSO Auth on boot
  useEffect(() => {
    seedInitialData();

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
      };
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAuthUser = async (user: any) => {
    setCurrentUser(user);
    const existing = await db.user_profiles.where('email').equals(user.email || '').first();
    if (existing && existing.role) {
      setCurrentRole(existing.role);
    } else {
      if (supabase) {
        const { data: cloudProfiles } = await supabase.from('user_profiles').select('*').eq('email', user.email);
        if (cloudProfiles && cloudProfiles.length > 0 && cloudProfiles[0].role) {
          await db.user_profiles.put(cloudProfiles[0]);
          setCurrentRole(cloudProfiles[0].role);
          return;
        }
      }
      setShowRolePicker(true);
    }
  };

  const handleSelectRole = async (selectedRole: UserRole) => {
    setShowRolePicker(false);
    setCurrentRole(selectedRole);

    if (currentUser) {
      const newProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email,
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
      if (supabase) {
        await supabase.from('user_profiles').upsert(newProfile, { onConflict: 'id' });
      }
    }
  };

  // Dexie Live Queries
  const studentProfile = useLiveQuery(() => db.user_profiles.where('role').equals('STUDENT').first());
  const parentProfile = useLiveQuery(() => db.user_profiles.where('role').equals('PARENT').first());
  const checklists = useLiveQuery(() => db.murojaah_checklists.toArray()) || [];
  const today = new Date().toISOString().split('T')[0];
  const todayIbadahLog = useLiveQuery(() => 
    db.ibadah_daily_logs.where('student_id').equals(studentProfile?.id || '').first()
  );

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncOfflineQueueToSupabase();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleWaterTree = async () => {
    if (!studentProfile) return;
    const newDrops = Math.max(0, studentProfile.water_drops - 10);
    const newLevel = Math.min(5, studentProfile.garden_tree_level + 1);
    await db.user_profiles.update(studentProfile.id, {
      water_drops: newDrops,
      garden_tree_level: newLevel
    });
  };

  const handleStepCompleted = async () => {
    if (!studentProfile) return;
    await db.user_profiles.update(studentProfile.id, {
      star_points: studentProfile.star_points + 10,
      water_drops: studentProfile.water_drops + 5
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

    if (studentProfile) {
      await db.user_profiles.update(studentProfile.id, {
        star_points: studentProfile.star_points + 20,
        water_drops: studentProfile.water_drops + 10
      });
    }
  };

  const handleApproveIbadah = async (logId: string, stars: number) => {
    await db.ibadah_daily_logs.update(logId, {
      parent_review_status: 'APPROVED',
      reward_stars_awarded: stars,
      reviewed_at: new Date().toISOString()
    });

    if (studentProfile) {
      await db.user_profiles.update(studentProfile.id, {
        star_points: studentProfile.star_points + stars,
        water_drops: studentProfile.water_drops + 15
      });
    }
  };

  const handleSaveIbadah = async (updated: any) => {
    await db.ibadah_daily_logs.put(updated);
  };

  const handleToggleGender = async () => {
    if (!studentProfile) return;
    const nextGender: UserGender = studentProfile.gender === 'PUTRA' ? 'PUTRI' : 'PUTRA';
    await db.user_profiles.update(studentProfile.id, { gender: nextGender });
  };

  const pendingChecklists = checklists.filter(c => c.parent_review_status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#F0FDF4]/60 text-slate-800 pb-16 selection:bg-emerald-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-emerald-500/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-chunky-emerald">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl text-emerald-950 tracking-tight">
                  Mutabaah<span className="text-emerald-600">Ku</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold hidden sm:block">
                Sahabat Ceria Hafalan & Ibadah Anak Sholih
              </p>
            </div>
          </div>

          {/* User Gamification Stats Strip */}
          {currentRole === 'STUDENT' && studentProfile && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Daily Streak */}
              <div className="flex items-center gap-1 bg-amber-50 text-amber-950 font-black text-xs px-2.5 py-1.5 rounded-xl border border-amber-200">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{studentProfile.daily_streak} Hari</span>
              </div>

              {/* Star Points */}
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-950 font-black text-xs px-2.5 py-1.5 rounded-xl border border-emerald-200">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{studentProfile.star_points}</span>
              </div>

              {/* Water Drops */}
              <div className="hidden sm:flex items-center gap-1 bg-sky-50 text-sky-950 font-black text-xs px-2.5 py-1.5 rounded-xl border border-sky-200">
                <Droplets className="w-4 h-4 fill-sky-400 text-sky-500" />
                <span>{studentProfile.water_drops}</span>
              </div>
            </div>
          )}

          {/* Role Switcher & Cloud Sync Indicator */}
          <div className="flex items-center gap-2">
            {/* Sync Cloud & Multi-Device Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              title="Buka Panel Sinkronisasi Cloud & Pindah Perangkat (Google SSO)"
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs border active:scale-95 ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sync</span>
              <RefreshCw className={`w-3 h-3 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Role Badge & Identity (Pemisahan Akun Otomatis Sesuai Akun Google) */}
            {currentRole === 'PARENT' ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-800 text-white font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-700 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="hidden sm:inline">Portal Orang Tua</span>
                  <span className="sm:hidden">Orang Tua</span>
                  {pendingChecklists.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
                  )}
                </div>

                {/* Pratinjau Ruang Anak Khusus Akun Orang Tua */}
                <button
                  onClick={() => setIsPreviewingStudent(!isPreviewingStudent)}
                  title="Lihat tampilan aplikasi persis seperti yang dilihat anak"
                  className="hidden md:flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isPreviewingStudent ? 'Kembali ke Dashboard' : 'Pratinjau Ruang Anak'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-sky-100 text-sky-900 font-black text-xs px-2.5 py-1.5 rounded-xl border border-sky-300 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden sm:inline">Ruang Siswa</span>
                  <span className="sm:hidden">Siswa</span>
                </div>
              </div>
            )}

            {/* Login / Profile Avatar Pill */}
            {currentUser ? (
              <button
                onClick={() => setIsSyncModalOpen(true)}
                title={`Akun: ${currentUser.email} (${currentRole})`}
                className="w-8 h-8 rounded-full border-2 border-emerald-500 overflow-hidden flex items-center justify-center bg-emerald-100 text-emerald-800 font-black text-xs hover:ring-2 hover:ring-emerald-400 transition-all active:scale-95"
              >
                {currentUser.user_metadata?.avatar_url ? (
                  <img src={currentUser.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                  currentUser.email?.[0]?.toUpperCase() || 'U'
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-2.5 py-1.5 rounded-xl shadow-chunky-emerald flex items-center gap-1 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner Mode Pratinjau Jika Orang Tua Sedang Memeriksa Ruang Anak */}
        {currentRole === 'PARENT' && isPreviewingStudent && (
          <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Anda sedang melihat <strong>Pratinjau Ruang Belajar Anak</strong> (Hanya preview tampilan).</span>
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
              gender={studentProfile?.gender || 'PUTRA'}
              message={`Assalamu'alaikum, ${studentProfile?.full_name || 'Hafiz'}! Yuk bersiap sholat tepat waktu dan muroja'ah hafalan Juz 30 hari ini!`}
              actionText={`Ganti Mode Karakter (${studentProfile?.gender === 'PUTRA' ? 'Si Hafiz' : 'Si Hafizah'})`}
              onActionClick={handleToggleGender}
            />

            {/* Virtual Garden Widget */}
            <PahalaGarden
              treeLevel={studentProfile?.garden_tree_level || 2}
              waterDrops={studentProfile?.water_drops || 42}
              starPoints={studentProfile?.star_points || 135}
              unlockedStickers={studentProfile?.unlocked_stickers || ['sticker_welcome_star', 'sticker_kabah']}
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
                gender={studentProfile?.gender || 'PUTRA'}
                onStepCompleted={handleStepCompleted}
              />
            )}

            {activeTab === 'PRAYER_QIBLA' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <PrayerTimesCard
                    cityId={studentProfile?.prayer_city_id}
                    cityName={studentProfile?.prayer_city_name}
                  />
                </div>
                <div className="lg:col-span-5">
                  <QiblaCompass
                    latitude={studentProfile?.latitude}
                    longitude={studentProfile?.longitude}
                    cityName={studentProfile?.prayer_city_name}
                  />
                </div>
              </div>
            )}

            {activeTab === 'MUROJAAH' && (
              <MurojaahChecklist
                checklists={checklists}
                onPassIncrement={handlePassIncrement}
                onClaimReview={(id) => handlePassIncrement(id)}
              />
            )}

            {activeTab === 'YAUMIYAH' && todayIbadahLog && (
              <IbadahTracker
                initialLog={todayIbadahLog}
                onSaveLog={handleSaveIbadah}
              />
            )}
          </>
        ) : (
          /* PARENT DASHBOARD */
          parentProfile && studentProfile && (
            <ParentDashboard
              parentProfile={parentProfile}
              childProfile={studentProfile}
              pendingChecklists={pendingChecklists}
              pendingIbadahLog={todayIbadahLog}
              onApproveChecklist={handleApproveChecklist}
              onApproveIbadah={handleApproveIbadah}
            />
          )
        )}
      </main>

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
