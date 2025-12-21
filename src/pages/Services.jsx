import React, { useState } from 'react';
import { MOCK_SERVICES } from '../data/mockData';

export default function Services() {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [searchTerm, setSearchTerm] = useState('');

    const filteredServices = MOCK_SERVICES.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CreateServiceView = () => (
        <div className="fade-in">
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
                        <Input label="Code*" />
                    </div>
                </Section>

                {/* Translations */}
                <Section title="Translations">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <TranslationBlock lang="English" />
                        <TranslationBlock lang="German" />
                        <TranslationBlock lang="Italian" />
                    </div>
                </Section>

                {/* Availability */}
                <Section title="Availability">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>Define when the service is offered. You can select when the service is available on both, the moment of the stay and the day of the week.</p>

                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <Select label="When*" options={['Entire Stay']} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Select label="Offered days*" options={['Everyday']} />
                        </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>Whether the service is delivered and posted on the same business date as the accommodation, or on the next day.</p>
                    <Checkbox label="Delivered and posted on the next day" />
                </Section>

                {/* Service Limitations */}
                <Section title="Service Limitations">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem' }}>Define restrictions for selling this service.</p>
                    <Checkbox label="Set inventory or unit cap for this service." />
                </Section>

                {/* Distribution */}
                <Section title="Distribution">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>You can decide if you want to sell the service only within packages or you also want to sell it as an extra. If you sell it as an extra you need to select the channels the extra service should be visible at.</p>
                    <Select label="" placeholder="Booking channels" options={['Direct', 'Booking.com']} />
                </Section>

                {/* Pricing */}
                <Section title="Pricing">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>The default price of the service, used when included in a package or when sold as extra.</p>
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                        <Radio name="pricing" label="Per Room" />
                        <Radio name="pricing" label="Per Guest" checked />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', maxWidth: '400px' }}>
                        <div style={{ flex: 1 }}>
                            <Input label="Price per Guest*" suffix="CHF" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Select label="Delivered to" options={['All guests']} />
                        </div>
                    </div>
                </Section>

                {/* Accounting */}
                <Section title="Accounting configurations">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>📄 VAT change FAQs</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <Input label="From*" icon="📅" />
                        <Select label="Service type*" options={['Food & Beverages']} />
                        <Select label="VAT type*" options={['Normal - 8.1%']} />
                    </div>
                    <div style={{ marginTop: '1rem', color: '#F6AD55', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>+</span> Add new configuration
                    </div>
                </Section>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-apaleo-primary">Save</button>
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

                <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.2rem' }}>≡</span> Filter
                </button>
                <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.2rem' }}>⇩</span> Export
                </button>
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
                                <td style={cellStyle}>👤 {service.price.toFixed(2)} {service.currency}</td>
                                <td style={cellStyle}>{service.deliveredTo}</td>
                                <td style={cellStyle}>{service.vat}</td>
                                <td style={cellStyle}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {service.channels.map((ch, i) => (
                                            <span key={i} style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#4a5568' }}>{ch}</span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'right' }}>
                                    <span style={{ cursor: 'pointer', marginRight: '1rem', fontSize: '1.2rem' }}>⋮</span>
                                    <span style={{ cursor: 'pointer' }}>›</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

// Sub-components for Form
const Section = ({ title, children }) => (
    <div style={{ paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d3748', marginBottom: '1rem' }}>{title}</h3>
        {children}
    </div>
);

const Input = ({ label, suffix, icon }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={{ position: 'relative' }}>
            <input type="text" style={inputStyle} />
            {suffix && <span style={suffixStyle}>{suffix}</span>}
            {icon && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>{icon}</span>}
        </div>
    </div>
);

const Select = ({ label, options, placeholder }) => (
    <div style={{ marginBottom: '1rem' }}>
        {label && <label style={labelStyle}>{label}</label>}
        <select style={{ ...inputStyle, appearance: 'none' }}>
            {placeholder && <option>{placeholder}</option>}
            {options.map((o, i) => <option key={i}>{o}</option>)}
        </select>
    </div>
);

const TranslationBlock = ({ lang }) => (
    <div style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '4px' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem', color: '#4a5568' }}>{lang}</div>
        <Input label="Name*" />
        <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}></textarea>
        </div>
    </div>
);

const Checkbox = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
        <span style={{ fontSize: '0.9rem', color: '#2d3748' }}>{label}</span>
    </div>
);

const Radio = ({ name, label, checked }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="radio" name={name} defaultChecked={checked} style={{ transform: 'scale(1.2)', accentColor: '#F6AD55' }} />
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
