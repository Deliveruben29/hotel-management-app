import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Inventory from './pages/Inventory';
import RoomRack from './pages/RoomRack';
import Housekeeping from './pages/Housekeeping';
import Rates from './pages/Rates';
import Availability from './pages/Availability';
import Services from './pages/Services';
import Finance from './pages/Finance';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Reservations':
        return <Reservations />;
      case 'Inventory':
        return <Inventory />;
      case 'Room Rack': // Must match exact string from sidebar
      case 'Rack':
        return <RoomRack />;
      case 'Housekeeping':
        return <Housekeeping />;
      case 'Rates':
        return <Rates />;
      case 'Services':
        return <Services />;
      case 'Availability':
        return <Availability />;
      case 'Finance':
        return <Finance />;
      default:
        return (
          <div style={{
            padding: '4rem',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            border: '2px dashed #cbd5e1',
            borderRadius: 'var(--radius-lg)',
            margin: '2rem'
          }}>
            <h3>{activeTab} Module</h3>
            <p>Under construction. This feature will be available soon.</p>
          </div>
        );
    }
  };

  return (
    <MainLayout activeTab={activeTab} onNavigate={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
