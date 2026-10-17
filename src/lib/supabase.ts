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

let queueSyncing = false;

/**
 * Memproses antrean sinkronisasi lokal ke Supabase Cloud (Push).
 * Item berstatus FAILED (mis. karena offline) ikut dicoba ulang.
 */
export async function syncOfflineQueueToSupabase(): Promise<{ synced: number; failed: number }> {
  if (!supabase) {
    return { synced: 0, failed: 0 };
  }
  // Pastikan semua perubahan terbaru di memori (debounce 400ms) langsung masuk ke sync_queue sebelum push/pull
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (pendingChanges.size > 0) {
    await flushPendingChanges(false);
  }

  if (queueSyncing) {
    return { synced: 0, failed: 0 };
  }
  queueSyncing = true;

  try {
    return await processSyncQueue();
  } finally {
    queueSyncing = false;
  }
}

async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (!supabase) return { synced: 0, failed: 0 };

  const pendingItems = await db.sync_queue.where('status').anyOf('PENDING', 'FAILED').toArray();
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
 * PENTING: Record lokal yang sedang diubah / belum tersinkron (PENDING/FAILED)
 * dilindungi agar TIDAK tertimpa oleh data lama dari Cloud.
 */
export async function pullRemoteDataFromSupabase(userEmail?: string): Promise<{
  pulledCount: number;
  tables: Record<string, number>;
}> {
  if (!supabase) {
    return { pulledCount: 0, tables: {} };
  }

  // Dorong semua perubahan lokal terlebih dahulu sebelum menarik dari cloud
  await syncOfflineQueueToSupabase();

  // Kumpulkan daftar record lokal yang belum berhasil ter-push ke cloud agar tidak tertimpa data lama
  const unsyncedQueue = await db.sync_queue.where('status').anyOf('PENDING', 'FAILED').toArray();
  const protectedKeys = new Set<string>();
  for (const q of unsyncedQueue) {
    protectedKeys.add(`${q.table_name}:${q.record_id}`);
  }
  for (const key of pendingChanges.keys()) {
    protectedKeys.add(key);
  }

  const filterSafeRows = <T extends { id: string }>(tableName: string, rows: T[] | null | undefined): T[] => {
    if (!rows || rows.length === 0) return [];
    return rows.filter(r => !protectedKeys.has(`${tableName}:${r.id}`));
  };

  const tableCounts: Record<string, number> = {};
  let totalPulled = 0;

  // Data yang baru ditarik dari cloud tidak perlu diantrekan lagi untuk di-push balik
  suppressSyncHooks = true;
  try {
    // 1. Ambil Profil Pengguna berdasarkan email atau session
    let profileQuery = supabase.from('user_profiles').select('*');
    if (userEmail) {
      // ilike = tidak sensitif huruf besar/kecil; escape wildcard LIKE agar cocok persis
      profileQuery = profileQuery.ilike('email', userEmail.trim().replace(/[\\%_]/g, (m) => '\\' + m));
    }
    const { data: profiles, error: profileErr } = await profileQuery;
    if (profileErr) throw profileErr;

    if (profiles && profiles.length > 0) {
      const safeProfiles = filterSafeRows('user_profiles', profiles);
      if (safeProfiles.length > 0) {
        await db.user_profiles.bulkPut(safeProfiles);
      }
      tableCounts['user_profiles'] = safeProfiles.length;
      totalPulled += safeProfiles.length;

      // Ambil seluruh student_id yang terkait (termasuk anak dari profil orang tua ini)
      const userIds = profiles.map(p => p.id);
      const studentIds = profiles
        .filter(p => p.role === 'STUDENT')
        .map(p => p.id);

      // Jika role adalah anak, tarik juga profil orang tua yang terhubung (parent_id)
      const linkedParentIds = profiles
        .filter(p => p.role === 'STUDENT' && p.parent_id)
        .map(p => p.parent_id as string);
      if (linkedParentIds.length > 0) {
        const { data: linkedParents } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', linkedParentIds);
        const safeLinkedParents = filterSafeRows('user_profiles', linkedParents);
        if (safeLinkedParents.length > 0) {
          await db.user_profiles.bulkPut(safeLinkedParents);
        }
      }

      // Jika role adalah parent, cari profil anak-anaknya di cloud
      const parentIds = profiles.filter(p => p.role === 'PARENT').map(p => p.id);
      if (parentIds.length > 0) {
        const { data: childProfiles } = await supabase
          .from('user_profiles')
          .select('*')
          .in('parent_id', parentIds);
        if (childProfiles && childProfiles.length > 0) {
          const safeChildren = filterSafeRows('user_profiles', childProfiles);
          if (safeChildren.length > 0) {
            await db.user_profiles.bulkPut(safeChildren);
          }
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
      const safeLevels = filterSafeRows('academic_levels', academicLevels);
      if (safeLevels.length > 0) {
        await db.academic_levels.bulkPut(safeLevels);
        tableCounts['academic_levels'] = safeLevels.length;
        totalPulled += safeLevels.length;
      }

      // 3. Siklus Ujian (exam_cycles)
      const { data: examCycles } = await supabase
        .from('exam_cycles')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeCycles = filterSafeRows('exam_cycles', examCycles);
      if (safeCycles.length > 0) {
        await db.exam_cycles.bulkPut(safeCycles);
        tableCounts['exam_cycles'] = safeCycles.length;
        totalPulled += safeCycles.length;
      }

      // 4. Item Kurikulum (curriculum_items)
      const { data: curriculumItems } = await supabase
        .from('curriculum_items')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeCurriculum = filterSafeRows('curriculum_items', curriculumItems);
      if (safeCurriculum.length > 0) {
        await db.curriculum_items.bulkPut(safeCurriculum);
        tableCounts['curriculum_items'] = safeCurriculum.length;
        totalPulled += safeCurriculum.length;
      }
      if (curriculumItems && curriculumItems.length > 0) {
        // Pull unit konten terkait curriculum items
        const currItemIds = curriculumItems.map(c => c.id);
        const { data: contentUnits } = await supabase
          .from('content_units')
          .select('*')
          .in('curriculum_item_id', currItemIds);
        const safeUnits = filterSafeRows('content_units', contentUnits);
        if (safeUnits.length > 0) {
          await db.content_units.bulkPut(safeUnits);
          tableCounts['content_units'] = safeUnits.length;
          totalPulled += safeUnits.length;
        }
      }

      // 5. Ceklis Muroja'ah (murojaah_checklists)
      const { data: checklists } = await supabase
        .from('murojaah_checklists')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeChecklists = filterSafeRows('murojaah_checklists', checklists);
      if (safeChecklists.length > 0) {
        await db.murojaah_checklists.bulkPut(safeChecklists);
        tableCounts['murojaah_checklists'] = safeChecklists.length;
        totalPulled += safeChecklists.length;
      }

      // 6. Progres Belajar Sholat (sholat_learning_progress)
      const { data: sholatProgress } = await supabase
        .from('sholat_learning_progress')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeSholat = filterSafeRows('sholat_learning_progress', sholatProgress);
      if (safeSholat.length > 0) {
        await db.sholat_learning_progress.bulkPut(safeSholat);
        tableCounts['sholat_learning_progress'] = safeSholat.length;
        totalPulled += safeSholat.length;
      }

      // 7. Catatan Ibadah Harian (ibadah_daily_logs)
      const { data: ibadahLogs } = await supabase
        .from('ibadah_daily_logs')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeIbadahLogs = filterSafeRows('ibadah_daily_logs', ibadahLogs);
      if (safeIbadahLogs.length > 0) {
        await db.ibadah_daily_logs.bulkPut(safeIbadahLogs);
        tableCounts['ibadah_daily_logs'] = safeIbadahLogs.length;
        totalPulled += safeIbadahLogs.length;
      }

      // 8. FSRS Memory States (fsrs_memory_states)
      const { data: fsrsStates } = await supabase
        .from('fsrs_memory_states')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeFsrs = filterSafeRows('fsrs_memory_states', fsrsStates);
      if (safeFsrs.length > 0) {
        await db.fsrs_memory_states.bulkPut(safeFsrs);
        tableCounts['fsrs_memory_states'] = safeFsrs.length;
        totalPulled += safeFsrs.length;
      }

      // 9. Mutabaah Logs (mutabaah_logs)
      const { data: mutabaahLogs } = await supabase
        .from('mutabaah_logs')
        .select('*')
        .in('student_id', allRelevantStudentIds);
      const safeMutabaahLogs = filterSafeRows('mutabaah_logs', mutabaahLogs);
      if (safeMutabaahLogs.length > 0) {
        await db.mutabaah_logs.bulkPut(safeMutabaahLogs);
        tableCounts['mutabaah_logs'] = safeMutabaahLogs.length;
        totalPulled += safeMutabaahLogs.length;
      }
    }
  } catch (err: any) {
    console.warn('Error during pullRemoteDataFromSupabase:', err.message);
  } finally {
    suppressSyncHooks = false;
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
    // Langkah 1: Push antrean offline terlebih dahulu
    const pushQueueResult = await syncOfflineQueueToSupabase();
    let totalPushed = pushQueueResult.synced;

    // Langkah 2: Push snapshot lokal untuk seluruh 10 TABEL ke Supabase terlebih dahulu
    // agar pilihan terbaru di perangkat ini tidak tertimpa data lama dari cloud
    const localProfiles = await db.user_profiles.toArray();
    if (localProfiles.length > 0) {
      try {
        await supabase.from('user_profiles').upsert(localProfiles, { onConflict: 'id' });
        totalPushed += localProfiles.length;
      } catch (e: any) {
        console.warn('Sync push user_profiles error:', e.message);
      }
    }

    const localLevels = await db.academic_levels.toArray();
    if (localLevels.length > 0) {
      try {
        await supabase.from('academic_levels').upsert(localLevels, { onConflict: 'id' });
        totalPushed += localLevels.length;
      } catch (e: any) {
        console.warn('Sync push academic_levels error:', e.message);
      }
    }

    const localCycles = await db.exam_cycles.toArray();
    if (localCycles.length > 0) {
      try {
        await supabase.from('exam_cycles').upsert(localCycles, { onConflict: 'id' });
        totalPushed += localCycles.length;
      } catch (e: any) {
        console.warn('Sync push exam_cycles error:', e.message);
      }
    }

    const localCurriculum = await db.curriculum_items.toArray();
    if (localCurriculum.length > 0) {
      try {
        await supabase.from('curriculum_items').upsert(localCurriculum, { onConflict: 'id' });
        totalPushed += localCurriculum.length;
      } catch (e: any) {
        console.warn('Sync push curriculum_items error:', e.message);
      }
    }

    const localUnits = await db.content_units.toArray();
    if (localUnits.length > 0) {
      try {
        await supabase.from('content_units').upsert(localUnits, { onConflict: 'id' });
        totalPushed += localUnits.length;
      } catch (e: any) {
        console.warn('Sync push content_units error:', e.message);
      }
    }

    const localChecklists = await db.murojaah_checklists.toArray();
    if (localChecklists.length > 0) {
      try {
        await supabase.from('murojaah_checklists').upsert(localChecklists, { onConflict: 'id' });
        totalPushed += localChecklists.length;
      } catch (e: any) {
        console.warn('Sync push murojaah_checklists error:', e.message);
      }
    }

    const localIbadah = await db.ibadah_daily_logs.toArray();
    if (localIbadah.length > 0) {
      try {
        await supabase.from('ibadah_daily_logs').upsert(localIbadah, { onConflict: 'id' });
        totalPushed += localIbadah.length;
      } catch (e: any) {
        console.warn('Sync push ibadah_daily_logs error:', e.message);
      }
    }

    const localSholat = await db.sholat_learning_progress.toArray();
    if (localSholat.length > 0) {
      try {
        await supabase.from('sholat_learning_progress').upsert(localSholat, { onConflict: 'id' });
        totalPushed += localSholat.length;
      } catch (e: any) {
        console.warn('Sync push sholat_learning_progress error:', e.message);
      }
    }

    const localFsrs = await db.fsrs_memory_states.toArray();
    if (localFsrs.length > 0) {
      try {
        await supabase.from('fsrs_memory_states').upsert(localFsrs, { onConflict: 'id' });
        totalPushed += localFsrs.length;
      } catch (e: any) {
        console.warn('Sync push fsrs_memory_states error:', e.message);
      }
    }

    const localLogs = await db.mutabaah_logs.toArray();
    if (localLogs.length > 0) {
      try {
        await supabase.from('mutabaah_logs').upsert(localLogs, { onConflict: 'id' });
        totalPushed += localLogs.length;
      } catch (e: any) {
        console.warn('Sync push mutabaah_logs error:', e.message);
      }
    }

    // Langkah 3: Pull data terbaru dari cloud (record lokal yang belum tersinkron tetap dilindungi)
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

// ============================================================================
// AUTO-SYNC: SETIAP PENULISAN KE DEXIE OTOMATIS DIANTREKAN KE CLOUD
// Inilah yang membuat setoran anak langsung terlihat di akun orang tua
// (dan paraf orang tua langsung terlihat di akun anak) tanpa menekan tombol Sync.
// ============================================================================

let suppressSyncHooks = false;

const AUTO_SYNC_TABLES = [
  'user_profiles',
  'academic_levels',
  'exam_cycles',
  'curriculum_items',
  'content_units',
  'murojaah_checklists',
  'fsrs_memory_states',
  'mutabaah_logs',
  'ibadah_daily_logs',
  'sholat_learning_progress'
] as const;

const pendingChanges = new Map<string, { table: string; id: string; deleted: boolean }>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushPendingChanges(autoPush = true) {
  flushTimer = null;
  const changes = Array.from(pendingChanges.values());
  pendingChanges.clear();

  for (const change of changes) {
    try {
      if (change.deleted) {
        await db.sync_queue.add({
          table_name: change.table,
          operation: 'DELETE',
          record_id: change.id,
          payload: {},
          status: 'PENDING',
          created_at: new Date().toISOString()
        });
      } else {
        const row = await (db as any)[change.table].get(change.id);
        if (!row) continue;
        await db.sync_queue.add({
          table_name: change.table,
          operation: 'INSERT', // upsert penuh berdasarkan id
          record_id: change.id,
          payload: row,
          status: 'PENDING',
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Gagal mengantrekan perubahan untuk sinkronisasi:', err);
    }
  }

  if (autoPush && navigator.onLine) {
    syncOfflineQueueToSupabase().catch(console.error);
  }
}

function scheduleChange(table: string, id: string, deleted: boolean) {
  pendingChanges.set(`${table}:${id}`, { table, id, deleted });
  if (!flushTimer) {
    flushTimer = setTimeout(() => flushPendingChanges(true), 400);
  }
}

if (isSupabaseConfigured) {
  for (const tableName of AUTO_SYNC_TABLES) {
    const table = (db as any)[tableName];
    table.hook('creating', function (this: any, primKey: any, obj: any) {
      if (suppressSyncHooks) return;
      const id = primKey ?? obj?.id;
      this.onsuccess = (key: any) => scheduleChange(tableName, String(key ?? id), false);
    });
    table.hook('updating', function (this: any, _mods: any, primKey: any) {
      if (suppressSyncHooks) return;
      this.onsuccess = () => scheduleChange(tableName, String(primKey), false);
    });
    table.hook('deleting', function (this: any, primKey: any) {
      if (suppressSyncHooks) return;
      this.onsuccess = () => scheduleChange(tableName, String(primKey), true);
    });
  }
}

/**
 * Sinkronisasi ringan berkala: dorong antrean lalu tarik data terbaru dari cloud.
 * Dipanggil oleh App secara periodik agar dua perangkat (anak & orang tua) tetap sinkron.
 */
export async function backgroundSync(userEmail: string) {
  if (!supabase || !navigator.onLine) return;
  await syncOfflineQueueToSupabase();
  await pullRemoteDataFromSupabase(userEmail);
}
