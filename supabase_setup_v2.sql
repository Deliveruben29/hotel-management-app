-- Create Services Table (Updated to match Mock Data)
-- Drop table if exists to ensure clean state (Optional, user might need to drop manually if cascade)
-- drop table if exists public.services;
create table if not exists public.services (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    code text,
    -- Added code column
    description text,
    price numeric not null default 0,
    currency text default 'CHF',
    type text default 'Other',
    -- 'Food & Beverages', 'Other'
    vat_rate text default '8.1% - Normal',
    -- Storing as text to match UI or numeric? UI uses text '8.1% - Normal'
    delivered_to text default 'Unit',
    -- 'Each Adult', 'Each guest', 'Unit'
    channels text [] -- Array of strings
);
-- Enable RLS
alter table public.services enable row level security;
-- Policy
create policy "Allow all operations" on public.services for all using (true) with check (true);
-- Seed Data (Matching MOCK_SERVICES)
insert into public.services (
        name,
        code,
        type,
        price,
        currency,
        delivered_to,
        vat_rate,
        channels
    )
values (
        'Breakfast Standard',
        'BRE22_NRF',
        'Food & Beverages',
        22.00,
        'CHF',
        'Each Adult',
        '8.1% - Normal',
        ARRAY ['Direct']
    ),
    (
        'Kidbreakfast',
        'BRF_KIDS',
        'Food & Beverages',
        12.00,
        'CHF',
        'Each guest',
        '8.1% - Normal',
        ARRAY ['Direct']
    ),
    (
        'Breakfast Non Refundable',
        'BRF_NRF',
        'Food & Beverages',
        20.00,
        'CHF',
        'Each Adult',
        '8.1% - Normal',
        ARRAY ['AltoVita', 'Booking.com', 'CM']
    ),
    (
        'Parking Hotel Guests',
        'PKG',
        'Other',
        30.00,
        'CHF',
        'Unit',
        '8.1% - Normal',
        ARRAY ['Direct']
    ),
    (
        'Service Fee',
        'SERFEE',
        'Other',
        3.50,
        'CHF',
        'Each guest',
        '8.1% - Normal',
        ARRAY ['Direct']
    );