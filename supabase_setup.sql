-- Create Services Table
create table if not exists public.services (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    description text,
    price numeric not null default 0,
    type text default 'extra',
    -- 'food_beverage', 'misc', 'fee', 'transport'
    vat_rate numeric default 0.081
);
-- Enable RLS (Row Level Security)
alter table public.services enable row level security;
-- Policy (Allow full access for now)
create policy "Allow all operations" on public.services for all using (true) with check (true);
-- Seed Data (Initial Services)
insert into public.services (name, price, type, vat_rate)
values ('Breakfast', 25.00, 'food_beverage', 0.026),
    ('Parking', 15.00, 'misc', 0.081),
    ('Late Check-out', 50.00, 'fee', 0.081),
    ('Bottle of Wine', 45.00, 'food_beverage', 0.081),
    ('Airport Transfer', 80.00, 'transport', 0.081),
    ('Extra Bed', 40.00, 'extra', 0.038);