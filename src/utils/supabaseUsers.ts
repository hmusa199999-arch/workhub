import { supabase } from './supabase';

export interface CloudUser {
  id: string;
  username: string;
  name: string;
  phone: string;
  email?: string;
  role: 'seeker' | 'company' | 'admin';
  status?: 'active' | 'banned';
  passwordHash?: string;
  gender?: 'male' | 'female';
  targetCountry?: string;
  targetCity?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): CloudUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    status: row.status,
    ...row.data,
  } as CloudUser;
}

// ── Real-time all users (admin) ────────────────────────────────────────────
export function subscribeToUsers(callback: (users: CloudUser[]) => void): () => void {
  const fetch = async () => {
    const { data } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) callback(data.map(fromRow));
  };

  fetch();

  const channel = supabase
    .channel('users-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, fetch)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Save new user ──────────────────────────────────────────────────────────
export async function saveUserToDB(user: CloudUser): Promise<void> {
  const { id, username, role, status, createdAt, created_at, ...rest } = user as CloudUser & { created_at?: string };
  const normalizedUsername = normalizeUsername(username);
  const payload = {
    id,
    username: normalizedUsername,
    role: role || 'seeker',
    status: status || 'active',
    created_at: createdAt || created_at || new Date().toISOString(),
    data: { id, username: normalizedUsername, role, status, email: user.email, gender: user.gender, createdAt: createdAt || new Date().toISOString(), ...rest },
  };
  const { error } = await supabase.from('app_users').insert(payload);
  if (error) {
    console.error('saveUserToDB error:', error);
    throw new Error(error.message);
  }
}

// ── Update user ────────────────────────────────────────────────────────────
export async function updateUserInDB(id: string, updates: Partial<CloudUser>): Promise<void> {
  // Update indexed columns + merge into data
  const { data: existing } = await supabase.from('app_users').select('data').eq('id', id).single();
  const merged = { ...(existing?.data || {}), ...updates };
  await supabase.from('app_users').update({
    role: updates.role || merged.role,
    status: updates.status || merged.status,
    data: merged,
  }).eq('id', id);
}

// ── Delete user ────────────────────────────────────────────────────────────
export async function deleteUserFromDB(id: string): Promise<void> {
  await supabase.from('app_users').delete().eq('id', id);
}

// Username is stored and checked in lowercase to prevent duplicates (e.g. Ahmed vs ahmed)
const normalizeUsername = (u: string) => u.trim().toLowerCase();

// ── Check username exists ──────────────────────────────────────────────────
export async function checkUsernameExists(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) return true; // empty = "taken" to block registration
  const { data } = await supabase
    .from('app_users')
    .select('id')
    .ilike('username', normalized)
    .maybeSingle();
  return !!data;
}

// ── Get user by username ───────────────────────────────────────────────────
export async function getUserByUsername(username: string): Promise<CloudUser | null> {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  const { data } = await supabase
    .from('app_users')
    .select('*')
    .ilike('username', normalized)
    .maybeSingle();
  return data ? fromRow(data) : null;
}

// ── Get user by username OR email (for login) ──────────────────────────────
export async function getUserByUsernameOrEmail(input: string): Promise<CloudUser | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // إذا كان المدخل يشبه البريد الإلكتروني، ابحث بالبريد
  if (trimmed.includes('@')) {
    const { data } = await supabase
      .from('app_users')
      .select('*')
      .contains('data', { email: trimmed.toLowerCase() })
      .maybeSingle();
    return data ? fromRow(data) : null;
  }
  // وإلا ابحث باسم المستخدم
  return getUserByUsername(trimmed);
}
