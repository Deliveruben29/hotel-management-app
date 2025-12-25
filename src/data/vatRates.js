// VAT rates by country for accommodation services
export const VAT_RATES = {
    'Switzerland': {
        accommodation: 0.038,  // 3.8% for accommodation
        standard: 0.077,        // 7.7% standard rate
        reduced: 0.025          // 2.5% reduced rate
    },
    'Germany': {
        accommodation: 0.07,    // 7% for accommodation
        standard: 0.19,
        reduced: 0.07
    },
    'Austria': {
        accommodation: 0.10,    // 10% for accommodation
        standard: 0.20,
        reduced: 0.10
    },
    'Italy': {
        accommodation: 0.10,    // 10% for accommodation
        standard: 0.22,
        reduced: 0.10
    },
    'France': {
        accommodation: 0.10,    // 10% for accommodation
        standard: 0.20,
        reduced: 0.055
    },
    'Spain': {
        accommodation: 0.10,    // 10% for accommodation
        standard: 0.21,
        reduced: 0.10
    },
    'United Kingdom': {
        accommodation: 0.20,    // 20% standard VAT
        standard: 0.20,
        reduced: 0.05
    },
    'Netherlands': {
        accommodation: 0.09,    // 9% for accommodation
        standard: 0.21,
        reduced: 0.09
    },
    'Belgium': {
        accommodation: 0.06,    // 6% for accommodation
        standard: 0.21,
        reduced: 0.06
    },
    'Portugal': {
        accommodation: 0.06,    // 6% for accommodation
        standard: 0.23,
        reduced: 0.06
    }
};

// Get VAT rate for a specific country and service type
export const getVATRate = (country, serviceType = 'accommodation') => {
    const countryRates = VAT_RATES[country];
    if (!countryRates) {
        // Default to standard rate if country not found
        return 0.10; // 10% default
    }
    return countryRates[serviceType] || countryRates.standard;
};

// Format VAT percentage for display
export const formatVATRate = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
};
