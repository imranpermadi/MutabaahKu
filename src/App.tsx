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
  Cloud
} from 'lucide-react';
import { db, seedInitialData } from './lib/db';
import { syncOfflineQueueToSupabase, isSupabaseConfigured } from './lib/supabase';
import { UserRole, UserGender } from './types/database';
import { MascotCharacter } from './components/mascot/MascotCharacter';
import { SholatAnimator } from './components/prayer/SholatAnimator';
import { PrayerTimesCard } from './components/prayer/PrayerTimesCard';
import { QiblaCompass } from './components/prayer/QiblaCompass';
import { PahalaGarden } from './components/garden/PahalaGarden';
import { MurojaahChecklist } from './components/murojaah/MurojaahChecklist';
import { IbadahTracker } from './components/yaumiyah/IbadahTracker';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { SyncModal } from './components/sync/SyncModal';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [activeTab, setActiveTab] = useState<'SHOLAT' | 'PRAYER_QIBLA' | 'MUROJAAH' | 'YAUMIYAH'>('SHOLAT');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Initialize offline seed data on boot
  useEffect(() => {
    seedInitialData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

            {/* Role Switcher Tab (Orang Tua vs Anak) */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => setCurrentRole('STUDENT')}
                className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'STUDENT'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Ruang Anak</span>
              </button>
              <button
                onClick={() => setCurrentRole('PARENT')}
                className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'PARENT'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Orang Tua</span>
                {pendingChecklists.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* STUDENT WORKSPACE */}
        {currentRole === 'STUDENT' ? (
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
    </div>
  );
}

export default App;
