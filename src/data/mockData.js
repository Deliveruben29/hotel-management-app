export const MOCK_RESERVATIONS = [
    {
        id: 'RES-8392',
        guestName: 'Sarah Connor',
        status: 'checked_in',
        arrival: '2025-12-20',
        departure: '2025-12-24',
        room: '301',
        type: 'Standard King',
        rate: 145,
        pax: 2,
        source: 'Booking.com',
    },
    {
        id: 'RES-9921',
        guestName: 'Frank Castle',
        status: 'confirmed',
        arrival: '2025-12-21',
        departure: '2025-12-23',
        room: '201',
        type: 'Suite',
        rate: 280,
        pax: 1,
        source: 'Direct',
    },
    {
        id: 'RES-7732',
        guestName: 'Diana Prince',
        status: 'checked_out',
        arrival: '2025-12-15',
        departure: '2025-12-20',
        room: '401',
        type: 'Deluxe Ocean',
        rate: 320,
        pax: 2,
        source: 'Expedia',
    },
    {
        id: 'RES-1029',
        guestName: 'Bruce Wayne',
        status: 'confirmed',
        arrival: '2025-12-22',
        departure: '2025-12-28',
        room: '202',
        type: 'Penthouse',
        rate: 1200,
        pax: 1,
        source: 'Direct',
    },
    {
        id: 'RES-5543',
        guestName: 'Peter Parker',
        status: 'cancelled',
        arrival: '2025-12-21',
        departure: '2025-12-22',
        room: '-',
        type: 'Standard Twin',
        rate: 110,
        pax: 2,
        source: 'Website',
    },
    {
        id: 'RES-3321',
        guestName: 'Natasha Romanoff',
        status: 'checked_in',
        arrival: '2025-12-19',
        departure: '2025-12-26',
        room: '302',
        type: 'Standard King',
        rate: 145,
        pax: 1,
        source: 'Corporate',
    }
];

export const STATUS_COLORS = {
    checked_in: { bg: 'hsl(150, 60%, 90%)', text: 'hsl(150, 60%, 30%)', label: 'In House' },
    confirmed: { bg: 'hsl(210, 80%, 90%)', text: 'hsl(210, 80%, 35%)', label: 'Confirmed' },
    checked_out: { bg: 'hsl(220, 10%, 90%)', text: 'hsl(220, 10%, 40%)', label: 'Checked Out' },
    cancelled: { bg: 'hsl(0, 70%, 95%)', text: 'hsl(0, 70%, 40%)', label: 'Cancelled' },
};

export const UNIT_GROUPS = [
    { id: 'UG-001', code: 'EZB', name: 'Business Single Room', color: '#4fd1c5', occupancy: 1, count: 10, rank: 1 },
    { id: 'UG-002', code: 'EZS', name: 'Single Room Superior', color: '#9f7aea', occupancy: 1, count: 10, rank: 2 },
    { id: 'UG-003', code: 'DBB', name: 'Business Double Room', color: '#68d391', occupancy: 2, count: 10, rank: 3 },
    { id: 'UG-004', code: 'DTB', name: 'Double Twin Business', color: '#f687b3', occupancy: 2, count: 10, rank: 4 },
    { id: 'UG-005', code: 'FAM', name: 'Family Room Standard', color: '#63b3ed', occupancy: 4, count: 6, rank: 7 },
    { id: 'UG-006', code: 'SUI', name: 'Suite Executive', color: '#f6ad55', occupancy: 2, count: 4, rank: 8 },
];

export const UNIT_ATTRIBUTES = [
    { id: 'UA-001', name: 'Bath', description: 'Room has a bathtub' },
    { id: 'UA-002', name: 'Balcony', description: 'Private balcony with view' },
    { id: 'UA-003', name: 'Sea View', description: 'Direct view of the ocean' },
    { id: 'UA-004', name: 'King Bed', description: 'King size bed (180x200)' },
    { id: 'UA-005', name: 'Corner', description: 'Corner room with extra windows' },
    { id: 'UA-006', name: 'Accessible', description: 'Wheelchair accessible' },
];

export const UNITS = [
    { id: '101', name: '101', groupId: 'UG-001', occupancy: 1, attributes: ['Bath'], condition: 'Clean' },
    { id: '102', name: '102', groupId: 'UG-001', occupancy: 1, attributes: ['Bath'], condition: 'Dirty' },
    { id: '103', name: '103', groupId: 'UG-001', occupancy: 1, attributes: [], condition: 'Inspect' },
    { id: '201', name: '201', groupId: 'UG-002', occupancy: 1, attributes: ['Balcony', 'Sea View'], condition: 'Clean' },
    { id: '202', name: '202', groupId: 'UG-002', occupancy: 1, attributes: ['Sea View'], condition: 'Dirty' },
    { id: '301', name: '301', groupId: 'UG-003', occupancy: 2, attributes: ['King Bed'], condition: 'Clean' },
    { id: '302', name: '302', groupId: 'UG-003', occupancy: 2, attributes: ['King Bed', 'Corner'], condition: 'Clean' },
    { id: '401', name: '401', groupId: 'UG-006', occupancy: 2, attributes: ['Bath', 'Balcony', 'Sea View', 'King Bed'], condition: 'Dirty' },
];

export const HOUSEKEEPING_CONDITIONS = {
    Clean: { color: 'var(--color-success)', bg: '#C6F6D5' },
    Dirty: { color: 'var(--color-warning)', bg: '#FEEBC8' },
    Inspect: { color: 'var(--color-primary)', bg: '#B2F5EA' },
};
