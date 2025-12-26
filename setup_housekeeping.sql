-- Unit Groups Table
create table if not exists public.unit_groups (
    id text primary key,
    code text,
    name text,
    color text,
    occupancy int,
    rank int
);
alter table public.unit_groups enable row level security;
-- Allow all for development
create policy "Allow all operations" on public.unit_groups for all using (true) with check (true);
insert into public.unit_groups (id, code, name, color, occupancy, rank)
values (
        'UG-001',
        'EZB',
        'Business Single Room',
        '#4fd1c5',
        1,
        1
    ),
    (
        'UG-002',
        'EZS',
        'Single Room Superior',
        '#9f7aea',
        1,
        2
    ),
    (
        'UG-003',
        'DBB',
        'Business Double Room',
        '#68d391',
        2,
        3
    ),
    (
        'UG-004',
        'DTB',
        'Double Twin Business',
        '#f687b3',
        2,
        4
    ),
    (
        'UG-005',
        'FAM',
        'Family Room Standard',
        '#63b3ed',
        4,
        7
    ),
    (
        'UG-006',
        'SUI',
        'Suite Executive',
        '#f6ad55',
        2,
        8
    ) on conflict (id) do nothing;
-- Units Table
create table if not exists public.units (
    id text primary key,
    -- Room Number as ID
    name text,
    group_id text references public.unit_groups(id),
    condition text default 'Clean',
    attributes text [],
    -- Array of strings
    status text default 'Live' -- Live, OOO, OOS
);
alter table public.units enable row level security;
-- Allow all for development
create policy "Allow all operations" on public.units for all using (true) with check (true);
insert into public.units (id, name, group_id, condition, attributes)
values ('101', '101', 'UG-001', 'Clean', ARRAY ['Bath']),
    ('102', '102', 'UG-001', 'Dirty', ARRAY ['Bath']),
    (
        '103',
        '103',
        'UG-001',
        'Inspect',
        ARRAY []::text []
    ),
    (
        '201',
        '201',
        'UG-002',
        'Clean',
        ARRAY ['Balcony', 'Sea View']
    ),
    (
        '202',
        '202',
        'UG-002',
        'Dirty',
        ARRAY ['Sea View']
    ),
    (
        '301',
        '301',
        'UG-003',
        'Clean',
        ARRAY ['King Bed']
    ),
    (
        '302',
        '302',
        'UG-003',
        'Clean',
        ARRAY ['King Bed', 'Corner']
    ),
    (
        '401',
        '401',
        'UG-006',
        'Dirty',
        ARRAY ['Bath', 'Balcony', 'Sea View', 'King Bed']
    ) on conflict (id) do nothing;