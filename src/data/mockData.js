export const MOCK_RESERVATIONS = [
    {
        id: 'RES-1001',
        guestName: 'Ana Smith',
        status: 'confirmed',
        arrival: '2025-12-25',
        departure: '2025-12-30',
        room: '201',
        type: 'Single Room Superior',
        rate: 155,
        pax: 1,
        source: 'Direct',
        email: 'ana.smith@example.com',
        phone: '+41 79 123 45 67',
        street: 'Bahnhofstrasse 10',
        postalCode: '8001',
        city: 'Zurich',
        country: 'Switzerland',
        billingDetails: null,
        extraCharges: []
    },
    {
        id: 'RES-1002',
        guestName: 'Marco Polo',
        status: 'confirmed',
        arrival: '2025-12-24',
        departure: '2025-12-28',
        room: '305',
        type: 'Business Double Room',
        rate: 220,
        pax: 2,
        source: 'Booking.com',
        email: 'marco@explorer.com',
        street: 'Via Roma 1',
        postalCode: '00100',
        city: 'Rome',
        country: 'Italy',
        billingDetails: null,
        extraCharges: []
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

export const RATE_PLANS = [
    { id: 'RP-001', name: 'Best Available Rate', code: 'BAR', currency: 'USD', cancellationPolicy: 'Flexible', basePrice: null, description: 'Standard flexible rate' },
    { id: 'RP-002', name: 'Non-Refundable', code: 'NONREF', currency: 'USD', cancellationPolicy: 'Non-Refundable', basePrice: -10, description: '10% discount, no refund' },
    { id: 'RP-003', name: 'Breakfast Included', code: 'BB', currency: 'USD', cancellationPolicy: 'Flexible', basePrice: 25, description: 'Standard rate + breakfast' },
    { id: 'RP-004', name: 'Corporate Special', code: 'CORP', currency: 'USD', cancellationPolicy: '24h Notice', basePrice: -15, description: 'Discount for corporate partners' },
];

export const MOCK_SERVICES = [
    { id: 'S-001', name: 'Breakfast Standard', code: 'BRE22_NRF', type: 'Food & Beverages', price: 22.00, currency: 'CHF', deliveredTo: 'Each Adult', vat: '8.1% - Normal', channels: ['Direct'] },
    { id: 'S-002', name: 'Kidbreakfast', code: 'BRF_KIDS', type: 'Food & Beverages', price: 12.00, currency: 'CHF', deliveredTo: 'Each guest', vat: '8.1% - Normal', channels: ['Direct'] },
    { id: 'S-003', name: 'Breakfast Non Refundable', code: 'BRF_NRF', type: 'Food & Beverages', price: 20.00, currency: 'CHF', deliveredTo: 'Each Adult', vat: '8.1% - Normal', channels: ['AltoVita', 'Booking.com', 'CM', '+4'] },
    { id: 'S-004', name: 'Parking Hotel Guests', code: 'PKG', type: 'Other', price: 30.00, currency: 'CHF', deliveredTo: 'Unit', vat: '8.1% - Normal', channels: ['Direct'] },
    { id: 'S-005', name: 'Service Fee', code: 'SERFEE', type: 'Other', price: 3.50, currency: 'CHF', deliveredTo: 'Each guest', vat: '8.1% - Normal', channels: ['Direct'] },
];

export const MOCK_COMPANIES = [
    { id: 'C-001', name: 'Fittipaldi Gmbh', code: 'BUS000001', address: 'adf, 0246 Langwiesen, Switzerland', ratePlans: [], arInvoice: true },
    { id: 'C-002', name: 'TechSolutions Inc', code: 'BUS000002', address: '123 Innovation Dr, Zurich, Switzerland', ratePlans: ['Corp Special'], arInvoice: true },
    { id: 'C-003', name: 'Global Travel', code: 'BUS000003', address: '456 Wanderlust Ave, Geneva, Switzerland', ratePlans: [], arInvoice: false },
];

export const COUNTRIES = [
    { code: 'CH', name: 'Switzerland' },
    { code: 'DE', name: 'Germany' },
    { code: 'AT', name: 'Austria' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'US', name: 'United States' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'PT', name: 'Portugal' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'GR', name: 'Greece' },
    { code: 'TR', name: 'Turkey' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'AU', name: 'Australia' },
];
