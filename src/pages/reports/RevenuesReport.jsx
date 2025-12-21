import React from 'react';

export default function RevenuesReport() {
    return (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ color: '#718096' }}>Jezebel Hotel Rhein</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#FED7D7', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Test</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Reports
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        <span style={{ background: '#E9D8FD', padding: '2px 4px', borderRadius: '4px', color: 'black' }}>Revenues</span>
                    </div>
                    <h1>Revenues</h1>
                </div>
            </header>
            <div style={{ padding: '4rem', textAlign: 'center', color: '#718096', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🏗️</span>
                <h2 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>Work in Progress</h2>
                <p>The Revenues report module is currently being built.</p>
            </div>
        </main>
    );
}
