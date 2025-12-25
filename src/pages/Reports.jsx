import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_RESERVATIONS } from '../data/mockData';

export default function Reports() {
    const navigate = useNavigate();
    // Current date logic for defaults
    const todayDate = new Date('2025-12-25'); // Simulating Today
    const todayStr = todayDate.toLocaleDateString('en-GB'); // DD/MM/YYYY

    // 1. Calculate Room Nights for Current Month (Dec 2025)
    // Simplified: Just counting nights falling in this month for all reservations
    const currentMonthStats = useMemo(() => {
        let nights = 0;
        const currentMonth = 11; // Dec (0-indexed)
        const currentYear = 2025;

        MOCK_RESERVATIONS.forEach(res => {
            if (res.status === 'cancelled') return;

            const start = new Date(res.arrival);
            const end = new Date(res.departure);

            // Iterate days
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    nights++;
                }
            }
        });
        return { nights };
    }, []);

    // 2. Calculate In-House Stats (Emergency Report)
    const inHouseStats = useMemo(() => {
        let adults = 0;
        let children = 0; // Mock data doesn't explicitly allow children yet, assuming 0 or random for demo
        let count = 0;

        MOCK_RESERVATIONS.forEach(res => {
            if (res.status === 'checked_in') {
                count++;
                adults += res.pax;
                // children += res.children || 0; 
            }
        });

        return { count, adults, children };
    }, []);


    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    {/* Breadcrumbs simulation */}
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Test</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Reports
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#FEFCBF', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Overview</span>
                    </div>
                    <h1>Reports</h1>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginTop: '2rem'
            }}>

                {/* Cashier Report */}
                <ReportCard
                    title="Cashier report"
                    icon="🧾"
                    action="Export PDF"
                >
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Cashier name*</label>
                            <input type="text" defaultValue="Jezebel Fuentes" style={inputStyle} />
                        </div>
                        <div style={{ width: '120px' }}>
                            <label style={labelStyle}>Cash counted</label>
                            <div style={{ ...inputStyle, background: '#f7fafc', display: 'flex', justifyContent: 'space-between' }}>
                                <span></span><span>CHF</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>From*</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" defaultValue={todayStr} style={inputStyle} />
                                <span style={iconStyle}>📅</span>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Time*</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" defaultValue="00:00" style={inputStyle} />
                                <span style={iconStyle}>🕒</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>To*</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" defaultValue={todayStr} style={inputStyle} />
                                <span style={iconStyle}>📅</span>
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Time*</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" defaultValue="23:59" style={inputStyle} />
                                <span style={iconStyle}>🕒</span>
                            </div>
                        </div>
                    </div>
                </ReportCard>

                {/* Room Nights */}
                <ReportCard title="Room nights" icon="🛌">
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ fontSize: '4rem', color: '#2d3748', lineHeight: 1 }}>{currentMonthStats.nights}</div>
                        <div style={{ color: '#718096', fontSize: '0.9rem' }}>room nights consumed</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button style={navBtnStyle}>&lt;</button>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Month*</label>
                            <select style={inputStyle}><option>December</option></select>
                        </div>
                        <div style={{ width: '80px' }}>
                            <label style={labelStyle}>Year*</label>
                            <input type="text" defaultValue="2025" style={inputStyle} />
                        </div>
                        <button style={navBtnStyle}>&gt;</button>
                    </div>
                </ReportCard>

                {/* Company VAT Report */}
                <ReportCard title="Company VAT report" icon="💼" action="Export CSV" actionDull>
                    <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '1rem' }}>
                        All invoices created for companies, with:
                    </p>
                    <ul style={{ fontSize: '0.85rem', color: '#4a5568', paddingLeft: '1.2rem', marginBottom: '2.5rem' }}>
                        <li>Company code and name</li>
                        <li>Total gross amount</li>
                        <li>VAT breakdown</li>
                    </ul>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button style={navBtnStyle}>&lt;</button>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Month*</label>
                            <select style={inputStyle}><option>December</option></select>
                        </div>
                        <div style={{ width: '80px' }}>
                            <label style={labelStyle}>Year*</label>
                            <input type="text" defaultValue="2025" style={inputStyle} />
                        </div>
                        <button style={navBtnStyle}>&gt;</button>
                    </div>
                </ReportCard>

                {/* Emergency Report */}
                <ReportCard title="Emergency report" icon="🏃" action="Export Emergency Report">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        Access the details of all guests that are currently in-house. You can find the details like guest name, phone number (if available) along with the number of adults and children in the reservation, and the unit occupied, etc.
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d3748', marginBottom: '0.5rem' }}>
                        Current number of in-house guest
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', padding: '1rem 0' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{inHouseStats.adults + inHouseStats.children}</div>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Total</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{inHouseStats.adults}</div>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Adults</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.2rem' }}>{inHouseStats.children}</div>
                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>Children</div>
                        </div>
                    </div>
                </ReportCard>

                {/* General Manager Report */}
                <ReportCard
                    title="General manager report"
                    icon="📈"
                    action="Check GM report"
                    onAction={() => navigate('/reports/gm')}
                    actionDull
                >
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        Analyse key performance indicators for your property such as occupancy and RevPAR.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        Filter the results to show only data for a certain part of your business. You can, for example, exclude day-use business or complimentary rate plans.
                    </p>
                </ReportCard>

                {/* Revenues Reports */}
                <ReportCard
                    title="Revenues reports"
                    icon="📊"
                    action="Go to report"
                    onAction={() => navigate('/reports/revenues')}
                    actionDull
                >
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        Get an overview of your hotel's revenues.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        See gross and net revenues for any time period, broken down by type and VAT.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3182ce', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <span>📘</span> Introduction to Accounting guide
                    </div>
                </ReportCard>

                {/* Financial Reports */}
                <ReportCard
                    title="Financial reports"
                    icon="💵"
                    action="Accounting"
                    onAction={() => navigate('/finance')}
                    actionDull
                >
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        For full financial reports, use the export functionality in the accounting section.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        Get a full log of all your transactions, or aggregated reports by day, week or month.
                    </p>
                </ReportCard>

            </div>
        </main>
    );
}

const ReportCard = ({ title, icon, action, actionDull, onAction, children }) => (
    <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid rgba(0,0,0,0.02)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#a0aec0' }}>{icon}</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#4a5568', margin: 0 }}>{title}</h3>
        </div>
        <div style={{ flex: 1 }}>
            {children}
        </div>
        {action && (
            <button
                className={actionDull ? 'btn-dull' : 'btn-apaleo'}
                style={{ width: '100%', marginTop: '1.5rem' }}
                onClick={onAction}
            >
                {action}
            </button>
        )}
        <style>{`
            .btn-apaleo {
                background-color: #F6AD55; 
                color: white; 
                border: none;
                padding: 0.6rem;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            .btn-apaleo:hover {
                background-color: #ed8936;
            }
            .btn-dull {
                background-color: #F6AD55; 
                color: white; 
                border: none;
                padding: 0.6rem;
                border-radius: 4px;
                font-weight: 600;
                cursor: pointer;
                opacity: 0.9;
            }
        `}</style>
    </div>
);

const labelStyle = {
    fontSize: '0.75rem',
    color: '#718096',
    display: 'block',
    marginBottom: '4px',
    fontWeight: 500
};

const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.9rem',
    color: '#2d3748',
    outline: 'none',
    background: 'white'
};

const navBtnStyle = {
    background: 'white',
    border: 'none',
    color: '#718096',
    cursor: 'pointer',
    padding: '0.5rem',
    fontWeight: 600
};

const iconStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    opacity: 0.5,
    pointerEvents: 'none'
};
