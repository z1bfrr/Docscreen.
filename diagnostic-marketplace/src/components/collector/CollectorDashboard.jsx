import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  Bike, 
  Power, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  Navigation, 
  PackageCheck, 
  Building2,
  AlertCircle,
  QrCode
} from 'lucide-react';

export const CollectorDashboard = () => {
  const { 
    collectors, 
    activeCollectorId, 
    setActiveCollectorId, 
    bookings, 
    acceptJob, 
    advanceBookingStatus, 
    toggleCollectorStatus 
  } = useMarketplace();

  const currentCollector = collectors.find(c => c.id === activeCollectorId) || collectors[0];
  const [barcodeInput, setBarcodeInput] = useState('');

  // Unassigned jobs within radius looking for collector
  const availableJobs = bookings.filter(b => 
    b.collectionMethod === 'HOME_COLLECTION' && 
    b.status === 'COLLECTOR_SEARCHING'
  );

  // Active jobs assigned to this collector
  const activeJobs = bookings.filter(b => 
    b.collectorId === currentCollector.id && 
    b.status !== 'COMPLETED'
  );

  // Completed collections
  const completedJobs = bookings.filter(b => 
    b.collectorId === currentCollector.id && 
    b.status === 'COMPLETED'
  );

  const earningsToday = currentCollector.todayEarnings + (completedJobs.length * 120);

  return (
    <div>
      {/* Collector Header Banner (Sections 19 & 30) */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(to right, #ffffff, #f0fdf4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: '#10b981', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bike size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentCollector.name}</h2>
                <span className="badge badge-verified">
                  <ShieldCheck size={12} /> Verified Phlebotomist
                </span>
                <span className="badge badge-primary">
                  <Star size={12} fill="#0284c7" color="#0284c7" /> {currentCollector.rating} ({currentCollector.completedCollections} trips)
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {currentCollector.qualification} • {currentCollector.vehicle}
              </p>
            </div>
          </div>

          {/* Online / Offline Toggle Switch (Section 19) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => toggleCollectorStatus(currentCollector.id)}
              className="btn"
              style={{
                background: currentCollector.isOnline ? '#10b981' : '#64748b',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '9999px',
                boxShadow: currentCollector.isOnline ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              {currentCollector.isOnline ? (
                <>
                  <div className="radar-pulse" style={{ background: '#ffffff' }}></div>
                  <span>ONLINE (Receiving Jobs)</span>
                </>
              ) : (
                <>
                  <Power size={16} />
                  <span>OFFLINE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Collector Metrics */}
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
              Today's Earnings
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>
              ₹{earningsToday}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Base pay + trip incentives</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Active Jobs
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
              {activeJobs.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>In transit or at patient site</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Acceptance Rate
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {currentCollector.acceptanceRate}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981' }}>High priority dispatch tier</span>
          </div>

          <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Avg. Reach Time
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {currentCollector.avgReachTimeMins} mins
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Current Zone: {currentCollector.currentZone}</span>
          </div>
        </div>
      </div>

      {/* Available Jobs Radar (Section 17 & 18: Nearby Job Offers) */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="radar-pulse"></div>
            <h3 style={{ fontSize: '1.15rem' }}>Nearby Collection Radar ({availableJobs.length} Available)</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Within 5 km radius of your location
          </span>
        </div>

        {!currentCollector.isOnline ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '8px' }}>
            <AlertCircle size={28} color="#64748b" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontWeight: 600, color: '#475569' }}>You are currently OFFLINE</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Switch your status to ONLINE above to start receiving collection requests.
            </p>
          </div>
        ) : availableJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ color: '#64748b' }}>No pending collection requests right now in your sector.</p>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              Switch to the <strong>Patient View</strong> to book a home collection!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableJobs.map(job => (
              <div 
                key={job.id}
                style={{
                  border: '2px solid #38bdf8',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  background: '#f0f9ff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-primary">New Job Offer</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>
                      {job.slotDate} • {job.slotTime}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
                    {job.testName}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#0284c7" />
                    <span>{job.address} (1.4 km away)</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    Destination Laboratory: <strong>{job.labName}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Estimated Earning
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>
                      ₹120
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => acceptJob(job.id, currentCollector.id)}
                    style={{ background: '#10b981', borderColor: '#10b981', padding: '12px 20px' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Accept Job</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Job Workflow Stepper (Section 18: Job Lifecycle) */}
      {activeJobs.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
            In-Progress Collection Workflow ({activeJobs.length})
          </h3>

          {activeJobs.map(job => (
            <div 
              key={job.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-primary">Order #{job.id}</span>
                    <span className="badge badge-warning">{job.status.replace(/_/g, ' ')}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
                    {job.testName}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Patient: <strong>{job.patientName}</strong> ({job.patientPhone})<br />
                    Address: {job.address}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Deliver Sample To:</div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{job.labName}</strong>
                </div>
              </div>

              {/* Collector Milestone Buttons (Section 18) */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px', 
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9'
              }}>
                {job.status === 'COLLECTOR_ASSIGNED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => advanceBookingStatus(job.id, 'COLLECTOR_EN_ROUTE', 'Collector started journey on two-wheeler')}
                  >
                    <Navigation size={14} />
                    <span>Start Journey (En Route)</span>
                  </button>
                )}

                {job.status === 'COLLECTOR_EN_ROUTE' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => advanceBookingStatus(job.id, 'COLLECTOR_ARRIVED', 'Phlebotomist reached patient doorstep')}
                  >
                    <MapPin size={14} />
                    <span>Mark Arrived at Patient</span>
                  </button>
                )}

                {job.status === 'COLLECTOR_ARRIVED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => advanceBookingStatus(job.id, 'SAMPLE_COLLECTED', `Sample sealed in cold container (${job.sampleBarcode})`)}
                  >
                    <PackageCheck size={14} />
                    <span>Confirm Sample Collected & Sealed</span>
                  </button>
                )}

                {job.status === 'SAMPLE_COLLECTED' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => advanceBookingStatus(job.id, 'SAMPLE_RECEIVED_BY_LAB', `Sample delivered to ${job.labName} receiving desk`)}
                    style={{ background: '#0d9488' }}
                  >
                    <Building2 size={14} />
                    <span>Handover Sample to Laboratory</span>
                  </button>
                )}

                {job.status === 'SAMPLE_RECEIVED_BY_LAB' && (
                  <span className="badge badge-success" style={{ padding: '8px 12px' }}>
                    ✓ Sample Successfully Handed Over to {job.labName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
