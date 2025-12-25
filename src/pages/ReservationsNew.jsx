import React, { useState } from 'react';
import { STATUS_COLORS, UNIT_GROUPS, RATE_PLANS, MOCK_COMPANIES, COUNTRIES } from '../data/mockData';
import { useReservations } from '../context/ReservationContext';
import { ReservationSummary as ExternalReservationSummary } from './ReservationSummary';

export default function Reservations() {
    const { reservations, addReservation, updateReservationStatus, updateReservation } = useReservations(); // Use Global State
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [filter, setFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Create Booking State
    const [showOffers, setShowOffers] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [activeReservation, setActiveReservation] = useState(null); // Renamed from createdReservation
    // Lifted Date State for creating bookings
    const [dateRange, setDateRange] = useState({ start: '2025-12-25', end: '2025-12-27' });

    // Filter Logic
    const filteredReservations = (reservations || []).filter(res => {
        const matchesStatus = filter === 'all' ||
            (res.status === 'confirmed' && filter === 'confirmed') ||
            (res.status === 'IN_HOUSE' && filter === 'checked_in') || // Map old filter value to new
            (res.status === 'in_house' && filter === 'checked_in') ||
            (res.status === 'Checked Out' && filter === 'checked_out') ||
            res.status === filter; // Fallback

        const matchesSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.room.includes(searchTerm);

        let matchesDate = true;
        if (dateFilter) {
            const targetDate = new Date(dateFilter);
            targetDate.setHours(0, 0, 0, 0);

            const arrival = new Date(res.arrival); initialSet(arrival);
            const departure = new Date(res.departure); initialSet(departure);

            // Helper to ignore time
            function initialSet(d) { d.setHours(0, 0, 0, 0); }

            // Match if date falls within [Arrival, Departure] inclusive
            matchesDate = targetDate >= arrival && targetDate <= departure;
        }

        return matchesStatus && matchesSearch && matchesDate;
    });

    // --- Sub-Components ---

    // 2. Guest Details Form
    const GuestDetailsForm = () => {
        const [formData, setFormData] = useState({
            firstName: '',
            lastName: '',
            email: ''
        });

        const handleConfirm = () => {
            if (!formData.lastName) {
                alert('Please enter at least a Last Name');
                return;
            }

            const newRes = {
                id: 'RES-' + Math.floor(Math.random() * 10000), // Random ID
                guestName: `${formData.firstName} ${formData.lastName}`.trim(),
                status: 'confirmed',
                arrival: dateRange.start,
                departure: dateRange.end,
                room: 'Unassigned',
                type: selectedOffer?.groupName || 'Standard',
                rate: selectedOffer?.price || 150,
                pax: 2,
                source: 'Direct',
                email: formData.email
            };

            addReservation(newRes);
            setActiveReservation(newRes);
            setView('summary');
        };

        return (
            <div className="fade-in">
                <header className="view-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => setView('create')}>Create new booking</span>
                            <span style={{ margin: '0 0.5rem' }}>/</span>
                            Guest Details
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>Guest Details</h1>
                    </div>
                </header>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={labelStyle}>First Name</label>
                            <input
                                type="text"
                                style={inputStyle}
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="e.g. John"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Last Name*</label>
                            <input
                                type="text"
                                style={inputStyle}
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="e.g. Doe"
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                style={inputStyle}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john.doe@example.com"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #edf2f7', paddingTop: '1.5rem' }}>
                        <button className="btn" onClick={() => setView('create')} style={{ background: 'white', border: '1px solid #cbd5e1' }}>Back</button>
                        <button
                            className="btn"
                            onClick={handleConfirm}
                            style={{ background: '#DD6B20', color: 'white', border: 'none', fontWeight: 600 }}
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 3. Detailed Reservation View (Summary/Edit context)
    // 3. Detailed Reservation View moved to external component (cleaned up)


    // 1. Create Booking View (Modified)
    const CreateBookingView = () => (
        <div className="dashboard-view fade-in">
            <header className="view-header" style={{ marginBottom: '2rem' }}>
                <div>
                    {/* Breadcrumbs */}
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>Reservations</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Create new booking
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>Create new booking</h1>
                </div>
            </header>

            <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d3748', marginBottom: '1.5rem' }}>Property and travel dates</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

                    {/* Date Range */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Arrival date - Departure date*</label>
                        <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => {
                                    const newDate = e.target.value;
                                    if (newDate < '2025-12-25') {
                                        alert('Cannot book dates in the past (before 2025-12-25)');
                                        return;
                                    }
                                    setDateRange({ ...dateRange, start: newDate });
                                }}
                                style={{ ...inputStyle, border: 'none', width: '50%' }}
                            />
                            <span style={{ padding: '0.5rem', background: '#f7fafc', color: '#718096' }}>-</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                style={{ ...inputStyle, border: 'none', width: '50%' }}
                            />
                        </div>
                    </div>

                    {/* Adults */}
                    <div>
                        <label style={labelStyle}>Adults*</label>
                        <div style={{ position: 'relative' }}>
                            <input type="number" defaultValue="1" style={inputStyle} />
                            <span style={suffixStyle}>per unit</span>
                        </div>
                    </div>

                    {/* Children */}
                    <div>
                        <label style={labelStyle}>Children ages</label>
                        <div style={{ position: 'relative' }}>
                            <input type="text" placeholder="e.g. 4, 7" style={inputStyle} />
                            <span style={suffixStyle}>per unit</span>
                        </div>
                    </div>

                    {/* Codes */}
                    <div>
                        <label style={labelStyle}>Corporate code</label>
                        <input type="text" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Promo code</label>
                        <input type="text" defaultValue="ROTG" style={inputStyle} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#e2e8f0', borderRadius: '4px', padding: '0.5rem 1rem', fontSize: '0.9rem', color: '#4a5568', fontWeight: 500 }}>
                        Direct ▼
                    </div>
                    <button
                        onClick={() => setShowOffers(true)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ED8936'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F6AD55'}
                        style={{
                            background: '#F6AD55',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem 1.5rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            transition: 'background 0.2s'
                        }}>
                        Search offers
                    </button>
                    <button style={{ background: 'none', border: 'none', color: '#F6AD55', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📅 Show availability
                    </button>
                </div>
            </div>

            {/* Offers Section */}
            {showOffers && (
                <div style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease-in' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d3748' }}>Offers</h2>
                        <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                            📅 {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr 1fr 1fr', padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>
                        <div>Unit group / Rate plan</div>
                        <div>Minimum guarantee</div>
                        <div>Cancellation policy</div>
                        <div>Price</div>
                        <div>Units to book</div>
                    </div>

                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                        {UNIT_GROUPS.map((group) => (
                            <React.Fragment key={group.id}>
                                {/* Group Header */}
                                <div
                                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid #edf2f7',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: expandedGroup === group.id ? '#f7fafc' : 'white'
                                    }}
                                >
                                    <span style={{ marginRight: '1rem', color: '#cbd5e1', fontSize: '1.2rem' }}>{expandedGroup === group.id ? '▼' : '›'}</span>
                                    <div style={{ width: '10px', height: '10px', background: group.color, marginRight: '0.75rem', borderRadius: '2px' }}></div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#2d3748' }}>{group.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>max. {2} 👤 / {10} Units / starting at <span style={{ color: '#C53030' }}>100.00 CHF</span></div>
                                    </div>
                                </div>

                                {/* Rate Plans (Expanded) */}
                                {expandedGroup === group.id && (
                                    <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        {RATE_PLANS.slice(0, 3).map(plan => (
                                            <div key={plan.id} style={{
                                                display: 'grid',
                                                gridTemplateColumns: '4fr 1fr 1fr 1fr 1fr',
                                                padding: '1rem',
                                                borderTop: '1px solid #edf2f7',
                                                alignItems: 'center',
                                                fontSize: '0.9rem'
                                            }}>
                                                <div style={{ paddingLeft: '2.5rem' }}>
                                                    <div style={{ fontWeight: 500, color: '#2d3748' }}>{plan.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{plan.description}</div>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>6 pm hold</div>
                                                <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>{plan.cancellationPolicy}</div>
                                                <div style={{ fontWeight: 600, color: '#2d3748' }}>
                                                    {100 + (plan.basePrice || 0)}.00 CHF
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <select style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                                        <option>1</option>
                                                        <option>2</option>
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOffer({
                                                                groupName: group.name,
                                                                price: 100 + (plan.basePrice || 0)
                                                            });
                                                            setView('guest-details');
                                                        }}
                                                        style={{ fontSize: '0.8rem', color: '#D69E2E', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        Select offer ›
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // --- Main Render ---

    if (view === 'create') return <CreateBookingView />;
    if (view === 'guest-details') return <GuestDetailsForm />;
    if (view === 'summary' && activeReservation) {
        return (
            <ExternalReservationSummary
                activeReservation={activeReservation}
                updateReservation={updateReservation}
                setActiveReservation={setActiveReservation}
                onBack={() => setView('list')}
            />
        );
    }

    // Default List View
    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    {/* Breadcrumbs simulation */}
                    <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span> <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px' }}>Test</span>
                    </div>
                    <h1>Reservations</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }}>Export</button>
                    <button className="btn btn-apaleo-primary" onClick={() => setView('create')}>
                        <span>+ New Booking</span>
                    </button>
                </div>
            </header>

            {/* Filters & Toolbar (Apaleo Style) */}
            {/* Filters & Toolbar (Apaleo Style) */}
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Jump to reservation (by ID)*"
                        style={{ ...inputStyle, paddingRight: '2rem' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>→</span>
                </div>
                <div style={{ flex: 2, position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search guest, ID or room..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>🔍</span>
                </div>

                {/* Date Filter */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{
                            padding: '0.55rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer',
                            color: '#2d3748',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Real Filter Buttons */}
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                >
                    <option value="all">Show All Statuses</option>
                    <option value="checked_in">In House</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                {filter !== 'all' && (
                    <span style={{
                        background: '#e2e8f0',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        color: '#4a5568',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        Status: {STATUS_COLORS[filter]?.label || filter}
                        <span style={{ cursor: 'pointer' }} onClick={() => setFilter('all')}>✖</span>
                    </span>
                )}
                {dateFilter && (
                    <span style={{
                        background: '#bee3f8',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        color: '#2c5282',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        Date: {new Date(dateFilter).toLocaleDateString()}
                        <span style={{ cursor: 'pointer' }} onClick={() => setDateFilter('')}>✖</span>
                    </span>
                )}
            </div>

            {/* Data Grid */}
            <div style={{
                background: 'white',
                borderTop: '1px solid #e2e8f0'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <th style={headerStyle}>Status</th>
                            <th style={headerStyle}>Reservation #</th>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Arrival</th>
                            <th style={headerStyle}>Departure</th>
                            <th style={headerStyle}>Channel</th>
                            <th style={headerStyle}>Unit</th>
                            <th style={headerStyle}>Rate Plan</th>
                            <th style={headerStyle}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map((res) => {
                            const statusStyle = STATUS_COLORS[res.status] || { bg: '#eee', text: '#555', label: res.status };

                            // Calculate Live Balance
                            const arrival = new Date(res.arrival);
                            const departure = new Date(res.departure);
                            const nights = Math.max(1, Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24)));
                            const roomTotal = nights * (res.rate || 0);

                            const extras = res.extraCharges || [];
                            const extraTotal = extras.filter(c => c.type === 'charge').reduce((s, c) => s + c.amount, 0);
                            const paymentTotal = extras.filter(c => c.type === 'payment').reduce((s, c) => s + c.amount, 0);

                            const liveBalance = (roomTotal + extraTotal - paymentTotal).toFixed(2);

                            return (
                                <tr
                                    key={res.id}
                                    style={{ borderBottom: '1px solid #edf2f7', cursor: 'pointer' }}
                                    className="table-row-hover"
                                    onDoubleClick={() => {
                                        setActiveReservation(res);
                                        setView('summary');
                                    }}
                                >
                                    <td style={cellStyle}>
                                        <span style={{
                                            backgroundColor: statusStyle.bg,
                                            color: statusStyle.text,
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase'
                                        }}>
                                            {statusStyle.label}
                                        </span>
                                    </td>
                                    <td style={{ ...cellStyle, fontFamily: 'monospace' }}>{res.id}</td>
                                    <td style={{ ...cellStyle, fontWeight: 600, color: '#2d3748' }}>{res.guestName}</td>
                                    <td style={cellStyle}>{arrival.toLocaleDateString()}</td>
                                    <td style={cellStyle}>{departure.toLocaleDateString()}</td>
                                    <td style={cellStyle}>{res.source}</td>
                                    <td style={cellStyle}>{res.room}</td>
                                    <td style={cellStyle}>{res.type}</td>
                                    <td style={{ ...cellStyle, fontFamily: 'monospace', color: Number(liveBalance) > 0.05 ? '#C53030' : '#2F855A', fontWeight: 600 }}>
                                        {liveBalance} CHF
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredReservations.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#718096' }}>
                        <p>We could not find any reservations based on the selected filters.</p>
                        <button style={{ background: 'none', border: 'none', color: '#4a5568', marginTop: '1rem', cursor: 'pointer' }}>✖ Remove all filters</button>
                    </div>
                )}
            </div>
            <style>{`
                .btn-apaleo-primary {
                    background-color: #F6AD55; 
                    color: white; 
                    border: none;
                }
                .btn-apaleo-primary:hover {
                    background-color: #ED8936;
                }
                 .table-row-hover:hover {
                    background-color: #f7fafc;
                }
            `}</style>
        </main>
    );
}

// STYLES
const labelStyle = {
    fontSize: '0.75rem',
    color: '#718096',
    display: 'block',
    marginBottom: '4px'
};

const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.95rem',
    color: '#2d3748',
    outline: 'none'
};

const suffixStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0aec0',
    fontSize: '0.85rem',
    pointerEvents: 'none'
};

const headerStyle = {
    textAlign: 'left',
    padding: '1rem 0.5rem',
    fontSize: '0.75rem',
    color: '#718096',
    fontWeight: 400,
    borderBottom: '1px solid #e2e8f0'
};

const cellStyle = {
    padding: '1rem 0.5rem',
    color: '#2d3748'
};
