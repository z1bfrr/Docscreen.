import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { 
  Activity, 
  User, 
  Building2, 
  Bike, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Bell
} from 'lucide-react';

export const RoleSwitcher = () => {
  const { 
    role, 
    setRole, 
    bookings, 
    collectors, 
    resetDemoData, 
    notifications 
  } = useMarketplace();

  // Active metrics for badges
  const patientActiveCount = bookings.filter(b => b.status !== 'COMPLETED').length;
  const labPendingCount = bookings.filter(b => b.status === 'SAMPLE_RECEIVED_BY_LAB' || b.status === 'PROCESSING').length;
  const collectorJobsCount = bookings.filter(b => b.status === 'COLLECTOR_SEARCHING').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <header className="role-bar-container">
      <div className="role-bar">
        {/* Brand */}
        <div className="role-brand">
          <div className="role-brand-icon">
            <Activity size={20} />
          </div>
          <div>
            <div className="role-brand-title">DiagMarket</div>
            <div className="role-brand-subtitle">Diagnostic Marketplace</div>
          </div>
        </div>

        {/* Persona Pill Switcher */}
        <div className="role-pill-group">
          <button
            onClick={() => setRole('patient')}
            className={`role-pill-btn ${role === 'patient' ? 'active' : ''}`}
            title="Search, compare laboratories and book diagnostic tests"
          >
            <User size={15} />
            <span>Patient</span>
            {patientActiveCount > 0 && (
              <span className="role-badge-count">{patientActiveCount}</span>
            )}
          </button>

          <button
            onClick={() => setRole('lab')}
            className={`role-pill-btn ${role === 'lab' ? 'active' : ''}`}
            title="Manage test catalog, receive samples, upload reports"
          >
            <Building2 size={15} />
            <span>Lab Portal</span>
            {labPendingCount > 0 && (
              <span className="role-badge-count" style={{ background: '#fef3c7', color: '#b45309' }}>
                {labPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setRole('collector')}
            className={`role-pill-btn ${role === 'collector' ? 'active' : ''}`}
            title="Accept nearby sample collection jobs & complete handovers"
          >
            <Bike size={15} />
            <span>Collector App</span>
            {collectorJobsCount > 0 && (
              <span className="role-badge-count" style={{ background: '#dcfce7', color: '#15803d' }}>
                {collectorJobsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setRole('admin')}
            className={`role-pill-btn ${role === 'admin' ? 'active' : ''}`}
            title="Configure platform fees, verify labs, monitor GMV"
          >
            <ShieldCheck size={15} />
            <span>Platform Admin</span>
          </button>
        </div>

        {/* Actions & Utilities */}
        <div className="role-actions">
          <button 
            onClick={resetDemoData}
            className="btn-demo-reset"
            title="Reset all test bookings and prices to clean demo state"
          >
            <RotateCcw size={13} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
