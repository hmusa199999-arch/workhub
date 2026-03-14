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
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) callback(data.map(fromRow));
  };

  fetch();

  const channel = supabase
    .channel('users-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetch)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Save new user ──────────────────────────────────────────────────────────
export async function saveUserToDB(user: CloudUser): Promise<void> {
  const { id, username, role, status, createdAt, created_at, ...rest } = user as CloudUser & { created_at?: string };
  await supabase.from('users').insert({
    id,
    username,
    role: role || 'seeker',
    status: status || 'active',
    created_at: createdAt || created_at || new Date().toISOString(),
    data: { id, username, role, status, createdAt: createdAt || new Date().toISOString(), ...rest },
  });
}

// ── Update user ────────────────────────────────────────────────────────────
export async function updateUserInDB(id: string, updates: Partial<CloudUser>): Promise<void> {
  // Update indexed columns + merge into data
  const { data: existing } = await supabase.from('users').select('data').eq('id', id).single();
  const merged = { ...(existing?.data || {}), ...updates };
  await supabase.from('users').update({
    role: updates.role || merged.role,
    status: updates.status || merged.status,
    data: merged,
  }).eq('id', id);
}

// ── Delete user ────────────────────────────────────────────────────────────
export async function deleteUserFromDB(id: string): Promise<void> {
  await supabase.from('users').delete().eq('id', id);
}

// ── Check username exists ──────────────────────────────────────────────────
export async function checkUsernameExists(username: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  return !!data;
}

// ── Get user by username ───────────────────────────────────────────────────
export async function getUserByUsername(username: string): Promise<CloudUser | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();
  return data ? fromRow(data) : null;
}
