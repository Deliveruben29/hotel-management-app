import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import { COUNTRIES } from '../data/mockData';

export default function PropertyManagement({ onClose }) {
    const { properties, activeProperty, addProperty, updateProperty, deleteProperty } = useProperty();
    const [editingProperty, setEditingProperty] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        taxId: '',
        website: ''
    });

    const handleEdit = (property) => {
        setEditingProperty(property);
        setFormData(property);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProperty) {
            updateProperty(editingProperty.id, formData);
        } else {
            addProperty(formData);
        }
        // Reset form
        setFormData({
            name: '',
            country: '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            email: '',
            taxId: '',
            website: ''
        });
        setEditingProperty(null);
    };

    const handleDelete = (propertyId) => {
        if (confirm('Are you sure you want to delete this property?')) {
            deleteProperty(propertyId);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: '',
            country: '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            email: '',
            taxId: '',
            website: ''
        });
        setEditingProperty(null);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '8px',
                maxWidth: '1200px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    background: 'white',
                    zIndex: 1
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#2d3748' }}>
                        Property Management
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#718096',
                            padding: '0.5rem'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
                    {/* Property Form */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1.5rem' }}>
                            {editingProperty ? 'Edit Property' : 'Add New Property'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Property Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="e.g., Jezebel Hotel Rhein"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Country *
                                    </label>
                                    <select
                                        required
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="">Select country...</option>
                                        {COUNTRIES.map(country => (
                                            <option key={country.code} value={country.name}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="Street address"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                            Postal Code *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.postalCode}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="+41 XX XXX XX XX"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="info@property.com"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Tax ID / VAT Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="CHE-123.456.789"
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' }}>
                                        Website
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.95rem'
                                        }}
                                        placeholder="www.property.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    className="btn"
                                    style={{ background: '#3182ce', color: 'white', flex: 1 }}
                                >
                                    {editingProperty ? 'Update Property' : 'Add Property'}
                                </button>
                                {editingProperty && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn"
                                        style={{ background: 'white', border: '1px solid #cbd5e1' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Properties List */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', marginBottom: '1.5rem' }}>
                            Existing Properties ({properties.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {properties.map(property => (
                                <div
                                    key={property.id}
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        padding: '1rem',
                                        background: activeProperty?.id === property.id ? '#f0f9ff' : 'white'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#2d3748', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {property.name}
                                                {activeProperty?.id === property.id && (
                                                    <span style={{
                                                        background: '#3182ce',
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        padding: '0.15rem 0.5rem',
                                                        borderRadius: '12px',
                                                        fontWeight: 600
                                                    }}>
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                                                {property.id}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(property)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#3182ce',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Edit
                                            </button>
                                            {properties.length > 1 && (
                                                <button
                                                    onClick={() => handleDelete(property.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#e53e3e',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: 1.6 }}>
                                        <div>{property.address}</div>
                                        <div>{property.postalCode} {property.city}</div>
                                        <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{property.country}</div>
                                        {property.phone && <div style={{ marginTop: '0.5rem' }}>📞 {property.phone}</div>}
                                        {property.email && <div>📧 {property.email}</div>}
                                        {property.taxId && <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#718096' }}>Tax ID: {property.taxId}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
