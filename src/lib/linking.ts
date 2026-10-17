import { db, addChildProfile, ensureStarterChecklists } from './db';
import { supabase } from './supabase';
import { UserGender, UserProfile } from '../types/database';

/**
 * Penautan akun Orang Tua <-> Anak berbasis EMAIL.
 *
 * Satu-satunya "kunci" relasi adalah kolom `parent_id` pada profil anak:
 *  - Orang tua memasukkan email anak  -> profil anak (yang sudah mendaftar, atau profil
 *    cadangan yang dibuat saat itu juga) diberi parent_id = id orang tua.
 *  - Anak memasukkan email orang tua  -> profil anak diberi parent_id = id orang tua.
 * Setelah itu setiap login (di perangkat mana pun), relasi dibaca dari parent_id
 * dan seluruh setoran anak (student_id) otomatis tampil di akun orang tua.
 */

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LinkError extends Error {}

async function findProfileByEmail(email: string): Promise<UserProfile | null> {
  // Cloud dulu: orang tua & anak biasanya login di perangkat berbeda
  if (supabase && navigator.onLine) {
    try {
      const escaped = email.replace(/[\\%_]/g, (m) => '\\' + m);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('email', escaped)
        .limit(1);
      if (!error && data && data.length > 0) {
        await db.user_profiles.put(data[0] as UserProfile);
        return data[0] as UserProfile;
      }
    } catch (err) {
      console.warn('Pencarian profil di cloud gagal, memakai data lokal:', err);
    }
  }
  return (await db.user_profiles.where('email').equalsIgnoreCase(email).first()) || null;
}

export type LinkChildResult = {
  profile: UserProfile;
  status: 'LINKED' | 'CREATED' | 'ALREADY';
};

/** Dipakai ORANG TUA: hubungkan anak berdasarkan email anak. */
export async function linkChildByEmail(
  parent: UserProfile,
  input: {
    email: string;
    fullName?: string;
    gender?: UserGender;
    grade?: number;
    schoolName?: string;
  }
): Promise<LinkChildResult> {
  const email = normalizeEmail(input.email);
  if (!EMAIL_RE.test(email)) throw new LinkError('Format email anak tidak valid.');
  if (parent.email && normalizeEmail(parent.email) === email) {
    throw new LinkError('Email anak tidak boleh sama dengan email akun orang tua.');
  }

  const existing = await findProfileByEmail(email);

  if (existing) {
    if (existing.role === 'PARENT') {
      throw new LinkError('Email ini terdaftar sebagai akun Orang Tua, bukan akun anak.');
    }
    if (existing.parent_id === parent.id) {
      return { profile: existing, status: 'ALREADY' };
    }
    if (existing.parent_id) {
      const other = await db.user_profiles.get(existing.parent_id);
      throw new LinkError(
        `Akun anak ini sudah terhubung ke orang tua lain${other?.email ? ` (${other.email})` : ''}.`
      );
    }
    const linked: UserProfile = { ...existing, parent_id: parent.id };
    await db.user_profiles.put(linked);
    await ensureStarterChecklists(linked.id, linked.current_grade || 1);
    return { profile: linked, status: 'LINKED' };
  }

  // Anak belum pernah login: buat profil cadangan berdasarkan email-nya.
  // Saat anak nanti login dengan email yang sama, profil ini otomatis dipakai.
  const created = await addChildProfile(parent.id, {
    fullName: input.fullName?.trim() || email.split('@')[0],
    email,
    gender: input.gender || 'PUTRA',
    grade: input.grade || 1,
    schoolName: input.schoolName?.trim() || ''
  });
  await ensureStarterChecklists(created.id, created.current_grade || 1);
  return { profile: created, status: 'CREATED' };
}

/** Dipakai ANAK: hubungkan ke orang tua berdasarkan email orang tua. */
export async function linkParentByEmail(student: UserProfile, parentEmail: string): Promise<UserProfile> {
  const email = normalizeEmail(parentEmail);
  if (!EMAIL_RE.test(email)) throw new LinkError('Format email orang tua tidak valid.');
  if (student.email && normalizeEmail(student.email) === email) {
    throw new LinkError('Email orang tua tidak boleh sama dengan email akunmu.');
  }

  const parent = await findProfileByEmail(email);
  if (!parent) {
    throw new LinkError(
      'Email orang tua belum terdaftar. Minta orang tua masuk ke MutabaahKu dan memilih peran "Orang Tua" lebih dulu — atau minta orang tua yang memasukkan emailmu.'
    );
  }
  if (parent.role !== 'PARENT') {
    throw new LinkError('Email ini bukan akun Orang Tua.');
  }

  await db.user_profiles.update(student.id, { parent_id: parent.id });
  return parent;
}

/** Putuskan tautan anak dari orang tuanya (data setoran anak tidak dihapus). */
export async function unlinkChild(childId: string): Promise<void> {
  // null (bukan undefined) agar kolom parent_id di cloud ikut dikosongkan
  await db.user_profiles.update(childId, { parent_id: null as any });
}
