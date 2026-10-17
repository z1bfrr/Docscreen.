import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Settings, 
  BarChart3, 
  Home,
  Plus,
  RefreshCw,
  Sliders,
  AlertCircle
} from 'lucide-react';

export const LabPortal = () => {
  const { 
    labs, 
    activeLabId, 
    setActiveLabId, 
    tests, 
    bookings, 
    updateLabOffering, 
    advanceBookingStatus, 
    uploadReport 
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState('orders'); // orders, tests, analytics, profile
  const [editingTestId, setEditingTestId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editTurnaround, setEditTurnaround] = useState('');
  
  // Report Upload modal state
  const [reportModalBooking, setReportModalBooking] = useState(null);
  const [reportDoctor, setReportDoctor] = useState('Dr. K. S. Sharma, MD (Pathology)');
  const [reportImpression, setReportImpression] = useState('All tested parameters are clinically verified and within biological reference limits.');
  const [paramValue1, setParamValue1] = useState('14.2');
  const [paramValue2, setParamValue2] = useState('7,200');

  const currentLab = labs.find(l => l.id === activeLabId) || labs[0];
  const labBookings = bookings.filter(b => b.labId === currentLab.id);

  // Metrics
  const totalRevenue = labBookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'PROCESSING')
    .reduce((sum, b) => sum + (b.pricing?.labPrice || 0), 0);
  const completedOrders = labBookings.filter(b => b.status === 'COMPLETED').length;
  const pendingOrders = labBookings.filter(b => b.status !== 'COMPLETED').length;

  const handleSaveOffering = (testId) => {
    updateLabOffering(currentLab.id, testId, {
      price: Number(editPrice),
      turnaroundHours: Number(editTurnaround)
    });
    setEditingTestId(null);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportModalBooking) return;

    uploadReport(reportModalBooking.id, {
      doctorName: reportDoctor,
      summary: reportImpression,
      parameters: [
        { name: 'Primary Diagnostic Parameter 1', value: paramValue1, unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'NORMAL' },
        { name: 'Primary Diagnostic Parameter 2', value: paramValue2, unit: 'cells/mcL', normalRange: '4,000 - 11,000', status: 'NORMAL' }
      ]
    });

    setReportModalBooking(null);
  };

  return (
    <div>
      {/* Lab Header & Switcher */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(to right, #ffffff, #f0fdfa)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: '#0d9488', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentLab.name}</h2>
                <span className="badge badge-verified">
                  <ShieldCheck size={12} /> {currentLab.accreditation}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {currentLab.address}, {currentLab.city} • Working Hours: {currentLab.operatingHours}
              </p>
            </div>
          </div>

          {/* Quick Lab Perspective Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Switch Lab Portal:</span>
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
              value={activeLabId}
              onChange={(e) => setActiveLabId(e.target.value)}
            >
              {labs.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Analytics Highlights Row (Section 29) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Platform Revenue
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Net Lab Payout (100% Guaranteed)</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Bookings
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {labBookings.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Across all test categories</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Pending In Accessioning
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {pendingOrders}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Requires action</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Reports Dispatched
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              {completedOrders}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Average TAT: 3.2 hrs</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('orders')}
        >
          <FileText size={16} />
          <span>Live Bookings & Accessioning ({labBookings.length})</span>
        </button>
        <button 
          className={`btn ${activeTab === 'tests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tests')}
        >
          <Sliders size={16} />
          <span>Manage Pricing & Catalog</span>
        </button>
      </div>

      {/* TAB 1: Live Bookings & Accessioning */}
      {activeTab === 'orders' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Incoming Orders & Sample Processing</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Samples routed to {currentLab.name}
            </span>
          </div>

          {labBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <p>No active orders for this laboratory at the moment.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Switch to the Patient view to book a test with {currentLab.name}!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {labBookings.map(order => (
                <div 
                  key={order.id} 
                  style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                    background: order.status === 'COMPLETED' ? '#f8fafc' : '#ffffff'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-primary">Order #{order.id}</span>
                      <span className={`badge ${order.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Barcode: <strong>{order.sampleBarcode}</strong>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '6px' }}>
                      {order.testName}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Patient: <strong>{order.patientName}</strong> ({order.patientPhone}) • {order.collectionMethod === 'HOME_COLLECTION' ? '🏠 Home Collection' : '🏢 Clinic Walk-in'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                        ₹{order.pricing.labPrice}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lab Payout</div>
                    </div>

                    {/* Status Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {order.status === 'SAMPLE_COLLECTED' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => advanceBookingStatus(order.id, 'SAMPLE_RECEIVED_BY_LAB', 'Sample received at accessioning desk')}
                        >
                          <CheckCircle2 size={14} color="#10b981" />
                          <span>Mark Sample Received</span>
                        </button>
                      )}

                      {order.status === 'SAMPLE_RECEIVED_BY_LAB' && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => advanceBookingStatus(order.id, 'PROCESSING', 'Sample loaded on auto-analyzer')}
                        >
                          <RefreshCw size={14} color="#0284c7" />
                          <span>Start Processing</span>
                        </button>
                      )}

                      {order.status === 'PROCESSING' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setReportModalBooking(order)}
                        >
                          <Upload size={14} />
                          <span>Upload / Approve Report</span>
                        </button>
                      )}

                      {order.status === 'COMPLETED' && (
                        <span className="badge badge-success" style={{ padding: '6px 12px' }}>
                          ✓ Report Published
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manage Pricing & Catalog (Section 29) */}
      {activeTab === 'tests' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Test Catalog & Dynamic Price Management</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Set competitive prices and turnaround times for your laboratory
              </p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 8px' }}>Test Name</th>
                <th style={{ padding: '10px 8px' }}>Your Price (₹)</th>
                <th style={{ padding: '10px 8px' }}>Turnaround (Hours)</th>
                <th style={{ padding: '10px 8px' }}>Home Collection</th>
                <th style={{ padding: '10px 8px' }}>Availability</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => {
                const offering = currentLab.testOfferings[test.id] || { price: 200, turnaroundHours: 6, available: true, homeCollection: true };
                const isEditing = editingTestId === test.id;

                return (
                  <tr key={test.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                      {test.name}
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>{test.category}</span>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: '90px', padding: '4px 8px' }}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      ) : (
                        <strong style={{ fontSize: '1rem', color: '#0f172a' }}>₹{offering.price}</strong>
                      )}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: '70px', padding: '4px 8px' }}
                          value={editTurnaround}
                          onChange={(e) => setEditTurnaround(e.target.value)}
                        />
                      ) : (
                        <span>~{offering.turnaroundHours} hrs</span>
                      )}
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <button
                        className={`badge ${offering.homeCollection ? 'badge-success' : 'badge-warning'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => updateLabOffering(currentLab.id, test.id, { homeCollection: !offering.homeCollection })}
                        title="Click to toggle home collection support"
                      >
                        {offering.homeCollection ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>

                    <td style={{ padding: '12px 8px' }}>
                      <button
                        className={`badge ${offering.available ? 'badge-primary' : 'badge-warning'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => updateLabOffering(currentLab.id, test.id, { available: !offering.available })}
                        title="Click to toggle test availability"
                      >
                        {offering.available ? 'Active' : 'Paused'}
                      </button>
                    </td>

                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSaveOffering(test.id)}
                          >
                            Save
                          </button>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingTestId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setEditingTestId(test.id);
                            setEditPrice(offering.price);
                            setEditTurnaround(offering.turnaroundHours);
                          }}
                        >
                          Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Upload / Verification Modal */}
      {reportModalBooking && (
        <div className="modal-overlay" onClick={() => setReportModalBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">Release Diagnostic Report</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Order #{reportModalBooking.id} — {reportModalBooking.testName}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setReportModalBooking(null)}>✕</button>
            </div>

            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label className="form-label">Signing Pathologist</label>
                <input 
                  className="form-input" 
                  value={reportDoctor} 
                  onChange={(e) => setReportDoctor(e.target.value)} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Primary Parameter 1 Value</label>
                  <input 
                    className="form-input" 
                    value={paramValue1} 
                    onChange={(e) => setParamValue1(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Parameter 2 Value</label>
                  <input 
                    className="form-input" 
                    value={paramValue2} 
                    onChange={(e) => setParamValue2(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Impression & Pathologist Notes</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  value={reportImpression} 
                  onChange={(e) => setReportImpression(e.target.value)} 
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px' }}
              >
                <CheckCircle2 size={18} />
                <span>Approve & Dispatch Report to Patient</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
