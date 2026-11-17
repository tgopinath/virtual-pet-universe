-- Virtual Pet Universe — Postgres / Supabase schema
-- The v0.1 client syncs a single JSON snapshot (game_progress). The normalized tables
-- below are the target model for server-side features (leaderboards, trading, analytics);
-- the client data in src/data/* maps 1:1 onto the catalog tables.

create extension if not exists "pgcrypto";

-- ───────── Players ─────────
create table if not exists player_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Pet Pal',
  avatar       text not null default '🧒',
  xp           integer not null default 0,
  coins        integer not null default 0 check (coins >= 0),
  gems         integer not null default 0 check (gems >= 0),
  current_world text not null default 'garden',
  playtime_sec integer not null default 0,
  daily_streak smallint not null default 0,
  last_daily_reward date,
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ───────── Catalog (static game content) ─────────
create table if not exists food_items   (id text primary key, name text, icon text, price_coins int, price_gems int, effect jsonb, special boolean default false);
create table if not exists toys         (id text primary key, name text, icon text, price_coins int, price_gems int, effect jsonb);
create table if not exists accessories  (id text primary key, name text, icon text, slot text, price_coins int, price_gems int, min_stage smallint default 0);
create table if not exists furniture    (id text primary key, name text, icon text, price_coins int, price_gems int, use_action text);
create table if not exists environments (id text primary key, name text, unlock_level int, unlock_coins int, unlock_achievement text);
create table if not exists mini_games   (id text primary key, name text, description text);
create table if not exists training_skills (id text primary key, name text, min_stage smallint, energy_cost smallint);
create table if not exists achievements (id text primary key, name text, description text, stat text, goal int, reward jsonb);
create table if not exists daily_missions (id text primary key, text text, event text, goal int, reward jsonb);

-- ───────── Pets ─────────
create table if not exists pets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  species    text not null,
  name       text not null,
  xp         integer not null default 0,
  stage      smallint not null default 0 check (stage between 0 and 4),
  color      smallint not null default 0,
  sleeping   boolean not null default false,
  is_active  boolean not null default false,
  adopted_at timestamptz not null default now()
);
create index if not exists pets_user_idx on pets(user_id);

create table if not exists pet_attributes (
  pet_id      uuid primary key references pets(id) on delete cascade,
  hunger      real not null default 70 check (hunger between 0 and 100),
  happiness   real not null default 70 check (happiness between 0 and 100),
  energy      real not null default 70 check (energy between 0 and 100),
  cleanliness real not null default 70 check (cleanliness between 0 and 100),
  health      real not null default 90 check (health between 0 and 100),
  friendship  real not null default 10 check (friendship between 0 and 100),
  updated_at  timestamptz not null default now()
);

create table if not exists pet_skills (
  pet_id   uuid references pets(id) on delete cascade,
  skill_id text references training_skills(id),
  level    smallint not null default 1 check (level between 1 and 3),
  primary key (pet_id, skill_id)
);

create table if not exists pet_equipment (
  pet_id uuid references pets(id) on delete cascade,
  slot   text not null,
  accessory_id text references accessories(id),
  primary key (pet_id, slot)
);

-- ───────── Inventory & home ─────────
create table if not exists pet_inventory (
  user_id  uuid references auth.users(id) on delete cascade,
  item_id  text not null,
  quantity integer not null default 0 check (quantity >= 0),
  primary key (user_id, item_id)
);

create table if not exists room_layouts (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references auth.users(id) on delete cascade,
  name     text not null default 'Current',
  theme    text not null default 'sunny',
  items    jsonb not null default '[]'::jsonb, -- [{id,x,y,flip,rot}]
  is_current boolean not null default true
);

-- ───────── Progress ─────────
create table if not exists player_rewards (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  source     text not null, -- mission | achievement | minigame | daily | care
  coins      int default 0,
  gems       int default 0,
  xp         int default 0,
  created_at timestamptz default now()
);

create table if not exists player_achievements (
  user_id uuid references auth.users(id) on delete cascade,
  achievement_id text references achievements(id),
  claimed_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

create table if not exists player_daily_missions (
  user_id    uuid references auth.users(id) on delete cascade,
  day        date not null,
  mission_id text references daily_missions(id),
  progress   int not null default 0,
  claimed    boolean not null default false,
  primary key (user_id, day, mission_id)
);

create table if not exists unlocked_environments (
  user_id uuid references auth.users(id) on delete cascade,
  environment_id text references environments(id),
  unlocked_at timestamptz default now(),
  primary key (user_id, environment_id)
);

-- Snapshot used by the v0.1 client sync (src/lib/cloud.ts)
create table if not exists game_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ───────── Row-level security: players only touch their own rows ─────────
do $$
declare t text;
begin
  foreach t in array array['player_profiles','pets','pet_inventory','room_layouts','player_rewards','player_achievements','player_daily_missions','unlocked_environments','game_progress']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists own_rows on %I', t);
    execute format('create policy own_rows on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

alter table pet_attributes enable row level security;
create policy own_pet_attrs on pet_attributes for all using (exists (select 1 from pets p where p.id = pet_id and p.user_id = auth.uid()));
alter table pet_skills enable row level security;
create policy own_pet_skills on pet_skills for all using (exists (select 1 from pets p where p.id = pet_id and p.user_id = auth.uid()));
alter table pet_equipment enable row level security;
create policy own_pet_equipment on pet_equipment for all using (exists (select 1 from pets p where p.id = pet_id and p.user_id = auth.uid()));
