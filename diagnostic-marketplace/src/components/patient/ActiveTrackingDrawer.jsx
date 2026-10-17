import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  CheckCircle2, 
  Clock, 
  Bike, 
  Building2, 
  FileText, 
  Star, 
  MapPin, 
  Phone, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const ActiveTrackingDrawer = ({ booking, onViewReport }) => {
  const { advanceBookingStatus, rateBooking } = useMarketplace();
  const [selectedStars, setSelectedStars] = useState(booking.rating || 5);
  const [feedbackText, setFeedbackText] = useState(booking.reviewFeedback || '');
  const [submittedReview, setSubmittedReview] = useState(!!booking.rating);

  if (!booking) return null;

  const STEPS = [
    { key: 'CONFIRMED', label: 'Booking Confirmed', desc: 'Order placed & payment verified' },
    { key: 'COLLECTOR_ASSIGNED', label: 'Collector Assigned', desc: 'Phlebotomist matched nearby' },
    { key: 'COLLECTOR_EN_ROUTE', label: 'Collector En Route', desc: 'Phlebotomist travelling to address' },
    { key: 'SAMPLE_COLLECTED', label: 'Sample Collected', desc: 'Blood drawn in barcode tube' },
    { key: 'SAMPLE_RECEIVED_BY_LAB', label: 'Received by Lab', desc: 'Accessioned at laboratory' },
    { key: 'PROCESSING', label: 'Test Processing', desc: 'Automated analyzers running' },
    { key: 'COMPLETED', label: 'Report Ready', desc: 'Verified by Pathologist' }
  ];

  // Helper to determine step status
  const getStepState = (stepKey) => {
    const order = [
      'CONFIRMED',
      'COLLECTOR_ASSIGNED',
      'COLLECTOR_EN_ROUTE',
      'SAMPLE_COLLECTED',
      'SAMPLE_RECEIVED_BY_LAB',
      'PROCESSING',
      'COMPLETED'
    ];

    const currentIndex = order.indexOf(booking.status);
    const stepIndex = order.indexOf(stepKey);

    if (booking.status === 'COLLECTOR_SEARCHING' && stepIndex === 1) {
      return 'active';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const handleAdvanceDemo = () => {
    const transitions = {
      'COLLECTOR_SEARCHING': 'COLLECTOR_ASSIGNED',
      'CONFIRMED': 'COLLECTOR_ASSIGNED',
      'COLLECTOR_ASSIGNED': 'COLLECTOR_EN_ROUTE',
      'COLLECTOR_EN_ROUTE': 'SAMPLE_COLLECTED',
      'SAMPLE_COLLECTED': 'SAMPLE_RECEIVED_BY_LAB',
      'SAMPLE_RECEIVED_BY_LAB': 'PROCESSING',
      'PROCESSING': 'COMPLETED'
    };

    const next = transitions[booking.status];
    if (next) {
      advanceBookingStatus(booking.id, next);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    rateBooking(booking.id, selectedStars, feedbackText);
    setSubmittedReview(true);
  };

  return (
    <div className="card" style={{ marginTop: '24px', border: '1px solid #0284c7' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-primary">Active Order #{booking.id}</span>
            <span className="badge badge-verified">
              <ShieldCheck size={12} /> {booking.collectionMethod === 'HOME_COLLECTION' ? 'Home Collection' : 'Lab Walk-in'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>
            {booking.testName}
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Diagnostic Partner: <strong>{booking.labName}</strong> • Barcode: <code>{booking.sampleBarcode}</code>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {booking.status !== 'COMPLETED' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleAdvanceDemo}
              title="Fast-forward one stage for demo testing"
              style={{ fontSize: '0.78rem' }}
            >
              <span>Simulate Next Stage →</span>
            </button>
          )}

          {booking.report && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onViewReport(booking)}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              <FileText size={15} />
              <span>View Verified Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Phlebotomist Banner if Assigned */}
      {booking.collectorName && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '12px 16px',
          borderRadius: '8px',
          margin: '16px 0',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: '#10b981', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bike size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#065f46' }}>
                Assigned Phlebotomist: {booking.collectorName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                Equipped with sealed cold-chain container & certified sterile vacutainers
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <a 
              href="tel:+919876543210" 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              <Phone size={12} /> Call
            </a>
          </div>
        </div>
      )}

      {/* Real-Time Visual Timeline (Section 31) */}
      <div className="timeline-stepper">
        {STEPS.map((step, idx) => {
          const state = getStepState(step.key);
          return (
            <div key={idx} className={`timeline-step ${state}`}>
              <div className="timeline-dot">
                {state === 'completed' ? (
                  <CheckCircle2 size={14} color="white" />
                ) : state === 'active' ? (
                  <Clock size={12} color="white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <div>
                <div className="timeline-step-title">{step.label}</div>
                <div className="timeline-step-note">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed & Report Ready Notification Card */}
      {booking.status === 'COMPLETED' && (
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #cbd5e1', 
          borderRadius: '8px', 
          padding: '16px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Diagnostic Report Ready & Clinically Approved
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                Approved by {booking.report?.doctorName || 'Senior Consultant Pathologist'}.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => onViewReport(booking)}
            >
              <FileText size={16} />
              <span>Open Medical Report</span>
            </button>
          </div>

          {/* Rating Widget (Section 33) */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            {submittedReview ? (
              <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
                ✓ Thank you for your {selectedStars}-star review! Your rating helps maintain marketplace quality.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Rate your diagnostic & collection experience:
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star 
                        size={22} 
                        fill={star <= selectedStars ? '#f59e0b' : 'none'} 
                        color={star <= selectedStars ? '#f59e0b' : '#cbd5e1'} 
                      />
                    </button>
                  ))}
                </div>
                <input
                  className="form-input"
                  placeholder="Share feedback on lab accuracy, speed, and collector punctuality..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{ marginBottom: '8px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm">
                  Submit Rating
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
