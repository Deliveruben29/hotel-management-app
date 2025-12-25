import React, { useState } from 'react';
import { useProperty } from '../../context/PropertyContext';
import PropertyManagement from '../PropertyManagement';

export default function TopHeader() {
    const { properties, activeProperty, switchProperty } = useProperty();
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showPropertyModal, setShowPropertyModal] = useState(false);

    return (
        <>
            <header className="top-header">
                {/* Property Selector */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                        style={{
                            background: '#2c3e50',
                            color: 'white',
                            border: 'none',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            minWidth: '220px'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span style={{ flex: 1, textAlign: 'left' }}>{activeProperty?.name || 'Select Property'}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 9L1 4h10z" />
                        </svg>
                    </button>

                    {showPropertyDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '0.5rem',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            minWidth: '280px',
                            overflow: 'hidden'
                        }}>
                            {properties.map(property => (
                                <div
                                    key={property.id}
                                    onClick={() => {
                                        switchProperty(property.id);
                                        setShowPropertyDropdown(false);
                                    }}
                                    className="hover-bg-gray"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #f7fafc',
                                        background: activeProperty?.id === property.id ? '#f0f9ff' : 'white'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: '0.25rem' }}>
                                        {property.name}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                                        {property.city}, {property.country}
                                    </div>
                                </div>
                            ))}
                            <div
                                onClick={() => {
                                    setShowPropertyModal(true);
                                    setShowPropertyDropdown(false);
                                }}
                                className="hover-bg-gray"
                                style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    color: '#3182ce',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                </svg>
                                Manage Properties
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', cursor: 'pointer', color: '#4a5568' }}>
                        <span style={{ fontSize: '1.25rem' }}>?</span>
                    </div>
                    <div style={{ position: 'relative', cursor: 'pointer', color: '#4a5568' }}>
                        <span style={{ fontSize: '1.25rem' }}>🛍</span>
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-8px',
                            background: '#e53e3e',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '0 4px',
                            borderRadius: '10px',
                            fontWeight: 600
                        }}>5</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#4a5568' }}>
                        <div className="avatar" style={{ background: 'transparent', border: '2px solid #cbd5e1', color: '#4a5568' }}>👤</div>
                    </div>
                </div>
            </header>

            {showPropertyModal && (
                <PropertyManagement onClose={() => setShowPropertyModal(false)} />
            )}
        </>
    );
}
