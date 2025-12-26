import React, { useState } from 'react';
import { MOCK_COMPANIES } from '../data/mockData';

export default function Companies() {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = MOCK_COMPANIES.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CreateCompanyView = () => (
        <div className="dashboard-view fade-in">
            <header className="view-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '0.5rem', fontWeight: 500 }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => setView('list')}>Companies</span>
                        <span style={{ margin: '0 0.5rem' }}>/</span>
                        Create company profile
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 400, color: '#2d3748' }}>Create company profile</h1>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Company Information */}
                <Section title="Company information">
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 300px) 1fr 1fr', gap: '1.5rem' }}>
                        <Input label="Code*" />
                        <Input label="Company name*" />
                        <Input label="Tax ID" />
                    </div>
                </Section>

                {/* Billing Address */}
                <Section title="Billing address">
                    <div style={{ marginBottom: '1rem' }}>
                        <Select label="Country*" options={['Switzerland', 'Germany', 'USA']} />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input label="Address line 1*" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input label="Address line 2" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input label="Postal code*" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input label="City*" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input label="Invoicing email" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input label="Phone" />
                        </div>
                    </div>
                </Section>

                {/* Check out on account receivables */}
                <Section title="Check out on account receivables">
                    <Checkbox label="The company can check out on account receivables" />
                </Section>

                {/* Rate plans and corporate codes */}
                <Section title="Rate plans and corporate codes">
                    <p style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '1rem' }}>
                        Choose which rate plans this company can book and under which code. The corporate code can only contain letters, numbers, _, - and has to be between 3-20 characters long.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '300px' }}>
                            <input type="text" placeholder="Select rate plan to add" style={{ ...inputStyle, padding: '0.6rem 0.75rem' }} />
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: '#a0aec0', fontWeight: 500, fontSize: '0.9rem', cursor: 'not-allowed' }}>
                            + Add rate plan
                        </button>
                    </div>
                </Section>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-apaleo-primary">Save</button>
                    <button className="btn" style={{ background: 'transparent', color: '#4a5568', fontWeight: 500 }} onClick={() => setView('list')}>Cancel</button>
                </div>

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
            `}</style>
        </div>
    );

    return view === 'create' ? <CreateCompanyView /> : (
        <main className="dashboard-view fade-in">
            <header className="view-header">
                <div>
                    <h1>Companies</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn" style={{ background: 'white', color: '#F6AD55', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }} onClick={() => setView('create')}>
                        <span>+</span> New company profile
                    </button>
                </div>
            </header>

            {/* Toolbar */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '250px' }}>
                    <input
                        type="text"
                        placeholder="Jump to company (by code)→"
                        style={{ ...inputStyle, paddingRight: '2rem' }}
                    />
                </div>
                <div style={{ position: 'relative', width: '350px' }}>
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '10px',
                        fontSize: '0.75rem',
                        color: '#2d3748',
                        background: 'white',
                        padding: '0 4px',
                        zIndex: 1
                    }}>Search by name</div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ ...inputStyle, border: '2px solid #2b6cb0', paddingLeft: '0.8rem' }}
                    />
                </div>

                <button className="btn" style={{ background: 'transparent', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.2rem' }}>⇩</span> Export
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#718096', fontSize: '0.75rem', textAlign: 'left' }}>
                            <th style={headerStyle}>Name</th>
                            <th style={headerStyle}>Address</th>
                            <th style={headerStyle}>Rate plans</th>
                            <th style={headerStyle}>AR invoice</th>
                            <th style={headerStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map(company => (
                            <tr key={company.id} style={{ borderBottom: '1px solid #edf2f7' }} className="table-row-hover">
                                <td style={{ ...cellStyle, padding: '1rem' }}>
                                    <div style={{ fontWeight: 500, color: '#2d3748' }}>{company.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{company.code}</div>
                                </td>
                                <td style={cellStyle}>{company.address}</td>
                                <td style={cellStyle}>
                                    {company.ratePlans.length > 0 ? company.ratePlans.join(', ') : ''}
                                </td>
                                <td style={cellStyle}>
                                    {company.arInvoice && <span style={{ color: '#2d3748', fontSize: '1.1rem' }}>✓</span>}
                                </td>
                                <td style={{ ...cellStyle, textAlign: 'right', minWidth: '80px' }}>
                                    <span style={{ cursor: 'pointer', marginRight: '1rem', fontSize: '1.2rem', color: '#4a5568' }}>⋮</span>
                                    <span style={{ cursor: 'pointer', color: '#4a5568' }}>›</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Visual Only) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem', padding: '1rem', fontSize: '0.85rem', color: '#718096' }}>
                <span style={{ marginRight: '1rem' }}>Page: </span>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.5rem', marginRight: '0.5rem', background: 'white' }}>1</div>
                <span style={{ marginRight: '1rem' }}>of 1</span>

                <span style={{ marginRight: '1rem' }}>Items per page: </span>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.2rem 0.5rem', marginRight: '1rem', background: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    20 <span>▼</span>
                </div>

                <span style={{ marginRight: '1rem' }}>1 - {filteredCompanies.length} of {filteredCompanies.length}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ cursor: 'pointer', opacity: 0.5 }}>|&lt;</span>
                    <span style={{ cursor: 'pointer', opacity: 0.5 }}>&lt;</span>
                    <span style={{ cursor: 'pointer', opacity: 0.5 }}>&gt;</span>
                    <span style={{ cursor: 'pointer', opacity: 0.5 }}>&gt;|</span>
                </div>
            </div>

            <style>{`
                 .table-row-hover:hover {
                    background-color: #f7fafc;
                }
            `}</style>
        </main>
    );
}

// Sub-components
const Section = ({ title, children }) => (
    <div style={{ paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d3748', marginBottom: '1rem' }}>{title}</h3>
        {children}
    </div>
);

const Input = ({ label }) => (
    <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                top: '-9px',
                left: '10px',
                fontSize: '0.75rem',
                color: '#2d3748',
                background: 'white',
                padding: '0 4px',
                zIndex: 1,
                lineHeight: 1
            }}>{label}</div>
            <input type="text" style={inputStyle} />
        </div>
    </div>
);

const Select = ({ label, options }) => (
    <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                top: '-9px',
                left: '10px',
                fontSize: '0.75rem',
                color: '#2d3748',
                background: 'white',
                padding: '0 4px',
                zIndex: 1,
                lineHeight: 1
            }}>{label}</div>
            <select style={{ ...inputStyle, appearance: 'none' }}>
                <option value="" disabled selected></option>
                {options.map((o, i) => <option key={i}>{o}</option>)}
            </select>
        </div>
    </div>
);

const Checkbox = ({ label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type="checkbox" style={{ transform: 'scale(1.2)', marginLeft: '2px' }} />
        <span style={{ fontSize: '0.9rem', color: '#2d3748' }}>{label}</span>
    </div>
);

const inputStyle = {
    width: '100%',
    padding: '0.8rem 0.75rem', // Slightly taller for floating label feel
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.95rem',
    color: '#2d3748',
    outline: 'none',
    background: 'white'
};

const headerStyle = {
    padding: '0.75rem 1rem',
    fontWeight: 500,
    color: '#718096'
};

const cellStyle = {
    padding: '1rem',
    color: '#4a5568',
    verticalAlign: 'middle'
};
