import React, { useState, useMemo } from 'react';
import { MOCK_RESERVATIONS, UNITS } from '../../data/mockData';

export default function GeneralManagerReport() {
    const [viewType, setViewType] = useState('Aggregated'); // 'Aggregated' or 'Detailed'

    // Simulation Date: "Today" is 2025-12-25
    const todayStr = '2025-12-25';
    const reportDate = new Date(todayStr);

    // --- Dynamic KPI Calculation ---
    const stats = useMemo(() => {
        const totalUnits = UNITS.length; // Max capacity

        let dayStats = { sold: 0, revenue: 0, arrivals: 0, departures: 0, noshows: 0, cancellations: 0 };
        let mtdStats = { sold: 0, revenue: 0, arrivals: 0, departures: 0, noshows: 0, cancellations: 0 };
        let ytdStats = { sold: 0, revenue: 0, arrivals: 0, departures: 0, noshows: 0, cancellations: 0 };

        const currentMonth = reportDate.getMonth();
        const currentYear = reportDate.getFullYear();

        MOCK_RESERVATIONS.forEach(res => {
            const arr = new Date(res.arrival);
            const dep = new Date(res.departure);
            const created = new Date(res.id === 'RES-5543' ? '2025-12-20' : '2025-01-01'); // Mock creation date

            // --- Day Stats (2025-12-25) ---
            // Is Occupied or Arriving Today?
            if (res.status === 'checked_in' || res.status === 'confirmed' || res.status === 'checked_out') {
                if (todayStr === res.arrival) dayStats.arrivals++;
                if (todayStr === res.departure) dayStats.departures++;

                // Occupancy & Revenue for 'Today'
                if (arr <= reportDate && dep > reportDate && res.status !== 'cancelled') {
                    dayStats.sold++;
                    dayStats.revenue += res.rate;
                }
            } else if (res.status === 'cancelled' && res.arrival === todayStr) {
                dayStats.cancellations++;
            }

            // --- MTD Stats (Dec 2025) ---
            if (res.status !== 'cancelled') {
                // Count nights in this month
                let loopDate = new Date(arr);
                while (loopDate < dep) {
                    if (loopDate.getMonth() === currentMonth && loopDate.getFullYear() === currentYear) {
                        mtdStats.sold++;
                        mtdStats.revenue += res.rate;
                    }
                    loopDate.setDate(loopDate.getDate() + 1);
                }

                if (arr.getMonth() === currentMonth && arr.getFullYear() === currentYear) mtdStats.arrivals++;
                if (dep.getMonth() === currentMonth && dep.getFullYear() === currentYear) mtdStats.departures++;
            }

            // --- YTD Stats (2025) ---
            if (res.status !== 'cancelled') {
                // Count nights in this year
                let loopDate = new Date(arr);
                while (loopDate < dep) {
                    if (loopDate.getFullYear() === currentYear) {
                        ytdStats.sold++;
                        ytdStats.revenue += res.rate;
                    }
                    loopDate.setDate(loopDate.getDate() + 1);
                }
                if (arr.getFullYear() === currentYear) ytdStats.arrivals++;
            }

        });

        return { totalUnits, day: dayStats, mtd: mtdStats, ytd: ytdStats };
    }, []);

    const occupancyData = [
        { label: 'House Count', day: stats.totalUnits, mtd: stats.totalUnits * 31, ytd: stats.totalUnits * 365 }, // Simplified capacity
        { label: 'Sold Units', day: stats.day.sold, mtd: stats.mtd.sold, ytd: stats.ytd.sold },
        {
            label: 'Occupancy',
            day: ((stats.day.sold / stats.totalUnits) * 100).toFixed(1) + ' %',
            mtd: ((stats.mtd.sold / (stats.totalUnits * 31)) * 100).toFixed(1) + ' %',
            ytd: ((stats.ytd.sold / (stats.totalUnits * 365)) * 100).toFixed(1) + ' %'
        },
    ];

    const guestFlowData = [
        { label: 'Arrivals', day: stats.day.arrivals, mtd: stats.mtd.arrivals, ytd: stats.ytd.arrivals },
        { label: 'Departures', day: stats.day.departures, mtd: stats.mtd.departures, ytd: stats.ytd.departures },
        { label: 'Cancellations', day: stats.day.cancellations, mtd: 0, ytd: 1 },
    ];

    const revenueData = [
        { label: 'Gross Accommodation Revenues', day: stats.day.revenue.toFixed(2), mtd: stats.mtd.revenue.toFixed(2), ytd: stats.ytd.revenue.toFixed(2) },
        {
            label: 'Net ADR',
            day: (stats.day.sold ? (stats.day.revenue / stats.day.sold) : 0).toFixed(2),
            mtd: (stats.mtd.sold ? (stats.mtd.revenue / stats.mtd.sold) : 0).toFixed(2),
            ytd: (stats.ytd.sold ? (stats.ytd.revenue / stats.ytd.sold) : 0).toFixed(2)
        },
        {
            label: 'RevPAR',
            day: (stats.day.revenue / stats.totalUnits).toFixed(2),
            mtd: (stats.mtd.revenue / (stats.totalUnits * 31)).toFixed(2),
            ytd: (stats.ytd.revenue / (stats.totalUnits * 365)).toFixed(2)
        },
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
