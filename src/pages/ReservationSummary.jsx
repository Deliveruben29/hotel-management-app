import React, { useState } from 'react';
import { STATUS_COLORS, MOCK_COMPANIES, COUNTRIES } from '../data/mockData';

export const ReservationSummary = ({
    activeReservation,
    updateReservation,
    setActiveReservation,
    onBack,
    onEditGuest // Added explicit handler prop if needed, or use internal
}) => {
    // START: State Definitions
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'guests', 'folio'
    const [extraCharges, setExtraCharges] = useState(activeReservation?.extraCharges || []);
    const [folios, setFolios] = useState([
        { id: 1, name: 'Folio 1 (Main)' },
        { id: 2, name: 'Folio 2 (Extras)' }
    ]);
    const [billingDetailsMap, setBillingDetailsMap] = useState(
        activeReservation?.folioBillingDetails || {
            1: activeReservation?.billingDetails || null
        }
    );

    // Guest Editing State
    const [isEditingGuest, setIsEditingGuest] = useState(false);
    const [guestFormData, setGuestFormData] = useState({});

    // Billing Editing State - Refactored for Per-Folio
    const [editingFolioId, setEditingFolioId] = useState(null);
    // billingDetailsMap is declared above

    const [tempBilling, setTempBilling] = useState({});

    // Folio Management State
    const [folioAssignments, setFolioAssignments] = useState(activeReservation?.folioAssignments || {});

    // Rectify Modal State
    const [rectifyingCharge, setRectifyingCharge] = useState(null); // The charge object being rectified
    const [rectifyReason, setRectifyReason] = useState('');
    const [rectifyValue, setRectifyValue] = useState('');
    const [rectifyType, setRectifyType] = useState('amount'); // 'amount' or 'percent'

    // Bulk Actions State
    const [selectedCharges, setSelectedCharges] = useState([]); // Set of charge IDs

    // Success notification state
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    // END: State Definitions

    const isCheckInAvailable = activeReservation?.status === 'confirmed';
    const isCheckOutAvailable = activeReservation?.status === 'checked_in';
    const isCancelAvailable = activeReservation?.status === 'confirmed';

    // Helper to generate daily room charges
    const getDailyCharges = () => {
        if (!activeReservation) return [];
        const start = new Date(activeReservation.arrival);
        const end = new Date(activeReservation.departure);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const charges = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            charges.push({
                id: `room-${i}`,
                date: date.toLocaleDateString(),
                description: `Accommodation - ${activeReservation.type}`,
                amount: activeReservation.rate,
                type: 'charge',
                folioId: 1 // Default to Main Folio
            });
        }
        return charges;
    };

    const allCharges = [...getDailyCharges(), ...extraCharges].map(c => ({
        ...c,
        folioId: folioAssignments[c.id] !== undefined ? folioAssignments[c.id] : c.folioId
    }));
    const totalCharges = allCharges.filter(c => c.type === 'charge').reduce((sum, c) => sum + c.amount, 0);
    const totalPayments = allCharges.filter(c => c.type === 'payment').reduce((sum, c) => sum + c.amount, 0);
    const balance = totalCharges - totalPayments;

    const handleAddFolio = () => {
        const newId = folios.length + 1;
        setFolios([...folios, { id: newId, name: `Folio ${newId}` }]);
    };

    const handleAddCharge = (targetFolioId = 2) => {
        // Safe check for event object if passed directly from onClick
        const effectiveFolioId = (typeof targetFolioId === 'object' || targetFolioId === undefined) ? 2 : targetFolioId;

        const amount = prompt("Enter charge amount:");
        if (amount) {
            const desc = prompt("Enter description:", "Restaurant Bar");
            const newCharge = {
                id: `ext-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                description: desc || "Extra Service",
                amount: parseFloat(amount),
                type: 'charge',
                folioId: effectiveFolioId
            };
            const newCharges = [...extraCharges, newCharge];
            setExtraCharges(newCharges);

            const updatedRes = { ...activeReservation, extraCharges: newCharges };
            updateReservation(updatedRes);
            setActiveReservation(updatedRes);
        }
    };

    const handleAddPayment = (targetFolioId = 1) => {
        // Safe check for event object
        const effectiveFolioId = (typeof targetFolioId === 'object' || targetFolioId === undefined) ? 1 : targetFolioId;

        const amount = prompt("Enter payment amount:");
        if (amount) {
            const newPayment = {
                id: `pay-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                description: "Payment - Cash/Card",
                amount: parseFloat(amount),
                type: 'payment',
                folioId: effectiveFolioId
            };
            const newCharges = [...extraCharges, newPayment];
            setExtraCharges(newCharges);

            const updatedRes = { ...activeReservation, extraCharges: newCharges };
            updateReservation(updatedRes);
            setActiveReservation(updatedRes);
        }
    };

    // --- Guest Profile Handlers ---
    const handleEditGuest = () => {
        setGuestFormData({
            guestName: activeReservation.guestName,
            email: activeReservation.email || '',
            phone: activeReservation.phone || '',
            street: activeReservation.street || '',
            postalCode: activeReservation.postalCode || '',
            city: activeReservation.city || '',
            region: activeReservation.region || '',
            country: activeReservation.country || 'Switzerland',
            companyDetails: activeReservation.billingDetails || {}
        });
        setIsEditingGuest(true);
    };

    const handleSaveGuest = () => {
        const updatedRes = {
            ...activeReservation,
            guestName: guestFormData.guestName,
            email: guestFormData.email,
            phone: guestFormData.phone,
            street: guestFormData.street,
            postalCode: guestFormData.postalCode,
            city: guestFormData.city,
            region: guestFormData.region,
            country: guestFormData.country,
            billingDetails: guestFormData.companyDetails
        };

        // Update billing details map if company details exist
        if (guestFormData.companyDetails) {
            const newMap = { ...billingDetailsMap, 1: guestFormData.companyDetails };
            setBillingDetailsMap(newMap);
            updatedRes.folioBillingDetails = newMap;
        }

        updateReservation(updatedRes);
        setActiveReservation(updatedRes);

        // Show success message
        setSuccessMessage('Guest profile saved successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        setIsEditingGuest(false);
    };

    const handleSelectCompany = (companyCode) => {
        if (companyCode === 'guest') {
            setGuestFormData({
                ...guestFormData,
                companyDetails: null
            });
            return;
        }

        const company = MOCK_COMPANIES.find(c => c.code === companyCode);
        if (company) {
            setGuestFormData({
                ...guestFormData,
                companyDetails: {
                    type: 'company',
                    name: company.name,
                    address: company.address,
                    vatId: company.code,
                    city: company.address.split(',')[1]?.trim() || '',
                    country: 'Switzerland'
                }
            });
        }
    };

    // --- Billing Handlers (Per Folio) ---
    const handleEditBilling = (folioId) => {
        const currentDetails = billingDetailsMap[folioId];

        setTempBilling(currentDetails || {
            type: 'company',
            name: activeReservation.guestName,
            address: activeReservation.street || '',
            city: activeReservation.city || '',
            zip: activeReservation.postalCode || '',
            country: activeReservation.country || 'Switzerland',
            vatId: ''
        });
        setEditingFolioId(folioId);
    };

    const handleSaveBilling = () => {
        if (!tempBilling.name || !tempBilling.address || !tempBilling.city) {
            alert("Please fill in Name, Address, and City.");
            return;
        }

        const newMap = { ...billingDetailsMap, [editingFolioId]: tempBilling };
        setBillingDetailsMap(newMap);

        // Persist to global state (using a new field 'folioBillingDetails' to support multiple)
        const updatedRes = {
            ...activeReservation,
            folioBillingDetails: newMap,
            // Sync main billing details if modifying Folio 1, for backward compatibility
            billingDetails: editingFolioId === 1 ? tempBilling : activeReservation.billingDetails
        };

        updateReservation(updatedRes);
        setActiveReservation(updatedRes);
        setEditingFolioId(null);
    };

    const handleCancelEdit = () => {
        setEditingFolioId(null);
        setTempBilling({});
    };

    // Render Edit Guest Form
    if (isEditingGuest) {
        return (
            <div className="dashboard-view fade-in">
                <header className="view-header" style={{ marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <span style={{ cursor: 'pointer' }} onClick={() => setIsEditingGuest(false)}>Cancel Edit</span>
                            <span style={{ margin: '0 0.5rem' }}>/</span>
                            Edit Guest Profile
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>
                            Edit Guest Profile
                        </h1>
                    </div>
                </header>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>

                    {/* Guest Personal Data */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.guestName || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, guestName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.email || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.phone || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, phone: e.target.value })}
                                    placeholder="+41 00 000 00 00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guest Address */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Address</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Street & House Nr.</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.street || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, street: e.target.value })}
                                    placeholder="Main Street 123"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Postal Code</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.postalCode || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, postalCode: e.target.value })}
                                    placeholder="8000"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>City</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.city || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, city: e.target.value })}
                                    placeholder="Zurich"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Region / Canton</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.region || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, region: e.target.value })}
                                    placeholder="Zurich"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Country</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.country || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, country: e.target.value })}
                                    placeholder="Enter country or code..."
                                    list="country-list"
                                />
                                <datalist id="country-list">
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.name}>{c.code}</option>
                                    ))}
                                </datalist>
                            </div>
                        </div>
                    </div>

                    {/* Company / Billing Data */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Company / Billing Details</h3>

                        {/* Company Selector */}
                        <div style={{ marginBottom: '1rem', background: '#f7fafc', padding: '1rem', borderRadius: '4px' }}>
                            <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Link to Company Profile</label>
                            <select
                                style={inputStyle}
                                onChange={(e) => handleSelectCompany(e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Select a company to auto-fill...</option>
                                <option value="guest">Guest (Personal)</option>
                                {MOCK_COMPANIES.map(c => (
                                    <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyle}>Billing Name</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.companyDetails?.name || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, companyDetails: { ...guestFormData.companyDetails, name: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Address</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.companyDetails?.address || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, companyDetails: { ...guestFormData.companyDetails, address: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>City</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.companyDetails?.city || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, companyDetails: { ...guestFormData.companyDetails, city: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>VAT / Tax ID</label>
                                <input
                                    style={inputStyle}
                                    value={guestFormData.companyDetails?.vatId || ''}
                                    onChange={e => setGuestFormData({ ...guestFormData, companyDetails: { ...guestFormData.companyDetails, vatId: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button className="btn" onClick={() => setIsEditingGuest(false)} style={{ background: 'white', border: '1px solid #cbd5e1' }}>Cancel</button>
                        <button className="btn btn-apaleo-primary" onClick={handleSaveGuest}>Save Guest Profile</button>
                    </div>
                </div>
            </div>
        )
    }


    const handleMoveCharge = (chargeId, currentFolioId) => {
        // Simple toggle for now since we have 2 folios by default, or find next available
        const targetFolio = folios.find(f => f.id !== currentFolioId) || folios[0];
        if (!targetFolio) return; // Should not happen

        if (confirm(`Move charge to ${targetFolio.name}?`)) {
            const newAssignments = { ...folioAssignments, [chargeId]: targetFolio.id };
            setFolioAssignments(newAssignments);

            // Persist
            const updatedRes = {
                ...activeReservation,
                folioAssignments: newAssignments
            };
            updateReservation(updatedRes);
        }
    };

    const handleInitiateRectify = (charge) => {
        setRectifyingCharge(charge);
        setRectifyReason('');
        setRectifyValue(charge.amount.toFixed(2));
        setRectifyType('amount');
    };

    const handleConfirmRectify = () => {
        if (!rectifyingCharge) return;
        const val = parseFloat(rectifyValue);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid positive value.");
            return;
        }
        if (!rectifyReason.trim()) {
            alert("Please provide a reason for rectification.");
            return;
        }

        let refundAmount = 0;
        if (rectifyType === 'percent') {
            refundAmount = (rectifyingCharge.amount * val) / 100;
        } else {
            refundAmount = val;
        }

        // Ensure we don't refund more than original? 
        // Usually dependent on business logic, but let's allow corrections.

        const newCharge = {
            id: `adj-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            description: `Rebate: ${rectifyingCharge.description} (${rectifyReason})`,
            amount: -Math.abs(refundAmount), // Negative amount
            type: 'charge', // It's a charge adjustment, technically
            folioId: rectifyingCharge.folioId // Stay in same folio
        };

        const newCharges = [...extraCharges, newCharge];
        setExtraCharges(newCharges);

        const updatedRes = { ...activeReservation, extraCharges: newCharges };
        updateReservation(updatedRes);
        setActiveReservation(updatedRes);

        setRectifyingCharge(null);
    };

    // Bulk Action Handlers
    const handleSelectCharge = (chargeId) => {
        if (selectedCharges.includes(chargeId)) {
            setSelectedCharges(selectedCharges.filter(id => id !== chargeId));
        } else {
            setSelectedCharges([...selectedCharges, chargeId]);
        }
    };

    const handleSelectAll = (folioCharges, isSelected) => {
        const ids = folioCharges.map(c => c.id);
        if (isSelected) {
            // Add all that are not already in selectedCharges
            const toAdd = ids.filter(id => !selectedCharges.includes(id));
            setSelectedCharges([...selectedCharges, ...toAdd]);
        } else {
            // Remove checks
            setSelectedCharges(selectedCharges.filter(id => !ids.includes(id)));
        }
    };

    const handleBulkMove = (targetFolioId) => {
        if (selectedCharges.length === 0) return;

        if (confirm(`Move ${selectedCharges.length} items to Folio ${targetFolioId}?`)) {
            const newAssignments = { ...folioAssignments };
            selectedCharges.forEach(id => {
                newAssignments[id] = targetFolioId;
            });
            setFolioAssignments(newAssignments);

            const updatedRes = {
                ...activeReservation,
                folioAssignments: newAssignments
            };
            updateReservation(updatedRes);
            setSelectedCharges([]); // Clear selection after move
        }
    };

    // Render Rectify Modal (Simple inline overlay for now)
    const renderRectifyModal = () => {
        if (!rectifyingCharge) return null;
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, color: '#2d3748' }}>Rectify / Revert Charge</h3>
                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.5rem' }}>
                        Adjusting: <strong>{rectifyingCharge.description}</strong> ({rectifyingCharge.amount.toFixed(2)})
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Adjustment Type</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="radio" checked={rectifyType === 'amount'} onChange={() => setRectifyType('amount')} /> Fixed Amount
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="radio" checked={rectifyType === 'percent'} onChange={() => setRectifyType('percent')} /> Percentage (%)
                            </label>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Value ({rectifyType === 'amount' ? 'CHF' : '%'})</label>
                        <input
                            style={inputStyle}
                            type="number"
                            step="0.01"
                            value={rectifyValue}
                            onChange={e => setRectifyValue(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Reason</label>
                        <input
                            style={inputStyle}
                            placeholder="e.g. Guest complaint, Service error"
                            value={rectifyReason}
                            onChange={e => setRectifyReason(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn" onClick={() => setRectifyingCharge(null)} style={{ background: 'white', border: '1px solid #cbd5e1' }}>Cancel</button>
                        <button className="btn btn-apaleo-primary" onClick={handleConfirmRectify}>Process Adjustment</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-view fade-in">
            {renderRectifyModal()}

            {/* Success Notification */}
            {showSuccessMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(72, 187, 120, 0.3)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    animation: 'slideInRight 0.3s ease-out',
                    fontWeight: 500,
                    fontSize: '0.95rem'
                }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="white" />
                    </svg>
                    {successMessage}
                </div>
            )}

            <header className="view-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ cursor: 'pointer' }} onClick={onBack}>Reservations</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        {activeReservation.id}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>
                        {activeTab === 'folio' ? 'Folio & Billing' : 'Reservation Details (New)'}
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
                                <h2
                                    onDoubleClick={handleEditGuest}
                                    title="Double click to edit guest profile"
                                    style={{ fontSize: '1.25rem', color: '#2d3748', marginBottom: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    {activeReservation.guestName}
                                    <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 400 }}>✎</span>
                                </h2>
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
                            {/* Actions Buttons Removed for Brevity in this standalone component, you can add them back using props to trigger status changes if needed */}
                        </div>

                        <button className="btn" onClick={onBack} style={{ background: 'white', border: '1px solid #cbd5e1' }}>
                            ← Back to List
                        </button>
                    </div>
                </div>
            ) : activeTab === 'guests' ? (
                <div style={{ animation: 'fadeIn 0.3s ease-in', background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1rem' }}>Guest List</h3>
                    <div
                        onDoubleClick={handleEditGuest}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '1rem', cursor: 'pointer' }}
                        title="Double click to edit"
                    >
                        <div style={{ width: '40px', height: '40px', background: '#3182ce', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            {activeReservation.guestName.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {activeReservation.guestName} <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>✎</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>Primary Guest • {activeReservation.email || 'No email provided'}</div>
                        </div>
                    </div>
                </div>
            ) : (
                // FOLIO TAB
                <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748' }}>Folios</h3>
                        <button className="btn" onClick={handleAddFolio} style={{ background: '#3182ce', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            + Add Folio
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {folios.map((folio) => {
                            const folioCharges = allCharges.filter(c => c.folioId === folio.id || (folio.id === 1 && !c.folioId));
                            const fTotalCharges = folioCharges.filter(c => c.type === 'charge').reduce((sum, c) => sum + c.amount, 0);
                            const fTotalPayments = folioCharges.filter(c => c.type === 'payment').reduce((sum, c) => sum + c.amount, 0);
                            const fBalance = fTotalCharges - fTotalPayments;

                            const fBilling = billingDetailsMap[folio.id];
                            const isEditingThis = editingFolioId === folio.id;

                            return (
                                <div key={folio.id} style={{ minWidth: '500px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                    {/* Per-Folio Billing Section */}
                                    <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', margin: 0 }}>Billing Address (Folio {folio.id})</h4>
                                            {!isEditingThis && (
                                                <button
                                                    onClick={() => handleEditBilling(folio.id)}
                                                    style={{ fontSize: '0.8rem', color: '#3182ce', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ padding: '1rem' }}>
                                            {isEditingThis ? (
                                                <div style={{ display: 'grid', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <input
                                                                type="radio"
                                                                name={`billingType-${folio.id}`}
                                                                checked={tempBilling.type === 'company'}
                                                                onChange={() => setTempBilling({ ...tempBilling, type: 'company' })}
                                                            /> Company
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <input
                                                                type="radio"
                                                                name={`billingType-${folio.id}`}
                                                                checked={tempBilling.type === 'agency'}
                                                                onChange={() => setTempBilling({ ...tempBilling, type: 'agency' })}
                                                            /> Travel Agency
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                            <input
                                                                type="radio"
                                                                name={`billingType-${folio.id}`}
                                                                checked={tempBilling.type === 'guest'}
                                                                onChange={() => setTempBilling({
                                                                    ...tempBilling,
                                                                    type: 'guest',
                                                                    name: activeReservation.guestName,
                                                                    address: activeReservation.street || '',
                                                                    city: activeReservation.city || '',
                                                                    zip: activeReservation.postalCode || '',
                                                                    country: activeReservation.country || 'Switzerland',
                                                                    vatId: ''
                                                                })}
                                                            /> Guest (Personal)
                                                        </label>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div style={{ gridColumn: 'span 2' }}>
                                                            <label style={labelStyle}>Name</label>
                                                            <input
                                                                style={inputStyle}
                                                                value={tempBilling.name}
                                                                onChange={(e) => setTempBilling({ ...tempBilling, name: e.target.value })}
                                                                placeholder="Full Name / Company"
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
                                                            <label style={labelStyle}>ZIP</label>
                                                            <input
                                                                style={inputStyle}
                                                                value={tempBilling.zip}
                                                                onChange={(e) => setTempBilling({ ...tempBilling, zip: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        <button
                                                            className="btn"
                                                            onClick={handleSaveBilling}
                                                            style={{ background: '#3182ce', color: 'white', border: 'none', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="btn"
                                                            onClick={handleCancelEdit}
                                                            style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {fBilling ? (
                                                        <div style={{ fontSize: '0.9rem', color: '#2d3748' }}>
                                                            <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{fBilling.name}</div>
                                                            <div>{fBilling.address}</div>
                                                            <div>{fBilling.zip} {fBilling.city}, {fBilling.country}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.4rem' }}>
                                                                <span style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px' }}>{fBilling.type}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '0.9rem', color: '#a0aec0', fontStyle: 'italic' }}>
                                                            Default (Guest: {activeReservation.guestName})
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Folio Transactions Table */}
                                    <div style={{ background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 600, color: '#2d3748' }}>{folio.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>#{folio.id}</div>
                                        </div>

                                        <div style={{ flex: 1, overflowY: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead style={{ background: '#fff', color: '#718096', borderBottom: '1px solid #edf2f7' }}>
                                                    <tr>
                                                        <th style={{ padding: '0.75rem', width: '40px', textAlign: 'center' }}>
                                                            <input
                                                                type="checkbox"
                                                                onChange={(e) => handleSelectAll(folioCharges, e.target.checked)}
                                                                checked={folioCharges.length > 0 && folioCharges.every(c => selectedCharges.includes(c.id))}
                                                            />
                                                        </th>
                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500 }}>Date</th>
                                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 500 }}>Description</th>
                                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 500 }}>Amount</th>
                                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 500, width: '80px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {folioCharges.map((charge) => (
                                                        <tr key={charge.id} style={{ borderBottom: '1px solid #f7fafc', background: selectedCharges.includes(charge.id) ? '#ebf8ff' : 'transparent' }}>
                                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCharges.includes(charge.id)}
                                                                    onChange={() => handleSelectCharge(charge.id)}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '0.75rem' }}>{charge.date}</td>
                                                            <td style={{ padding: '0.75rem', color: charge.type === 'payment' ? '#2F855A' : '#2d3748' }}>
                                                                {charge.description}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: charge.type === 'payment' ? '#2F855A' : '#2d3748' }}>
                                                                {charge.type === 'payment' ? '-' : ''}{charge.amount.toFixed(2)}
                                                            </td>
                                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                                {charge.type === 'charge' && charge.amount > 0 && (
                                                                    <div className="dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                                                                        <button
                                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#a0aec0', lineHeight: 1 }}
                                                                            onClick={(e) => {
                                                                                const menu = e.currentTarget.nextElementSibling;
                                                                                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                // Delay hiding to allow click
                                                                                setTimeout(() => {
                                                                                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'none';
                                                                                }, 200);
                                                                            }}
                                                                        >
                                                                            ⋮
                                                                        </button>
                                                                        <div
                                                                            className="dropdown-menu"
                                                                            style={{
                                                                                display: 'none',
                                                                                position: 'absolute',
                                                                                right: 0,
                                                                                top: '100%',
                                                                                background: 'white',
                                                                                border: '1px solid #e2e8f0',
                                                                                borderRadius: '4px',
                                                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                                                zIndex: 10,
                                                                                fontSize: '0.8rem',
                                                                                minWidth: '120px',
                                                                                overflow: 'hidden'
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f7fafc', whiteSpace: 'nowrap' }}
                                                                                className="hover-bg-gray"
                                                                                onClick={() => handleMoveCharge(charge.id, folio.id)}
                                                                            >
                                                                                Move Folio
                                                                            </div>
                                                                            <div
                                                                                style={{ padding: '8px 12px', cursor: 'pointer', color: '#c53030', whiteSpace: 'nowrap' }}
                                                                                className="hover-bg-gray"
                                                                                onClick={() => handleInitiateRectify(charge)}
                                                                            >
                                                                                Rectify
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {folioCharges.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' }}>No items in this folio</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0.75rem 1rem' }}>
                                            {/* Bulk Action Bar - Show if items selected in this folio */}
                                            {folioCharges.some(c => selectedCharges.includes(c.id)) && (
                                                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#ebf8ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#2b6cb0', fontWeight: 600 }}>
                                                        {folioCharges.filter(c => selectedCharges.includes(c.id)).length} selected
                                                    </span>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {folios.filter(f => f.id !== folio.id).map(target => (
                                                            <button
                                                                key={target.id}
                                                                onClick={() => handleBulkMove(target.id)}
                                                                style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'white', border: '1px solid #bee3f8', color: '#2b6cb0', borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                Move to {target.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                <span>Balance Due:</span>
                                                <span style={{ fontWeight: 700, color: fBalance > 0 ? '#c53030' : '#2F855A' }}>{fBalance.toFixed(2)}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleAddCharge(folio.id)}
                                                    style={{ background: 'white', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    + Charge
                                                </button>
                                                <button
                                                    onClick={() => handleAddPayment(folio.id)}
                                                    style={{ background: '#48BB78', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                >
                                                    Pay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )
            }
        </div>
    );
};

// Styles (Dumb clone for standalone file if needed, but here we just export)
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
