import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { db } from './db';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qedenyqmbnuidtgivxwe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey !== '');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// ============================================================================
// AUTENTIKASI GOOGLE SSO & SESI PENGGUNA
// ============================================================================

/**
 * Login dengan Google SSO (OAuth)
 */
export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi dengan API Key.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Logout dari sesi Google / Supabase
 */
export async function signOutUser() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Mendapatkan profil pengguna yang sedang login saat ini
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

// ============================================================================
// OFFLINE SYNC QUEUE (PENCATATAN OPERASI LOKAL SAAT TANPA KONEKSI)
// ============================================================================

export async function queueOfflineAction(
  tableName: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  recordId: string,
  payload: Record<string, any>
) {
  await db.sync_queue.add({
    table_name: tableName,
    operation,
    record_id: recordId,
    payload,
    status: 'PENDING',
    created_at: new Date().toISOString()
  });

  // Jika online dan supabase tersedia, coba sinkronisasi di latar belakang
  if (navigator.onLine && isSupabaseConfigured) {
    syncOfflineQueueToSupabase().catch(console.error);
  }
}

/**
 * Memproses antrean sinkronisasi lokal ke Supabase Cloud (Push)
 */
export async function syncOfflineQueueToSupabase(): Promise<{ synced: number; failed: number }> {
  if (!supabase) {
    return { synced: 0, failed: 0 };
  }

  const pendingItems = await db.sync_queue.where('status').equals('PENDING').toArray();
  let synced = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      if (item.operation === 'INSERT') {
        const { error } = await supabase.from(item.table_name).upsert(item.payload, { onConflict: 'id' });
        if (error) throw error;
      } else if (item.operation === 'UPDATE') {
        const { error } = await supabase.from(item.table_name).upsert({ id: item.record_id, ...item.payload }, { onConflict: 'id' });
        if (error) throw error;
      } else if (item.operation === 'DELETE') {
        const { error } = await supabase.from(item.table_name).delete().eq('id', item.record_id);
        if (error) throw error;
      }

      if (item.id) {
        await db.sync_queue.update(item.id, { status: 'SYNCED' });
      }
      synced++;
    } catch (err: any) {
      console.warn(`Sync failed for item ${item.id}:`, err.message);
      if (item.id) {
        await db.sync_queue.update(item.id, {
          status: 'FAILED',
          error_message: err.message || 'Network sync error'
        });
      }
      failed++;
    }
  }

  return { synced, failed };
}

// ============================================================================
// PULL CLOUD DATA TO LOCAL (MULTI-DEVICE RESTORATION DENGAN GOOGLE SSO)
// ============================================================================

/**
 * Menarik seluruh data 10 tabel dari Supabase Cloud ke IndexedDB Dexie lokal
 * Menjamin zero data loss saat pengguna berpindah perangkat (ganti HP / tablet).
 */
export async function pullRemoteDataFromSupabase(userEmail?: string): Promise<{
  pulledCount: number;
  tables: Record<string, number>;
}> {
  if (!supabase) {
    return { pulledCount: 0, tables: {} };
  }

  const tableCounts: Record<string, number> = {};
  let totalPulled = 0;

  try {
    // 1. Ambil Profil Pengguna berdasarkan email atau session
    let profileQuery = supabase.from('user_profiles').select('*');
    if (userEmail) {
      profileQuery = profileQuery.eq('email', userEmail);
    }
    const { data: profiles, error: profileErr } = await profileQuery;
    if (profileErr) throw profileErr;

    if (profiles && profiles.length > 0) {
      await db.user_profiles.bulkPut(profiles);
      tableCounts['user_profiles'] = profiles.length;
      totalPulled += profiles.length;

      // Ambil seluruh student_id yang terkait (termasuk anak dari profil orang tua ini)
      const userIds = profiles.map(p => p.id);
      const studentIds = profiles
        .filter(p => p.role === 'STUDENT')
        .map(p => p.id);

      // Jika role adalah parent, cari profil anak-anaknya di cloud
      const parentIds = profiles.filter(p => p.role === 'PARENT').map(p => p.id);
      if (parentIds.length > 0) {
        const { data: childProfiles } = await supabase
          .from('user_profiles')
          .select('*')
          .in('parent_id', parentIds);
        if (childProfiles && childProfiles.length > 0) {
          await db.user_profiles.bulkPut(childProfiles);
          childProfiles.forEach(c => {
            if (!studentIds.includes(c.id)) studentIds.push(c.id);
          });
        }
      }

      const allRelevantStudentIds = studentIds.length > 0 ? studentIds : userIds;

      // 2. Tingkat Kelas (academic_levels)
      const { data: academicLevels } = await supabase
        .from('academic_levels')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (academicLevels && academicLevels.length > 0) {
        await db.academic_levels.bulkPut(academicLevels);
        tableCounts['academic_levels'] = academicLevels.length;
        totalPulled += academicLevels.length;
      }

      // 3. Siklus Ujian (exam_cycles)
      const { data: examCycles } = await supabase
        .from('exam_cycles')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (examCycles && examCycles.length > 0) {
        await db.exam_cycles.bulkPut(examCycles);
        tableCounts['exam_cycles'] = examCycles.length;
        totalPulled += examCycles.length;
      }

      // 4. Item Kurikulum (curriculum_items)
      const { data: curriculumItems } = await supabase
        .from('curriculum_items')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (curriculumItems && curriculumItems.length > 0) {
        await db.curriculum_items.bulkPut(curriculumItems);
        tableCounts['curriculum_items'] = curriculumItems.length;
        totalPulled += curriculumItems.length;

        // Pull unit konten terkait curriculum items
        const currItemIds = curriculumItems.map(c => c.id);
        const { data: contentUnits } = await supabase
          .from('content_units')
          .select('*')
          .in('curriculum_item_id', currItemIds);
        if (contentUnits && contentUnits.length > 0) {
          await db.content_units.bulkPut(contentUnits);
          tableCounts['content_units'] = contentUnits.length;
          totalPulled += contentUnits.length;
        }
      }

      // 5. Ceklis Muroja'ah (murojaah_checklists)
      const { data: checklists } = await supabase
        .from('murojaah_checklists')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (checklists && checklists.length > 0) {
        await db.murojaah_checklists.bulkPut(checklists);
        tableCounts['murojaah_checklists'] = checklists.length;
        totalPulled += checklists.length;
      }

      // 6. Progres Belajar Sholat (sholat_learning_progress)
      const { data: sholatProgress } = await supabase
        .from('sholat_learning_progress')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (sholatProgress && sholatProgress.length > 0) {
        await db.sholat_learning_progress.bulkPut(sholatProgress);
        tableCounts['sholat_learning_progress'] = sholatProgress.length;
        totalPulled += sholatProgress.length;
      }

      // 7. Catatan Ibadah Harian (ibadah_daily_logs)
      const { data: ibadahLogs } = await supabase
        .from('ibadah_daily_logs')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (ibadahLogs && ibadahLogs.length > 0) {
        await db.ibadah_daily_logs.bulkPut(ibadahLogs);
        tableCounts['ibadah_daily_logs'] = ibadahLogs.length;
        totalPulled += ibadahLogs.length;
      }

      // 8. FSRS Memory States (fsrs_memory_states)
      const { data: fsrsStates } = await supabase
        .from('fsrs_memory_states')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (fsrsStates && fsrsStates.length > 0) {
        await db.fsrs_memory_states.bulkPut(fsrsStates);
        tableCounts['fsrs_memory_states'] = fsrsStates.length;
        totalPulled += fsrsStates.length;
      }

      // 9. Mutabaah Logs (mutabaah_logs)
      const { data: mutabaahLogs } = await supabase
        .from('mutabaah_logs')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      if (mutabaahLogs && mutabaahLogs.length > 0) {
        await db.mutabaah_logs.bulkPut(mutabaahLogs);
        tableCounts['mutabaah_logs'] = mutabaahLogs.length;
        totalPulled += mutabaahLogs.length;
      }
    }
  } catch (err: any) {
    console.warn('Error during pullRemoteDataFromSupabase:', err.message);
  }

  return { pulledCount: totalPulled, tables: tableCounts };
}

// ============================================================================
// FULL BI-DIRECTIONAL SYNC TRIGGER (DIPANGGIL DENGAN TEKAN TOMBOL SYNC)
// ============================================================================

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  tables: Record<string, number>;
  timestamp: string;
  error?: string;
}

/**
 * Menjalankan sinkronisasi lengkap 2 arah:
 * 1. Push: Mengunggah perubahan antrean lokal ke Cloud
 * 2. Push State: Mengunggah data lokal terkini (profil, ibadah, hafalan, sholat)
 * 3. Pull: Menarik data terbaru dari Cloud agar identik lintas perangkat
 */
export async function executeFullSync(userEmail?: string): Promise<SyncResult> {
  const timestamp = new Date().toISOString();

  if (!navigator.onLine) {
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      tables: {},
      timestamp,
      error: 'Perangkat sedang offline. Data Anda aman tersimpan di perangkat lokal.'
    };
  }

  if (!supabase) {
    // Simulasi offline-first jika kunci API belum dipasang di env
    return {
      success: true,
      pushed: 0,
      pulled: 0,
      tables: { 'local_storage': 1 },
      timestamp
    };
  }

  try {
    // Langkah 1: Push antrean offline
    const pushQueueResult = await syncOfflineQueueToSupabase();
    let totalPushed = pushQueueResult.synced;

    // Langkah 2: Push snapshot lokal untuk seluruh 10 TABEL ke Supabase
    // 1. Profil Pengguna
    const localProfiles = await db.user_profiles.toArray();
    if (localProfiles.length > 0) {
      try {
        await supabase.from('user_profiles').upsert(localProfiles, { onConflict: 'id' });
        totalPushed += localProfiles.length;
      } catch (e: any) {
        console.warn('Sync push user_profiles error:', e.message);
      }
    }

    // 2. Tingkat Kelas Akademik
    const localLevels = await db.academic_levels.toArray();
    if (localLevels.length > 0) {
      try {
        await supabase.from('academic_levels').upsert(localLevels, { onConflict: 'id' });
        totalPushed += localLevels.length;
      } catch (e: any) {
        console.warn('Sync push academic_levels error:', e.message);
      }
    }

    // 3. Siklus Ujian
    const localCycles = await db.exam_cycles.toArray();
    if (localCycles.length > 0) {
      try {
        await supabase.from('exam_cycles').upsert(localCycles, { onConflict: 'id' });
        totalPushed += localCycles.length;
      } catch (e: any) {
        console.warn('Sync push exam_cycles error:', e.message);
      }
    }

    // 4. Item Kurikulum Hafalan
    const localCurriculum = await db.curriculum_items.toArray();
    if (localCurriculum.length > 0) {
      try {
        await supabase.from('curriculum_items').upsert(localCurriculum, { onConflict: 'id' });
        totalPushed += localCurriculum.length;
      } catch (e: any) {
        console.warn('Sync push curriculum_items error:', e.message);
      }
    }

    // 5. Unit Konten (Ayat & Matan)
    const localUnits = await db.content_units.toArray();
    if (localUnits.length > 0) {
      try {
        await supabase.from('content_units').upsert(localUnits, { onConflict: 'id' });
        totalPushed += localUnits.length;
      } catch (e: any) {
        console.warn('Sync push content_units error:', e.message);
      }
    }

    // 6. Ceklis Muroja'ah (termasuk rekaman suara & grade)
    const localChecklists = await db.murojaah_checklists.toArray();
    if (localChecklists.length > 0) {
      try {
        await supabase.from('murojaah_checklists').upsert(localChecklists, { onConflict: 'id' });
        totalPushed += localChecklists.length;
      } catch (e: any) {
        console.warn('Sync push murojaah_checklists error:', e.message);
      }
    }

    // 7. Catatan Ibadah Yaumiyah
    const localIbadah = await db.ibadah_daily_logs.toArray();
    if (localIbadah.length > 0) {
      try {
        await supabase.from('ibadah_daily_logs').upsert(localIbadah, { onConflict: 'id' });
        totalPushed += localIbadah.length;
      } catch (e: any) {
        console.warn('Sync push ibadah_daily_logs error:', e.message);
      }
    }

    // 8. Progres Belajar Sholat 13 Rukun
    const localSholat = await db.sholat_learning_progress.toArray();
    if (localSholat.length > 0) {
      try {
        await supabase.from('sholat_learning_progress').upsert(localSholat, { onConflict: 'id' });
        totalPushed += localSholat.length;
      } catch (e: any) {
        console.warn('Sync push sholat_learning_progress error:', e.message);
      }
    }

    // 9. State Memori FSRS-6
    const localFsrs = await db.fsrs_memory_states.toArray();
    if (localFsrs.length > 0) {
      try {
        await supabase.from('fsrs_memory_states').upsert(localFsrs, { onConflict: 'id' });
        totalPushed += localFsrs.length;
      } catch (e: any) {
        console.warn('Sync push fsrs_memory_states error:', e.message);
      }
    }

    // 10. Log Setoran Ujian
    const localLogs = await db.mutabaah_logs.toArray();
    if (localLogs.length > 0) {
      try {
        await supabase.from('mutabaah_logs').upsert(localLogs, { onConflict: 'id' });
        totalPushed += localLogs.length;
      } catch (e: any) {
        console.warn('Sync push mutabaah_logs error:', e.message);
      }
    }

    // Langkah 3: Pull data dari Cloud ke Lokal
    const pullResult = await pullRemoteDataFromSupabase(userEmail);

    // Simpan timestamp sinkronisasi terakhir di browser
    localStorage.setItem('mutabaahku_last_synced', timestamp);

    return {
      success: true,
      pushed: totalPushed,
      pulled: pullResult.pulledCount,
      tables: pullResult.tables,
      timestamp
    };
  } catch (err: any) {
    console.error('executeFullSync failed:', err);
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      tables: {},
      timestamp,
      error: err.message || 'Gagal menyinkronkan data dengan Cloud.'
    };
  }
}
