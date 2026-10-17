import React from 'react';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { PatientView } from './components/patient/PatientView';
import { LabPortal } from './components/lab/LabPortal';
import { CollectorDashboard } from './components/collector/CollectorDashboard';
import { AdminConsole } from './components/admin/AdminConsole';
import { ShieldCheck, Activity, Bell, X } from 'lucide-react';

const AppContent = () => {
  const { role, notifications } = useMarketplace();

  return (
    <div className="app-container">
      {/* Persistent Role Switcher Navigation */}
      <RoleSwitcher />

      {/* Main View Area based on Role */}
      <main className="main-content">
        {role === 'patient' && <PatientView />}
        {role === 'lab' && <LabPortal />}
        {role === 'collector' && <CollectorDashboard />}
        {role === 'admin' && <AdminConsole />}
      </main>

      {/* Footer */}
      <footer style={{ 
        background: '#ffffff', 
        borderTop: '1px solid #e2e8f0', 
        padding: '32px 20px', 
        marginTop: 'auto',
        color: '#64748b',
        fontSize: '0.82rem'
      }}>
        <div style={{ 
          maxWidth: '1240px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#0284c7" />
            <strong style={{ color: '#0f172a' }}>DiagMarket Coordination Layer</strong>
            <span>• Verified Multi-Lab Diagnostic Network</span>
          </div>

          <div>
            Built strictly to MVP Specification: SEARCH → COMPARE → CHOOSE → BOOK → COLLECT → REPORT
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>NABL Certified Diagnostic Providers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <MarketplaceProvider>
      <AppContent />
    </MarketplaceProvider>
  );
}
