-- Supabase schema example for production

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table attendees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  event_id uuid references events(id),
  token text not null,
  used boolean default false,
  created_at timestamptz default now(),
  used_at timestamptz
);

create index on attendees (email);
