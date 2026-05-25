-- Run this in the Supabase SQL editor to set up the schema

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  date date unique not null,
  prompt_text text not null,
  created_at timestamp with time zone default now()
);

create table if not exists doodles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  image_url text not null,
  prompt_id uuid references prompts(id) on delete cascade,
  nickname text check (char_length(nickname) <= 20),
  user_id text
);

create index if not exists doodles_user_id_idx on doodles (user_id);

-- If the table already exists, run this instead:
-- alter table doodles add column if not exists user_id text;
-- create index if not exists doodles_user_id_idx on doodles (user_id);

-- Row-level security
alter table prompts enable row level security;
alter table doodles enable row level security;

create policy "Prompts are publicly readable"
  on prompts for select using (true);

create policy "Doodles are publicly readable"
  on doodles for select using (true);

create policy "Anyone can submit a doodle"
  on doodles for insert with check (true);

-- Storage: create a bucket named "doodles" in the Supabase dashboard (Storage tab),
-- set it to Public, then run these policies:

create policy "Anyone can upload doodles"
  on storage.objects for insert
  with check (bucket_id = 'doodles');

create policy "Doodles are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'doodles');
