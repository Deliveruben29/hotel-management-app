import React, { useState } from 'react';
import { STATUS_COLORS, MOCK_COMPANIES, COUNTRIES, MOCK_SERVICES } from '../data/mockData';
import { INVOICE_TRANSLATIONS } from '../data/invoiceTranslations';
import { useProperty } from '../context/PropertyContext';
import { getVATRate, formatVATRate } from '../data/vatRates';

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

    // Documents dropdown state (track which folio has menu open)
    const [openDocumentsForFolio, setOpenDocumentsForFolio] = useState(null);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [selectedFolioId, setSelectedFolioId] = useState(null);

    // Add Charge Modal State
    const [showAddChargeModal, setShowAddChargeModal] = useState(false);
    const [chargeModalFolioId, setChargeModalFolioId] = useState(null);
    const [chargeFormData, setChargeFormData] = useState({
        serviceId: '',
        quantity: 1,
        dateOption: 'today', // 'today', 'specific', 'entire-stay'
        selectedDates: [] // Array of date strings for 'specific' option
    });
    // END: State Definitions

    // Get active property for VAT calculation
    const { activeProperty } = useProperty();

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

    // Auto-apply Service Fee based on number of guests PER NIGHT
    React.useEffect(() => {
        if (!activeReservation) return;

        // Check if Service Fee already exists
        const hasServiceFee = extraCharges.some(c => c.description && c.description.includes('Service Fee'));

        if (!hasServiceFee && activeReservation.pax > 0) {
            const SERVICE_FEE_PER_GUEST_PER_NIGHT = 3.50; // CHF per guest per night
            const start = new Date(activeReservation.arrival);
            const end = new Date(activeReservation.departure);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            const serviceFeeCharges = [];

            // Create one Service Fee charge per night
            for (let i = 0; i < nights; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);

                const totalPerNight = activeReservation.pax * SERVICE_FEE_PER_GUEST_PER_NIGHT;

                serviceFeeCharges.push({
                    id: `service-fee-${activeReservation.id}-night-${i}`,
                    date: date.toLocaleDateString(),
                    description: `Service Fee (${activeReservation.pax} ${activeReservation.pax === 1 ? 'guest' : 'guests'})`,
                    amount: totalPerNight,
                    type: 'charge',
                    folioId: 1, // Apply to Main Folio
                    autoApplied: true // Flag to identify auto-applied charges
                });
            }

            setExtraCharges(prev => [...prev, ...serviceFeeCharges]);
        }
    }, [activeReservation?.id]); // Only run when reservation changes


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

        // Open modal instead of prompt
        setChargeModalFolioId(effectiveFolioId);
        setShowAddChargeModal(true);
    };

    const handleSubmitCharge = () => {
        const selectedService = MOCK_SERVICES.find(s => s.id === chargeFormData.serviceId);
        if (!selectedService) {
            alert('Please select a service');
            return;
        }

        // Validate specific dates if that option is selected
        if (chargeFormData.dateOption === 'specific' && chargeFormData.selectedDates.length === 0) {
            alert('Please select at least one date');
            return;
        }

        const quantity = parseInt(chargeFormData.quantity) || 1;
        const newCharges = [];

        // Calculate dates based on option
        if (chargeFormData.dateOption === 'today') {
            // Single charge today
            newCharges.push({
                id: `ext-${Date.now()}`,
                date: new Date().toLocaleDateString(),
                description: selectedService.name,
                amount: selectedService.price * quantity,
                type: 'charge',
                folioId: chargeModalFolioId
            });
        } else if (chargeFormData.dateOption === 'specific') {
            // One charge per selected date
            chargeFormData.selectedDates.forEach((dateStr, index) => {
                newCharges.push({
                    id: `ext-${Date.now()}-${index}`,
                    date: dateStr,
                    description: selectedService.name,
                    amount: selectedService.price * quantity,
                    type: 'charge',
                    folioId: chargeModalFolioId
                });
            });
        } else if (chargeFormData.dateOption === 'entire-stay') {
            // One charge per night of stay
            const start = new Date(activeReservation.arrival);
            const end = new Date(activeReservation.departure);
            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            for (let i = 0; i < nights; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);

                newCharges.push({
                    id: `ext-${Date.now()}-${i}`,
                    date: date.toLocaleDateString(),
                    description: selectedService.name,
                    amount: selectedService.price * quantity,
                    type: 'charge',
                    folioId: chargeModalFolioId
                });
            }
        }

        const updatedCharges = [...extraCharges, ...newCharges];
        setExtraCharges(updatedCharges);

        const updatedRes = { ...activeReservation, extraCharges: updatedCharges };
        updateReservation(updatedRes);
        setActiveReservation(updatedRes);

        // Reset and close
        setShowAddChargeModal(false);
        setChargeFormData({
            serviceId: '',
            quantity: 1,
            dateOption: 'today',
            selectedDates: []
        });
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

    // Document handlers
    const handleCloseToCredit = (folioId) => {
        setOpenDocumentsForFolio(null);
        if (confirm(`Close Folio #${folioId} to credit? This will finalize the folio.`)) {
            setSuccessMessage(`Folio #${folioId} closed to credit (demo)`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            // Here you would typically update the folio status
        }
    };

    const handlePrintPreInvoice = (folioId) => {
        setOpenDocumentsForFolio(null);
        setSelectedFolioId(folioId);
        setShowLanguageModal(true);
    };

    const handleLanguageSelect = (lang) => {
        setSelectedLanguage(lang);
        setShowLanguageModal(false);
        setShowInvoicePreview(true);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const handleCloseInvoice = () => {
        setShowInvoicePreview(false);
    };

    const handleEarlyCheckout = (folioId) => {
        setOpenDocumentsForFolio(null);
        if (confirm(`Process early check-out for Folio #${folioId}?`)) {
            setSuccessMessage(`Early check-out processed for Folio #${folioId} (demo)`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            // Here you would typically update the reservation status and departure date
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

    // Render Language Selection Modal
    // Render Add Charge Modal
    const renderAddChargeModal = () => {
        if (!showAddChargeModal) return null;

        const selectedService = MOCK_SERVICES.find(s => s.id === chargeFormData.serviceId);

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <h3 style={{ marginTop: 0, color: '#2d3748', marginBottom: '0.5rem' }}>Add Charge to Folio #{chargeModalFolioId}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.5rem' }}>Select a service and specify how to apply it</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Service Selection */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                Service *
                            </label>
                            <select
                                value={chargeFormData.serviceId}
                                onChange={(e) => setChargeFormData({ ...chargeFormData, serviceId: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem',
                                    background: 'white'
                                }}
                            >
                                <option value="">Select a service...</option>
                                {MOCK_SERVICES.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - {service.price.toFixed(2)} {service.currency}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={chargeFormData.quantity}
                                onChange={(e) => setChargeFormData({ ...chargeFormData, quantity: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        {/* Date Application Option */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                Apply to *
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '2px solid ' + (chargeFormData.dateOption === 'today' ? '#3182ce' : '#e2e8f0'), borderRadius: '6px', cursor: 'pointer', background: chargeFormData.dateOption === 'today' ? '#ebf8ff' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="dateOption"
                                        value="today"
                                        checked={chargeFormData.dateOption === 'today'}
                                        onChange={(e) => setChargeFormData({ ...chargeFormData, dateOption: e.target.value })}
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#2d3748' }}>Today</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Apply once on current date</div>
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', padding: '0.75rem', border: '2px solid ' + (chargeFormData.dateOption === 'specific' ? '#3182ce' : '#e2e8f0'), borderRadius: '6px', cursor: 'pointer', background: chargeFormData.dateOption === 'specific' ? '#ebf8ff' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="dateOption"
                                        value="specific"
                                        checked={chargeFormData.dateOption === 'specific'}
                                        onChange={(e) => setChargeFormData({ ...chargeFormData, dateOption: e.target.value, selectedDates: [] })}
                                        style={{ transform: 'scale(1.2)', marginTop: '0.25rem' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#2d3748' }}>Specific Dates</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.75rem' }}>Select individual dates</div>

                                        {chargeFormData.dateOption === 'specific' && (() => {
                                            const start = new Date(activeReservation.arrival);
                                            const end = new Date(activeReservation.departure);
                                            const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                                            const dates = [];

                                            for (let i = 0; i < nights; i++) {
                                                const date = new Date(start);
                                                date.setDate(date.getDate() + i);
                                                dates.push(date);
                                            }

                                            return (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    {dates.map((date, index) => {
                                                        const dateStr = date.toLocaleDateString();
                                                        const isSelected = chargeFormData.selectedDates.includes(dateStr);

                                                        return (
                                                            <label
                                                                key={index}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.5rem',
                                                                    padding: '0.5rem',
                                                                    background: isSelected ? '#e6fffa' : '#f7fafc',
                                                                    border: '1px solid ' + (isSelected ? '#38b2ac' : '#e2e8f0'),
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.85rem'
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        const newSelected = isSelected
                                                                            ? chargeFormData.selectedDates.filter(d => d !== dateStr)
                                                                            : [...chargeFormData.selectedDates, dateStr];
                                                                        setChargeFormData({ ...chargeFormData, selectedDates: newSelected });
                                                                    }}
                                                                    style={{ transform: 'scale(1.1)' }}
                                                                />
                                                                <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? '#234e52' : '#4a5568' }}>
                                                                    {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '2px solid ' + (chargeFormData.dateOption === 'entire-stay' ? '#3182ce' : '#e2e8f0'), borderRadius: '6px', cursor: 'pointer', background: chargeFormData.dateOption === 'entire-stay' ? '#ebf8ff' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="dateOption"
                                        value="entire-stay"
                                        checked={chargeFormData.dateOption === 'entire-stay'}
                                        onChange={(e) => setChargeFormData({ ...chargeFormData, dateOption: e.target.value })}
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#2d3748' }}>Entire Stay</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Apply once per night of stay</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Summary */}
                        {selectedService && (
                            <div style={{ background: '#f7fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>Total Amount:</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2d3748' }}>
                                    {chargeFormData.dateOption === 'entire-stay'
                                        ? ((selectedService.price * chargeFormData.quantity * Math.ceil((new Date(activeReservation.departure) - new Date(activeReservation.arrival)) / (1000 * 60 * 60 * 24))).toFixed(2))
                                        : chargeFormData.dateOption === 'specific'
                                            ? ((selectedService.price * chargeFormData.quantity * chargeFormData.selectedDates.length).toFixed(2))
                                            : ((selectedService.price * chargeFormData.quantity).toFixed(2))
                                    } CHF
                                </div>
                                {chargeFormData.dateOption === 'entire-stay' && (
                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
                                        {Math.ceil((new Date(activeReservation.departure) - new Date(activeReservation.arrival)) / (1000 * 60 * 60 * 24))} nights × {(selectedService.price * chargeFormData.quantity).toFixed(2)} CHF
                                    </div>
                                )}
                                {chargeFormData.dateOption === 'specific' && chargeFormData.selectedDates.length > 0 && (
                                    <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
                                        {chargeFormData.selectedDates.length} {chargeFormData.selectedDates.length === 1 ? 'date' : 'dates'} × {(selectedService.price * chargeFormData.quantity).toFixed(2)} CHF
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handleSubmitCharge}
                            className="btn"
                            style={{ flex: 1, background: '#3182ce', color: 'white', padding: '0.75rem', fontWeight: 600 }}
                        >
                            Add Charge
                        </button>
                        <button
                            onClick={() => {
                                setShowAddChargeModal(false);
                                setChargeFormData({ serviceId: '', quantity: 1, dateOption: 'today' });
                            }}
                            className="btn"
                            style={{ padding: '0.75rem 1.5rem', border: '1px solid #cbd5e1', background: 'white' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderLanguageModal = () => {
        if (!showLanguageModal) return null;

        const languages = [
            { code: 'en', name: 'English', flag: '🇬🇧' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'it', name: 'Italiano', flag: '🇮🇹' }
        ];

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    <h3 style={{ marginTop: 0, color: '#2d3748', marginBottom: '0.5rem' }}>Select Invoice Language</h3>
                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1.5rem' }}>Choose the language for your pre-invoice</p>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                style={{
                                    padding: '1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.borderColor = '#3182ce';
                                    e.currentTarget.style.background = '#ebf8ff';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>{lang.flag}</span>
                                <span style={{ fontWeight: 600, color: '#2d3748' }}>{lang.name}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowLanguageModal(false)}
                        style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    // Render Invoice Preview
    const renderInvoicePreview = () => {
        if (!showInvoicePreview) return null;

        const t = INVOICE_TRANSLATIONS[selectedLanguage];
        const invoiceNumber = `INV-${activeReservation.confirmationNumber}`;
        const todayDate = new Date().toLocaleDateString();

        // Calculate nights
        const checkInDate = new Date(activeReservation.checkIn);
        const checkOutDate = new Date(activeReservation.checkOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        // Get billing address for selected folio
        const billing = billingDetailsMap[selectedFolioId] || {
            name: activeReservation.guestName,
            address: activeReservation.street || '',
            city: activeReservation.city || '',
            zip: activeReservation.postalCode || '',
            country: activeReservation.country || ''
        };

        // Calculate totals for selected folio only
        const folioOnlyCharges = allCharges.filter(c => c.folioId === selectedFolioId || (selectedFolioId === 1 && !c.folioId));
        const folioChargesOnly = folioOnlyCharges.filter(c => c.type === 'charge');
        const folioPaymentsOnly = folioOnlyCharges.filter(c => c.type === 'payment');

        // Prices are VAT-inclusive, so we need to extract the VAT amount
        const totalWithTax = folioChargesOnly.reduce((sum, c) => sum + c.amount, 0);
        // Get VAT rate based on active property's country
        const taxRate = activeProperty ? getVATRate(activeProperty.country, 'accommodation') : 0.038;
        // Calculate net amount (price without VAT) from total
        const subtotal = totalWithTax / (1 + taxRate);
        const taxAmount = totalWithTax - subtotal;
        const folioTotalPayments = folioPaymentsOnly.reduce((sum, c) => sum + c.amount, 0);
        const folioBalance = totalWithTax - folioTotalPayments;

        return (
            <div className="invoice-preview-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                zIndex: 10001,
                overflow: 'auto',
                padding: '2rem'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                    {/* Action Bar */}
                    <div className="no-print" style={{ background: '#f7fafc', padding: '1rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#718096' }}>Preview Mode - {t.preInvoice}</span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handlePrintInvoice} className="btn btn-apaleo-primary" style={{ padding: '0.6rem 1.5rem' }}>
                                🖨️ Print / Save PDF
                            </button>
                            <button onClick={handleCloseInvoice} className="btn" style={{ padding: '0.6rem 1.5rem', border: '1px solid #cbd5e1' }}>
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Invoice Content */}
                    <div className="invoice-content" style={{ padding: '3rem', position: 'relative' }}>
                        {/* Watermark */}
                        <div className="watermark" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(-45deg)',
                            fontSize: '5rem',
                            fontWeight: 900,
                            color: 'rgba(200, 200, 200, 0.15)',
                            textTransform: 'uppercase',
                            pointerEvents: 'none',
                            userSelect: 'none',
                            zIndex: 1,
                            whiteSpace: 'nowrap'
                        }}>
                            {t.preInvoice}
                        </div>

                        {/* Header */}
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '3px solid #3182ce' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2d3748', margin: 0, marginBottom: '0.5rem' }}>
                                    Hotel Management
                                </h1>
                                <p style={{ color: '#718096', margin: 0 }}>Premium Hospitality Services</p>
                            </div>

                            {/* Invoice Info & Billing Address */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                                        {t.invoice} {t.invoiceNumber}
                                    </h3>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2d3748', margin: 0, marginBottom: '1rem' }}>
                                        {invoiceNumber}
                                    </p>
                                    <div style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.8 }}>
                                        <div><strong>{t.date}:</strong> {todayDate}</div>
                                        <div><strong>{t.reservation}:</strong> #{activeReservation.confirmationNumber}</div>
                                        <div><strong>{t.room}:</strong> {activeReservation.room}</div>
                                        <div><strong>{t.checkIn}:</strong> {activeReservation.checkIn}</div>
                                        <div><strong>{t.checkOut}:</strong> {activeReservation.checkOut}</div>
                                        <div><strong>{t.nights}:</strong> {nights}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
                                        {t.billingAddress}
                                    </h3>
                                    <div style={{ fontSize: '0.95rem', color: '#2d3748', lineHeight: 1.8 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{billing.name}</div>
                                        <div>{billing.address}</div>
                                        <div>{billing.zip} {billing.city}</div>
                                        <div>{billing.country}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Charges Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ background: '#f7fafc', borderBottom: '2px solid #cbd5e0' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>{t.description}</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>{t.quantity}</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>{t.unitPrice}</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>{t.amount}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {folioChargesOnly.map((charge, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '0.75rem', color: '#2d3748' }}>{charge.description}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568' }}>1</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: '#4a5568' }}>{charge.amount.toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#2d3748' }}>{charge.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {folioPaymentsOnly.map((payment, idx) => (
                                        <tr key={`pay-${idx}`} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '0.75rem', color: '#2F855A' }}>{payment.description}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#2F855A' }}>1</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', color: '#2F855A' }}>-{payment.amount.toFixed(2)}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#2F855A' }}>-{payment.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div style={{ maxWidth: '400px', marginLeft: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#4a5568' }}>{t.subtotal}:</span>
                                    <span style={{ fontWeight: 600, color: '#2d3748' }}>{subtotal.toFixed(2)} {t.currency}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#4a5568' }}>{t.tax} ({formatVATRate(taxRate)}):</span>
                                    <span style={{ fontWeight: 600, color: '#2d3748' }}>{taxAmount.toFixed(2)} {t.currency}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#4a5568' }}>{t.total}:</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2d3748' }}>{totalWithTax.toFixed(2)} {t.currency}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                                    <span style={{ color: '#2F855A' }}>{t.payment}:</span>
                                    <span style={{ fontWeight: 600, color: '#2F855A' }}>-{folioTotalPayments.toFixed(2)} {t.currency}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', background: folioBalance > 0 ? '#fff5f5' : '#f0fff4', marginTop: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem', borderRadius: '6px' }}>
                                    <span style={{ fontWeight: 700, color: folioBalance > 0 ? '#c53030' : '#2F855A', fontSize: '1.1rem' }}>{t.balance}:</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.5rem', color: folioBalance > 0 ? '#c53030' : '#2F855A' }}>{folioBalance.toFixed(2)} {t.currency}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                                <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e', textAlign: 'center' }}>
                                        ⚠️ {t.notOfficialInvoice}
                                    </p>
                                </div>
                                <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.9rem', margin: 0 }}>
                                    {t.thankYou}
                                </p>
                                <p style={{ textAlign: 'center', color: '#a0aec0', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    {t.footerNote}
                                </p>
                            </div>
                        </div>
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

            {renderLanguageModal()}
            {renderInvoicePreview()}
            {renderAddChargeModal()}

            <header className="view-header" style={{ marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <span style={{ cursor: 'pointer' }} onClick={onBack}>Reservations</span>
                            <span style={{ margin: '0 0.5rem' }}>/</span>
                            <span style={{ color: '#2d3748', fontWeight: 600 }}>{activeReservation.id}</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            paddingLeft: '1rem',
                            borderLeft: '2px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3182ce" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span style={{ color: '#4a5568', fontWeight: 500 }}>
                                    {new Date(activeReservation.arrival).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <span style={{ color: '#cbd5e0' }}>→</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3182ce" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span style={{ color: '#4a5568', fontWeight: 500 }}>
                                    {new Date(activeReservation.departure).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <span style={{
                                background: '#f7fafc',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#4a5568'
                            }}>
                                {Math.ceil((new Date(activeReservation.departure) - new Date(activeReservation.arrival)) / (1000 * 60 * 60 * 24))} nights
                            </span>
                        </div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', margin: 0 }}>Folios</h3>
                            <button className="btn" onClick={handleAddFolio} style={{ background: '#3182ce', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                + Add Folio
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            {/* Total Balance Display */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Total Outstanding</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: balance > 0 ? '#c53030' : '#2F855A' }}>
                                    {balance.toFixed(2)} CHF
                                </div>
                            </div>
                        </div>
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: '#2d3748' }}>{folio.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>#{folio.id}</div>
                                            </div>
                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => setOpenDocumentsForFolio(openDocumentsForFolio === folio.id ? null : folio.id)}
                                                    className="btn"
                                                    style={{
                                                        background: 'white',
                                                        border: '1px solid #cbd5e1',
                                                        padding: '0.4rem 0.8rem',
                                                        fontSize: '0.8rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    </svg>
                                                    Documents
                                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                                                        <path d="M6 9L1 4h10z" />
                                                    </svg>
                                                </button>

                                                {openDocumentsForFolio === folio.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: '100%',
                                                        marginTop: '0.5rem',
                                                        background: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                                        zIndex: 1000,
                                                        minWidth: '200px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div
                                                            onClick={() => handleCloseToCredit(folio.id)}
                                                            className="hover-bg-gray"
                                                            style={{
                                                                padding: '0.65rem 1rem',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #f7fafc',
                                                                fontSize: '0.85rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.65rem'
                                                            }}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                                                <line x1="2" y1="10" x2="22" y2="10"></line>
                                                            </svg>
                                                            Close to Credit
                                                        </div>
                                                        <div
                                                            onClick={() => handlePrintPreInvoice(folio.id)}
                                                            className="hover-bg-gray"
                                                            style={{
                                                                padding: '0.65rem 1rem',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #f7fafc',
                                                                fontSize: '0.85rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.65rem'
                                                            }}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                                <rect x="6" y="14" width="12" height="8"></rect>
                                                            </svg>
                                                            Print Pre-Invoice
                                                        </div>
                                                        <div
                                                            onClick={() => handleEarlyCheckout(folio.id)}
                                                            className="hover-bg-gray"
                                                            style={{
                                                                padding: '0.65rem 1rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.65rem',
                                                                color: '#2F855A'
                                                            }}
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                                <polyline points="16 17 21 12 16 7"></polyline>
                                                                <line x1="21" y1="12" x2="9" y2="12"></line>
                                                            </svg>
                                                            Early Check-out
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
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
