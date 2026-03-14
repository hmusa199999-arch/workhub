-- ═══════════════════════════════════════════════════════════════
--  work1m: جدول المستخدمين الجديد (بدون تعارض مع Supabase Auth)
--  انسخ هذا الكود والصقه في Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

create table if not exists app_users (
  id          text primary key,
  username    text not null,
  role        text not null default 'seeker',
  status      text not null default 'active',
  created_at  timestamptz default now(),
  data        jsonb not null default '{}'
);

-- منع تكرار أسماء المستخدمين (Ahmed = ahmed = AHMED)
create unique index if not exists app_users_username_lower_unique on app_users (lower(username));

-- تفعيل Real-time
alter table app_users replica identity full;
alter publication supabase_realtime add table app_users;

-- السماح بالقراءة والكتابة
alter table app_users disable row level security;
