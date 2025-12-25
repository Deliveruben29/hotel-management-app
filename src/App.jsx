import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ReservationsNew from './pages/ReservationsNew';
import Inventory from './pages/Inventory';
import RoomRack from './pages/RoomRack';
import Housekeeping from './pages/Housekeeping';
import Rates from './pages/Rates';
import Availability from './pages/Availability';
import Services from './pages/Services';
import Companies from './pages/Companies';
import Reports from './pages/Reports';
import GeneralManagerReport from './pages/reports/GeneralManagerReport';
import RevenuesReport from './pages/reports/RevenuesReport';
import OrderedServicesReport from './pages/reports/OrderedServicesReport';
import GuestsStatisticsReport from './pages/reports/GuestStatisticsReport';
import Finance from './pages/Finance';
import { ReservationProvider } from './context/ReservationContext';

function App() {
  return (
    <MainLayout>
      <ReservationProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reservations" element={<ReservationsNew />} />
          <Route path="/rack" element={<RoomRack />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/services" element={<Services />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/finance" element={<Finance />} />

          {/* Reports Routes */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/overview" element={<Reports />} />
          <Route path="/reports/gm" element={<GeneralManagerReport />} />
          <Route path="/reports/revenues" element={<RevenuesReport />} />
          <Route path="/reports/services" element={<OrderedServicesReport />} />
          <Route path="/reports/guests" element={<GuestsStatisticsReport />} />

          {/* Fallback for not implemented or 404 */}
          <Route path="/audit" element={<Placeholder title="Audit / Logs" />} />
          <Route path="/settings" element={<Placeholder title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ReservationProvider>
    </MainLayout>
  );
}

// Simple placeholder component for pages under construction
const Placeholder = ({ title }) => (
  <div style={{
    padding: '4rem',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    border: '2px dashed #cbd5e1',
    borderRadius: 'var(--radius-lg)',
    margin: '2rem'
  }}>
    <h3>{title} Module</h3>
    <p>Under construction. This feature will be available soon.</p>
  </div>
);

export default App;
