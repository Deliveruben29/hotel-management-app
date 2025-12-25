import React, { createContext, useContext, useState, useEffect } from 'react';

const PropertyContext = createContext();

// Mock initial properties
const INITIAL_PROPERTIES = [
    {
        id: 'PROP-001',
        name: 'Jezebel Hotel Rhein',
        country: 'Switzerland',
        address: 'Rheinstrasse 123',
        city: 'Basel',
        postalCode: '4001',
        phone: '+41 61 123 45 67',
        email: 'info@jezebelrhein.ch',
        taxId: 'CHE-123.456.789',
        website: 'www.jezebelrhein.ch',
        logo: null
    }
];

export const PropertyProvider = ({ children }) => {
    const [properties, setProperties] = useState(() => {
        const saved = localStorage.getItem('hotel_properties');
        return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    });

    const [activeProperty, setActiveProperty] = useState(() => {
        const saved = localStorage.getItem('active_property_id');
        const propertyId = saved || (properties.length > 0 ? properties[0].id : null);
        return properties.find(p => p.id === propertyId) || properties[0];
    });

    // Save properties to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('hotel_properties', JSON.stringify(properties));
    }, [properties]);

    // Save active property ID
    useEffect(() => {
        if (activeProperty) {
            localStorage.setItem('active_property_id', activeProperty.id);
        }
    }, [activeProperty]);

    const addProperty = (property) => {
        const newProperty = {
            ...property,
            id: `PROP-${String(properties.length + 1).padStart(3, '0')}`
        };
        setProperties([...properties, newProperty]);
        return newProperty;
    };

    const updateProperty = (propertyId, updates) => {
        setProperties(properties.map(p =>
            p.id === propertyId ? { ...p, ...updates } : p
        ));
        // If updating active property, update it too
        if (activeProperty?.id === propertyId) {
            setActiveProperty({ ...activeProperty, ...updates });
        }
    };

    const deleteProperty = (propertyId) => {
        const filtered = properties.filter(p => p.id !== propertyId);
        setProperties(filtered);
        // If deleting active property, switch to first available
        if (activeProperty?.id === propertyId && filtered.length > 0) {
            setActiveProperty(filtered[0]);
        }
    };

    const switchProperty = (propertyId) => {
        const property = properties.find(p => p.id === propertyId);
        if (property) {
            setActiveProperty(property);
        }
    };

    return (
        <PropertyContext.Provider value={{
            properties,
            activeProperty,
            addProperty,
            updateProperty,
            deleteProperty,
            switchProperty
        }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('useProperty must be used within PropertyProvider');
    }
    return context;
};
