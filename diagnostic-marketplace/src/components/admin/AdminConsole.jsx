import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  ShieldCheck, 
  Settings, 
  DollarSign, 
  BarChart2, 
  Sliders, 
  Building2, 
  Bike, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export const AdminConsole = () => {
  const { 
    settings, 
    updateSettings, 
    labs, 
    setLabs, 
    collectors, 
    setCollectors, 
    tests, 
    setTests, 
    bookings 
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState('overview'); // overview, settings, labs, collectors, catalogue
  
  // Local fee inputs
  const [feeType, setFeeType] = useState(settings.platformFeeType);
  const [feeValue, setFeeValue] = useState(settings.platformFeeValue);
  const [colFee, setColFee] = useState(settings.defaultCollectionFee);

  // Local weights inputs
  const [wAvailability, setWAvailability] = useState(settings.rankingWeights.availability);
  const [wPrice, setWPrice] = useState(settings.rankingWeights.price);
  const [wDistance, setWDistance] = useState(settings.rankingWeights.distance);
  const [wTurnaround, setWTurnaround] = useState(settings.rankingWeights.turnaround);
  const [wRating, setWRating] = useState(settings.rankingWeights.rating);

  // Global Financial & Performance Metrics (Section 50)
  const totalGMV = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
  const totalPlatformFees = bookings.reduce((sum, b) => sum + (b.pricing?.platformFee || 0), 0);
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const verifiedLabsCount = labs.filter(l => l.isVerified).length;
  const onlineCollectorsCount = collectors.filter(c => c.isOnline).length;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      platformFeeType: feeType,
      platformFeeValue: Number(feeValue),
      defaultCollectionFee: Number(colFee),
      rankingWeights: {
        availability: Number(wAvailability),
        price: Number(wPrice),
        distance: Number(wDistance),
        turnaround: Number(wTurnaround),
        rating: Number(wRating)
      }
    });
    alert('Marketplace settings and ranking weights successfully updated!');
  };

  const toggleLabVerification = (labId) => {
    setLabs(prev => prev.map(l => {
      if (l.id === labId) return { ...l, isVerified: !l.isVerified };
      return l;
    }));
  };

  const toggleCollectorVerification = (collectorId) => {
    setCollectors(prev => prev.map(c => {
      if (c.id === collectorId) return { ...c, isVerified: !c.isVerified };
      return c;
    }));
  };

  return (
    <div>
      {/* Admin Header Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(to right, #0f172a, #1e293b)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.3)', color: '#38bdf8', border: '1px solid #0284c7' }}>
                Platform Operations Console
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>City: {settings.serviceCity}</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginTop: '6px' }}>
              DiagMarket Central Command
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Multi-sided network governance, automated phlebotomy routing, and configurable fee economics.
            </p>
          </div>
        </div>

        {/* Global Key Metrics (Section 50) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #334155'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total GMV</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>₹{totalGMV.toLocaleString()}</div>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Across all bookings</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Platform Revenue</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>₹{totalPlatformFees.toLocaleString()}</div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Take rate collected</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Bookings</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{bookings.length}</div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{completedCount} Completed</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Active Partner Labs</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fcd34d' }}>{verifiedLabsCount}</div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{labs.length} Enrolled</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Online Collectors</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{onlineCollectorsCount}</div>
            <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Ready for dispatch</span>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart2 size={16} />
          <span>Live Booking Stream ({bookings.length})</span>
        </button>

        <button 
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Sliders size={16} />
          <span>Marketplace Rules & Fees</span>
        </button>

        <button 
          className={`btn ${activeTab === 'labs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('labs')}
        >
          <Building2 size={16} />
          <span>Partner Laboratories ({labs.length})</span>
        </button>

        <button 
          className={`btn ${activeTab === 'collectors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('collectors')}
        >
          <Bike size={16} />
          <span>Phlebotomist Fleet ({collectors.length})</span>
        </button>
      </div>

      {/* TAB 1: Live Global Booking Stream */}
      {activeTab === 'overview' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Global Diagnostic Booking Stream</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Real-time orders across all diagnostic providers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map(b => (
              <div 
                key={b.id} 
                style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  padding: '16px',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-primary">{b.id}</span>
                    <span className={`badge ${b.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.slotDate} • {b.slotTime}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px' }}>
                    {b.testName}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    Patient: <strong>{b.patientName}</strong> • Lab: <strong>{b.labName}</strong> • Collector: {b.collectorName || 'Unassigned'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{b.pricing?.totalAmount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                    Platform Fee: ₹{b.pricing?.platformFee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Marketplace Settings & Ranking Weights (Section 13 & 25) */}
      {activeTab === 'settings' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Marketplace Fee & Algorithm Configuration</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
            Control consumer pricing models and tune the dynamic lab recommendation weights.
          </p>

          <form onSubmit={handleSaveSettings}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '28px'
            }}>
              {/* Fee Settings (Section 25) */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="#0284c7" />
                  <span>Monetization Model (Section 25)</span>
                </h4>

                <div className="form-group">
                  <label className="form-label">Platform Fee Model</label>
                  <select 
                    className="form-select"
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value)}
                  >
                    <option value="FIXED">Model B: Fixed Fee per Completed Booking (₹)</option>
                    <option value="PERCENTAGE">Model A: Commission Percentage (%)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Platform Fee Value ({feeType === 'FIXED' ? '₹' : '%'})</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={feeValue} 
                    onChange={(e) => setFeeValue(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Home Collection Fee (₹)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={colFee} 
                    onChange={(e) => setColFee(e.target.value)} 
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Credited toward phlebotomist travel and cold chain equipment
                  </span>
                </div>
              </div>

              {/* Ranking Weights (Section 13) */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="#0284c7" />
                  <span>Recommendation Algorithm Weights (Section 13)</span>
                </h4>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Slot Availability:</span>
                    <strong>{wAvailability}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={wAvailability} 
                    onChange={(e) => setWAvailability(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Competitive Price:</span>
                    <strong>{wPrice}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={wPrice} 
                    onChange={(e) => setWPrice(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Proximity Distance:</span>
                    <strong>{wDistance}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={wDistance} 
                    onChange={(e) => setWDistance(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Fast Turnaround Time:</span>
                    <strong>{wTurnaround}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={wTurnaround} 
                    onChange={(e) => setWTurnaround(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Patient Rating:</span>
                    <strong>{wRating}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={wRating} 
                    onChange={(e) => setWRating(e.target.value)} 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <CheckCircle2 size={16} />
              <span>Save & Apply Marketplace Rules</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Labs Registry (Section 28) */}
      {activeTab === 'labs' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Laboratory Verification & Registry</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 8px' }}>Lab Name</th>
                <th style={{ padding: '10px 8px' }}>Accreditation</th>
                <th style={{ padding: '10px 8px' }}>Rating</th>
                <th style={{ padding: '10px 8px' }}>Distance</th>
                <th style={{ padding: '10px 8px' }}>Verification Status</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {labs.map(lab => (
                <tr key={lab.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{lab.name}</td>
                  <td style={{ padding: '12px 8px', color: '#475569' }}>{lab.accreditation}</td>
                  <td style={{ padding: '12px 8px' }}>★ {lab.rating} ({lab.reviewsCount})</td>
                  <td style={{ padding: '12px 8px' }}>{lab.distanceKm} km</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${lab.isVerified ? 'badge-verified' : 'badge-warning'}`}>
                      {lab.isVerified ? 'Verified Partner' : 'Pending Verification'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button 
                      className={`btn btn-sm ${lab.isVerified ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleLabVerification(lab.id)}
                    >
                      {lab.isVerified ? 'Revoke Verification' : 'Approve Partner'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: Collectors Registry */}
      {activeTab === 'collectors' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Phlebotomist & Sample Collector Network</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '10px 8px' }}>Collector Name</th>
                <th style={{ padding: '10px 8px' }}>Qualification</th>
                <th style={{ padding: '10px 8px' }}>Completed Trips</th>
                <th style={{ padding: '10px 8px' }}>Current Status</th>
                <th style={{ padding: '10px 8px' }}>Verification Status</th>
                <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '12px 8px', color: '#475569' }}>{c.qualification}</td>
                  <td style={{ padding: '12px 8px' }}>{c.completedCollections}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${c.isOnline ? 'badge-success' : 'badge-warning'}`}>
                      {c.isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${c.isVerified ? 'badge-verified' : 'badge-warning'}`}>
                      {c.isVerified ? 'Verified Phlebotomist' : 'Pending Background Check'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button 
                      className={`btn btn-sm ${c.isVerified ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleCollectorVerification(c.id)}
                    >
                      {c.isVerified ? 'Revoke' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
