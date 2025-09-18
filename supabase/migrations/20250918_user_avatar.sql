-- Avatar support
-- 1) Add avatar_url column to user_profile
alter table public.user_profile
  add column if not exists avatar_url text;

comment on column public.user_profile.avatar_url is 'Public URL of the user avatar stored in the avatars storage bucket.';

-- 2) Create storage bucket for avatars (if not exists)
-- Note: The SQL below requires storage extension; on hosted Supabase, create bucket via API/Studio if needed.
-- For portability, use DO $$ blocks to ignore if exists
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'avatars'
  ) then
    insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
  end if;
end $$;

-- 3) Storage policies: allow public read; only owner can upload/update/delete their own folder
-- Folder convention: avatars/{user_id}/*
drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

drop policy if exists "Users can manage own avatars" on storage.objects;
create policy "Users can manage own avatars"
on storage.objects for all
to authenticated
using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);


