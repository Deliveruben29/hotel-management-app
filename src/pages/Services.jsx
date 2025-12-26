import React, { useState, useEffect } from 'react';
import { ServiceService } from '../services/serviceService';

export default function Services() {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'Food & Beverages',
        price: '',
        currency: 'CHF',
        deliveredTo: 'Each Adult',
        vatRate: '8.1% - Normal',
        channels: ['Direct']
    });

    // Load Services
    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const data = await ServiceService.getAll();
            setServices(data);
        } catch (error) {
            console.error("Error loading services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.code) {
            alert("Please fill in required fields (Name, Code, Price)");
            return;
        }

        try {
            await ServiceService.create({
                ...formData,
                price: parseFloat(formData.price),
            });
            await loadServices();
            setView('list');
            // Reset form
            setFormData({
                code: '',
                name: '',
                description: '',
                type: 'Food & Beverages',
                price: '',
                currency: 'CHF',
                deliveredTo: 'Each Adult',
                vatRate: '8.1% - Normal',
                channels: ['Direct']
            });
        } catch (error) {
            console.error("Error saving service", error);
            alert("Failed to save service");
        }
    };

    const filteredServices = services.filter(service =>
        (service.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CreateServiceView = () => (
        <div className="dashboard-view fade-in">
            <header className="view-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>Services</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Create new service
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>Create new service</h1>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Service Code */}
                <Section title="Service code">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>Service code cannot be updated later on.</p>
                    <div style={{ maxWidth: '300px' }}>
                        <Input
                            label="Code*"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                </Section>

                {/* Translations (Simplified to just English/Main Name for now) */}
                <Section title="General Information">
                    <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '4px', maxWidth: '600px' }}>
                        <Input
                            label="Name*"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <label style={labelStyle}>Description</label>
                            <textarea
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </Section>

                {/* Availability (Mock UI for now, not persisted fully in simplified schema) */}
                <Section title="Availability">
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <Select label="When*" options={['Entire Stay']} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Select label="Offered days*" options={['Everyday']} />
                        </div>
                    </div>
                    <Checkbox label="Delivered and posted on the next day" />
                </Section>

                {/* Distribution */}
                <Section title="Distribution">
                    <Select label="" placeholder="Booking channels" options={['Direct', 'Booking.com']} />
                </Section>

                {/* Pricing */}
                <Section title="Pricing">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', maxWidth: '400px' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Price*"
                                suffix="CHF"
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Select
                                label="Delivered to"
                                options={['Each Adult', 'Each guest', 'Unit']}
                                value={formData.deliveredTo}
                                onChange={e => setFormData({ ...formData, deliveredTo: e.target.value })}
                            />
                        </div>
                    </div>
                </Section>

                {/* Accounting */}
                <Section title="Accounting configurations">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <Input label="From*" icon="📅" placeholder="YYYY-MM-DD" />
                        <Select
                            label="Service type*"
                            options={['Food & Beverages', 'Other', 'Accommodation']}
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        />
                        <Select
                            label="VAT type*"
                            options={['8.1% - Normal', '3.8% - Reduced', '2.6% - Special']}
                            value={formData.vatRate}
                            onChange={e => setFormData({ ...formData, vatRate: e.target.value })}
                        />
                    </div>
                </Section>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-apaleo-primary" onClick={handleSave}>Save</button>
                    <button className="btn" style={{ background: 'transparent', color: '#4a5568', fontWeight: 500 }} onClick={() => setView('list')}>Cancel</button>
                </div>

            </div>
        </div>
    );

    // Default View: List
    return view === 'create' ? <CreateServiceView /> : (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Services</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'transparent', color: '#F6AD55', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setView('create')}>
                        <span>+</span> New service
                    </button>
                </div>
            </header>

            {/* Toolbar */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Jump to service (by code)→"
                        style={{ ...inputStyle, paddingRight: '2rem' }}
                    />
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search by service name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2rem' }}
                    />
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }}>🔍</span>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Service type</th>
                            <th style={headerStyle}>Default price</th>
                            <th style={headerStyle}>Delivered to</th>
                            <th style={headerStyle}>VAT</th>
                            <th style={headerStyle}>Booking channels</th>
                            <th style={headerStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredServices.map(service => (
                            <tr key={service.id} style={{ borderBottom: '1px solid #edf2f7' }} className="table-row-hover">
                                <td style={{ ...cellStyle, padding: '1rem' }}>
                                    <div style={{ fontWeight: 600, color: '#2d3748' }}>{service.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{service.code}</div>
                                </td>
                                <td style={cellStyle}>{service.type}</td>
                                <td style={cellStyle}>👤 {service.price?.toFixed(2)} {service.currency || 'CHF'}</td>
                                <td style={cellStyle}>{service.deliveredTo || service.delivered_to}</td>
                                <td style={cellStyle}>{service.vatRate || service.vat_rate}</td>
                                <td style={cellStyle}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {(service.channels || []).map((ch, i) => (
                                            <span key={i} style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#4a5568' }}>{ch}</span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>
                                    <span style={{ cursor: 'pointer', marginRight: '1rem', fontSize: '1.2rem' }}>⋮</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>Loading services...</div>}
                {!loading && filteredServices.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>No services found.</div>}
            </div>
            <style>{`
                .btn-apaleo-primary {
                    background-color: #F6AD55; 
                    color: white; 
                    border: none;
                    padding: 0.6rem 1.5rem;
                    border-radius: 4px;
                    font-weight: 600;
                    cursor: pointer;
                }
                 .table-row-hover:hover {
                    background-color: #f7fafc;
                }
            `}</style>
        </main>
    );
}

// Sub-components with Props support
const Section = ({ title, children }) => (
    <div style={{ paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d3748', marginBottom: '1rem' }}>{title}</h3>
        {children}
    </div>
);

const Input = ({ label, suffix, icon, type = "text", value, onChange, placeholder }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={{ position: 'relative' }}>
            <input
                type={type}
                style={inputStyle}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {suffix && <span style={suffixStyle}>{suffix}</span>}
            {icon && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>{icon}</span>}
        </div>
    </div>
);

const Select = ({ label, options, placeholder, value, onChange }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <label style={labelStyle}>{label}</label>}
        <select style={{ ...inputStyle, appearance: 'none' }} value={value} onChange={onChange}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
    </div>
);

const Checkbox = ({ label, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={checked} onChange={onChange} />
        <span style={{ fontSize: '0.9rem', color: '#2d3748' }}>{label}</span>
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
    padding: '0.6rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.95rem',
    color: '#2d3748',
    outline: 'none',
    background: 'white'
};

const headerStyle = {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    color: '#718096',
    fontWeight: 500
};

const cellStyle = {
    padding: '1rem',
    color: '#4a5568',
    verticalAlign: 'top'
};

const suffixStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#a0aec0',
    fontSize: '0.85rem',
    pointerEvents: 'none'
};
