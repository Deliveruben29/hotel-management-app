import React, { useState } from 'react';

export default function GeneralManagerReport() {
    const [viewType, setViewType] = useState('Aggregated'); // 'Aggregated' or 'Detailed'

    // Mock Data based on screenshots
    const occupancyData = [
        { label: 'House Count', day: 80, mtd: 1680, ytd: 28400 },
        { label: 'OOO', day: 0, mtd: 0, ytd: 0 },
        { label: 'Sold Units', day: 4, mtd: 4, ytd: 4 },
        { label: 'Unsold Units', day: 76, mtd: 1676, ytd: 28396 },
        { label: 'Occupancy', day: '5 %', mtd: '0.24 %', ytd: '0.01 %' },
        { label: 'Tentatively Blocked', day: 0, mtd: 0, ytd: 0 },
        { label: 'Definitely Blocked', day: 0, mtd: 0, ytd: 0 },
    ];

    const guestFlowData = [
        { label: 'Arrivals', day: 5, mtd: 5, ytd: 5 },
        { label: 'Departures', day: 0, mtd: 0, ytd: 0 },
        { label: 'No-shows', day: 0, mtd: 0, ytd: 0 },
        { label: 'Cancellations', day: 0, mtd: 0, ytd: 0 },
    ];

    const revenueData = [
        { label: 'Net Unit Revenues KPI', day: 625.9, mtd: 625.9, ytd: 625.9 },
        { label: 'Gross Unit Revenues KPI', day: 665, mtd: 665, ytd: 665 },
        { label: 'Gross Accommodation Revenues KPI', day: 280, mtd: 280, ytd: 280 },
        { label: 'Net Food & Beverages Revenues KPI', day: 559.67, mtd: 559.67, ytd: 559.67 },
        { label: 'Gross Food & Beverages Revenues KPI', day: 605, mtd: 605, ytd: 605 },
        { label: 'Net Other Revenues KPI', day: 42.09, mtd: 42.09, ytd: 42.09 },
        { label: 'Gross Other Revenues KPI', day: 45.5, mtd: 45.5, ytd: 45.5 },
        { label: 'Net ADR', day: 156.48, mtd: 156.48, ytd: 156.48 },
        { label: 'Gross ADR', day: 166.25, mtd: 166.25, ytd: 166.25 },
        { label: 'RevPAR', day: 7.82, mtd: 0.37, ytd: 0.02 },
    ];

    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    {/* Breadcrumbs */}
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Test</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Reports
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#E9D8FD', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>General manager</span>
                    </div>
                    <h1>General manager report</h1>
                </div>
            </header>

            {/* Toolbar */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.2rem' }}>⇩</span> Export
                </button>
                <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.2rem' }}>≡</span> Filter
                </button>
            </div>

            {/* Date Pill */}
            <div style={{ marginBottom: '2rem' }}>
                <span style={{ background: '#edf2f7', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568' }}>
                    21/12/2025 📅
                </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '2rem', color: '#4a5568', fontSize: '0.9rem', maxWidth: '900px', lineHeight: '1.5' }}>
                The general manager report shows you key performance indicators for your property like your occupancy and your RevPAR. You can filter the results to only show you data for a certain part of your business. For example, you can exclude day-use business or complimentary rate plans.

                <div style={{ marginTop: '1rem', fontWeight: 600 }}>How KPIs are calculated and why they differ from the revenue report:</div>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', color: '#4a5568' }}>
                    <li>only room revenues coming from reservations</li>
                    <li>forecast for definite blocks</li>
                    <li>excluding services and fees</li>
                    <li>excluding directly added charges and refunds</li>
                </ul>
            </div>

            {/* Toggle */}
            <div style={{ display: 'flex', marginBottom: '3rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '20px', width: 'fit-content' }}>
                <button
                    onClick={() => setViewType('Aggregated')}
                    style={{
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        border: 'none',
                        background: viewType === 'Aggregated' ? '#008080' : 'transparent', // Teal color from screenshot
                        color: viewType === 'Aggregated' ? 'white' : '#4a5568',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Aggregated
                </button>
                <button
                    onClick={() => setViewType('Detailed')}
                    style={{
                        padding: '0.5rem 1.5rem',
                        borderRadius: '20px',
                        border: 'none',
                        background: viewType === 'Detailed' ? '#008080' : 'transparent',
                        color: viewType === 'Detailed' ? 'white' : '#4a5568',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Detailed
                </button>
            </div>

            {/* Sections */}
            <ReportSection title="Occupancy" data={occupancyData} />
            <ReportSection title="Guest Flow" data={guestFlowData} />
            <ReportSection title="Revenue KPIs (CHF)" data={revenueData} />

            <style>{`
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                .report-table th, .report-table td {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #edf2f7;
                    color: #4a5568;
                }
                 .report-table th {
                    text-align: left;
                    font-weight: 500;
                    color: #a0aec0; /* Lighter header color */
                    font-size: 0.75rem;
                    text-transform: uppercase;
                }
                .report-table tr:last-child td {
                    border-bottom: none;
                }
            `}</style>
        </main>
    );
}

const ReportSection = ({ title, data }) => (
    <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#4a5568', marginBottom: '1.5rem' }}>{title}</h2>
        <table className="report-table">
            <thead>
                <tr>
                    <th style={{ width: '40%' }}></th>
                    <th style={{ width: '20%' }}>2025-12-21</th>
                    <th style={{ width: '20%' }}>MTD</th>
                    <th style={{ width: '20%' }}>YTD</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        <td style={{ fontWeight: 500 }}>{row.label}</td>
                        <td>{row.day}</td>
                        <td>{row.mtd}</td>
                        <td>{row.ytd}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
