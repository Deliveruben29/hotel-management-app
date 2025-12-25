import React, { useState } from 'react';
import { STATUS_COLORS, UNIT_GROUPS, RATE_PLANS } from '../data/mockData';
import { useReservations } from '../context/ReservationContext';

export default function Reservations() {
    const { reservations, addReservation, updateReservationStatus, updateReservation } = useReservations(); // Use Global State
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Create Booking State
    const [showOffers, setShowOffers] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [activeReservation, setActiveReservation] = useState(null); // Renamed from createdReservation
    // Lifted Date State for creating bookings
    const [dateRange, setDateRange] = useState({ start: '2025-12-25', end: '2025-12-27' });

    // Filter Logic
    const filteredReservations = reservations.filter(res => {
        const matchesStatus = filter === 'all' || res.status === filter;
        const matchesSearch = res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.room.includes(searchTerm);
        return matchesStatus && matchesSearch;
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
    const ReservationSummary = () => {
        if (!activeReservation) return null;

        const [activeTab, setActiveTab] = useState('details'); // 'details' or 'folio'
        const [extraCharges, setExtraCharges] = useState(activeReservation.extraCharges || []); // Local state for added charges

        const isCheckInAvailable = activeReservation.status === 'confirmed';
        const isCheckOutAvailable = activeReservation.status === 'checked_in';
        const isCancelAvailable = activeReservation.status === 'confirmed';

        // Helper to generate daily room charges
        const getDailyCharges = () => {
            const charges = [];
            const arrival = new Date(activeReservation.arrival);
            const departure = new Date(activeReservation.departure);
            const diffTime = Math.abs(departure - arrival);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            for (let i = 0; i < diffDays; i++) {
                const date = new Date(arrival);
                date.setDate(date.getDate() + i);
                charges.push({
                    id: `room-${i}`,
                    date: date.toLocaleDateString(),
                    description: `Accommodation - ${activeReservation.type}`,
                    amount: activeReservation.rate,
                    type: 'charge'
                });
            }
            return charges;
        };

        const allCharges = [...getDailyCharges(), ...extraCharges];
        const totalCharges = allCharges.filter(c => c.type === 'charge').reduce((sum, c) => sum + c.amount, 0);
        const totalPayments = allCharges.filter(c => c.type === 'payment').reduce((sum, c) => sum + c.amount, 0);
        const balance = totalCharges - totalPayments;

        const handleAddCharge = () => {
            const amount = prompt("Enter charge amount:");
            if (amount) {
                const desc = prompt("Enter description:", "Restaurant Bar");
                const newCharge = {
                    id: `ext-${Date.now()}`,
                    date: new Date().toLocaleDateString(),
                    description: desc || "Extra Service",
                    amount: parseFloat(amount),
                    type: 'charge'
                };
                const newCharges = [...extraCharges, newCharge];
                setExtraCharges(newCharges);

                const updatedRes = { ...activeReservation, extraCharges: newCharges };
                updateReservation(updatedRes);
                setActiveReservation(updatedRes);
            }
        };

        const handleAddPayment = () => {
            const amount = prompt("Enter payment amount:", balance.toFixed(2));
            if (amount) {
                const newPayment = {
                    id: `pay-${Date.now()}`,
                    date: new Date().toLocaleDateString(),
                    description: "Payment - Cash/Card",
                    amount: parseFloat(amount),
                    type: 'payment'
                };
                const newCharges = [...extraCharges, newPayment];
                setExtraCharges(newCharges);

                const updatedRes = { ...activeReservation, extraCharges: newCharges };
                updateReservation(updatedRes);
                setActiveReservation(updatedRes);
            }
        };

        const [billingDetails, setBillingDetails] = useState(activeReservation.billingDetails || null); // null = Same as Guest
        const [isEditingBilling, setIsEditingBilling] = useState(false);
        const [tempBilling, setTempBilling] = useState({});

        const handleEditBilling = () => {
            setTempBilling(billingDetails || {
                type: 'company',
                name: activeReservation.guestName,
                address: '',
                city: '',
                zip: '',
                country: 'Switzerland',
                vatId: ''
            });
            setIsEditingBilling(true);
        };

        const handleSaveBilling = () => {
            if (!tempBilling.name || !tempBilling.address || !tempBilling.city) {
                alert("Please fill in Name, Address, and City.");
                return;
            }
            setBillingDetails(tempBilling);

            // Persist to global state
            const updatedRes = { ...activeReservation, billingDetails: tempBilling };
            updateReservation(updatedRes);
            setActiveReservation(updatedRes);

            setIsEditingBilling(false);
        };

        return (
            <div className="fade-in">
                <header className="view-header" style={{ marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>Reservations</span>
                            <span style={{ margin: '0 0.5rem' }}>/</span>
                            {activeReservation.id}
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>
                            {activeTab === 'folio' ? 'Folio & Billing' : 'Reservation Details'}
                        </h1>
                    </div>
                </header>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setActiveTab('details')}
                        style={{
                            padding: '0.75rem 0',
                            borderBottom: activeTab === 'details' ? '2px solid #3182ce' : '2px solid transparent',
                            color: activeTab === 'details' ? '#3182ce' : '#718096',
                            fontWeight: 600,
                            background: 'none',
                            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('guests')}
                        style={{
                            padding: '0.75rem 0',
                            borderBottom: activeTab === 'guests' ? '2px solid #3182ce' : '2px solid transparent',
                            color: activeTab === 'guests' ? '#3182ce' : '#718096',
                            fontWeight: 600,
                            background: 'none',
                            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Guests 👥
                    </button>
                    <button
                        onClick={() => setActiveTab('folio')}
                        style={{
                            padding: '0.75rem 0',
                            borderBottom: activeTab === 'folio' ? '2px solid #3182ce' : '2px solid transparent',
                            color: activeTab === 'folio' ? '#3182ce' : '#718096',
                            fontWeight: 600,
                            background: 'none',
                            borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Folio & Charges
                    </button>
                </div>

                {activeTab === 'details' ? (
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                        {/* Main Card */}
                        <div style={{ flex: 2, background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', color: '#2d3748', marginBottom: '0.25rem' }}>{activeReservation.guestName}</h2>
                                    <span style={{
                                        background: STATUS_COLORS[activeReservation.status]?.bg || '#edf2f7',
                                        color: STATUS_COLORS[activeReservation.status]?.text || '#2d3748',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>
                                        {STATUS_COLORS[activeReservation.status]?.label || activeReservation.status}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748' }}>{balance.toFixed(2)} CHF</div>
                                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>Current Balance</div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Reservation ID</label>
                                    <div style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{activeReservation.id}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Room Type</label>
                                    <div>{activeReservation.type}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Arrival</label>
                                    <div>{new Date(activeReservation.arrival).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Departure</label>
                                    <div>{new Date(activeReservation.departure).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <div>{activeReservation.email || '—'}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Room</label>
                                    <div>{activeReservation.room}</div>
                                </div>
                            </div>

                            <div style={{ background: '#f7fafc', padding: '1rem 1.5rem', borderTop: '1px solid #edf2f7' }}>
                                <button style={{ color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                                    + Add comment / special request
                                </button>
                            </div>
                        </div>

                        {/* Actions Sidebar */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                            {/* Lifecycle Actions */}
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h3 style={{ fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Actions</h3>

                                {isCheckInAvailable && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            updateReservationStatus(activeReservation.id, 'checked_in');
                                            setActiveReservation({ ...activeReservation, status: 'checked_in' });
                                        }}
                                        style={{ background: '#E6FFFA', color: '#319795', border: '1px solid #319795', fontWeight: 600, justifyContent: 'center' }}
                                    >
                                        keys 🔑 Check In
                                    </button>
                                )}

                                {isCheckOutAvailable && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            updateReservationStatus(activeReservation.id, 'checked_out');
                                            setActiveReservation({ ...activeReservation, status: 'checked_out' });
                                        }}
                                        style={{ background: '#EDF2F7', color: '#2D3748', border: '1px solid #718096', fontWeight: 600, justifyContent: 'center' }}
                                    >
                                        Check Out 🏁
                                    </button>
                                )}

                                {isCancelAvailable && (
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            if (confirm('Cancel this booking?')) {
                                                updateReservationStatus(activeReservation.id, 'cancelled');
                                                setView('list');
                                            }
                                        }}
                                        style={{ background: '#FFF5F5', color: '#C53030', border: '1px solid #C53030', justifyContent: 'center' }}
                                    >
                                        Cancel Booking
                                    </button>
                                )}

                                {!isCheckInAvailable && !isCheckOutAvailable && !isCancelAvailable && (
                                    <div style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic', textAlign: 'center' }}>
                                        No actions available
                                    </div>
                                )}
                            </div>

                            <button className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', justifyContent: 'flex-start' }}>
                                🖨 Print confirmation
                            </button>
                            <button className="btn" style={{ background: 'white', border: '1px solid #cbd5e1', justifyContent: 'flex-start' }}>
                                ✉️ Resend email
                            </button>
                            <div style={{ height: '1px', background: '#cbd5e1', margin: '0.5rem 0' }}></div>
                            <button className="btn" onClick={() => setView('list')} style={{ background: 'white', border: '1px solid #cbd5e1' }}>
                                ← Back to List
                            </button>
                        </div>
                    </div>
                ) : activeTab === 'guests' ? (
                    <div style={{ animation: 'fadeIn 0.3s ease-in', background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1rem' }}>Guest List</h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: '#3182ce', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                {activeReservation.guestName.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#2d3748' }}>{activeReservation.guestName}</div>
                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>Primary Guest • {activeReservation.email || 'No email provided'}</div>
                            </div>
                            <div style={{ marginLeft: 'auto', color: '#38A169', background: '#F0FFF4', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                CONFIRMED
                            </div>
                        </div>

                        {activeReservation.pax > 1 && (
                            <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '4px', color: '#718096' }}>
                                <div style={{ marginBottom: '0.5rem' }}>+ {activeReservation.pax - 1} Additional Guest(s)</div>
                                <button style={{ color: '#3182ce', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem' }}>
                                    Add Guest Details
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // FOLIO TAB CONTENT
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>

                        {/* Billing Address Section */}
                        <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d3748' }}>Billing Address</h3>
                                {!isEditingBilling && (
                                    <button
                                        onClick={handleEditBilling}
                                        style={{ fontSize: '0.85rem', color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Edit Details
                                    </button>
                                )}
                            </div>

                            <div style={{ padding: '1.5rem' }}>
                                {isEditingBilling ? (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="billingType"
                                                    checked={tempBilling.type === 'company'}
                                                    onChange={() => setTempBilling({ ...tempBilling, type: 'company' })}
                                                /> Company
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="billingType"
                                                    checked={tempBilling.type === 'agency'}
                                                    onChange={() => setTempBilling({ ...tempBilling, type: 'agency' })}
                                                /> Travel Agency
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="billingType"
                                                    checked={tempBilling.type === 'guest'}
                                                    onChange={() => setTempBilling({ ...tempBilling, type: 'guest' })}
                                                /> Guest (Personal)
                                            </label>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Name / Company Name</label>
                                                <input
                                                    style={inputStyle}
                                                    value={tempBilling.name}
                                                    onChange={(e) => setTempBilling({ ...tempBilling, name: e.target.value })}
                                                    placeholder={tempBilling.type === 'company' ? 'Company Name' : 'Full Name'}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>VAT ID / Tax Number</label>
                                                <input
                                                    style={inputStyle}
                                                    value={tempBilling.vatId}
                                                    onChange={(e) => setTempBilling({ ...tempBilling, vatId: e.target.value })}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={labelStyle}>Address</label>
                                                <input
                                                    style={inputStyle}
                                                    value={tempBilling.address}
                                                    onChange={(e) => setTempBilling({ ...tempBilling, address: e.target.value })}
                                                    placeholder="Street, Number"
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>City</label>
                                                <input
                                                    style={inputStyle}
                                                    value={tempBilling.city}
                                                    onChange={(e) => setTempBilling({ ...tempBilling, city: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Country</label>
                                                <input
                                                    style={inputStyle}
                                                    value={tempBilling.country}
                                                    onChange={(e) => setTempBilling({ ...tempBilling, country: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button
                                                className="btn"
                                                onClick={handleSaveBilling}
                                                style={{ background: '#3182ce', color: 'white', border: 'none' }}
                                            >
                                                Save Billing Details
                                            </button>
                                            <button
                                                className="btn"
                                                onClick={() => setIsEditingBilling(false)}
                                                style={{ background: 'white', border: '1px solid #cbd5e1' }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {billingDetails ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.2rem' }}>Bill To</div>
                                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#2d3748' }}>{billingDetails.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#718096', textTransform: 'uppercase', marginTop: '0.2rem', display: 'inline-block', background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>
                                                        {billingDetails.type}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>{billingDetails.address}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>{billingDetails.zip} {billingDetails.city}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>{billingDetails.country}</div>
                                                    {billingDetails.vatId && <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.5rem' }}>VAT: {billingDetails.vatId}</div>}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ color: '#718096', fontStyle: 'italic' }}>
                                                    Same as Guest ({activeReservation.guestName})
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d3748' }}>Main Bill</h3>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead style={{ background: '#f7fafc', color: '#718096', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Amount (CHF)</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>VAT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allCharges.map((charge) => (
                                        <tr key={charge.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                            <td style={{ padding: '1rem' }}>{charge.date}</td>
                                            <td style={{ padding: '1rem', fontWeight: 500, color: charge.type === 'payment' ? '#2F855A' : '#2d3748' }}>
                                                {charge.description}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: charge.type === 'payment' ? '#2F855A' : '#2d3748' }}>
                                                {charge.type === 'payment' ? '-' : ''}{charge.amount.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: '#718096' }}>
                                                {charge.type === 'charge' ? (charge.amount * 0.077).toFixed(2) : '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot style={{ background: '#f8fafc', fontWeight: 600 }}>
                                    <tr>
                                        <td colSpan="2" style={{ padding: '1rem', textAlign: 'right' }}>Total Charges:</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{totalCharges.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2" style={{ padding: '1rem', textAlign: 'right', color: '#2F855A' }}>Total Payments:</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#2F855A' }}>-{totalPayments.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                    <tr style={{ background: '#ebf8ff', borderTop: '2px solid #3182ce', fontSize: '1rem' }}>
                                        <td colSpan="2" style={{ padding: '1rem', textAlign: 'right', color: '#2d3748' }}>Balance Due:</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#c53030' }}>{balance.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button
                                    onClick={handleAddCharge}
                                    className="btn"
                                    style={{ background: 'white', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                                >
                                    + Add Charge
                                </button>
                                <button
                                    onClick={handleAddPayment}
                                    className="btn"
                                    style={{ background: '#48BB78', color: 'white', border: 'none', fontSize: '0.85rem' }}
                                >
                                    Add Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // 1. Create Booking View (Modified)
    const CreateBookingView = () => (
        <div className="fade-in">
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
    if (view === 'summary') return <ReservationSummary />;

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
