import React from 'react';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Home, 
  Zap, 
  Award,
  ChevronRight 
} from 'lucide-react';

export const LabComparisonCard = ({ 
  lab, 
  test, 
  score, 
  isTopMatch, 
  onBook 
}) => {
  const offering = lab.testOfferings[test.id];
  if (!offering) return null;

  return (
    <div className={`lab-row-card ${isTopMatch ? 'highlight-recommended' : ''}`}>
      {/* Column 1: Lab Identity & Trust */}
      <div className="lab-main-info">
        <div className="lab-title-row">
          <h4 className="lab-title">{lab.name}</h4>
          {lab.isVerified && (
            <span className="badge badge-verified" title="Verified by DiagMarket Platform">
              <ShieldCheck size={13} /> Verified
            </span>
          )}
          {isTopMatch && (
            <span className="badge badge-primary" style={{ background: '#0284c7', color: 'white' }}>
              <Zap size={12} /> Top Match ({score}%)
            </span>
          )}
        </div>

        <p className="lab-tagline">{lab.tagline}</p>

        <div className="lab-meta-row">
          <div className="lab-meta-item" title="Patient reviews">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <strong style={{ color: '#0f172a' }}>{lab.rating}</strong>
            <span style={{ color: '#64748b' }}>({lab.reviewsCount})</span>
          </div>

          <div className="lab-meta-item" title="Distance from patient location">
            <MapPin size={14} color="#0284c7" />
            <span>{lab.distanceKm} km away</span>
          </div>

          <div className="lab-meta-item" title="Accreditation status">
            <Award size={14} color="#10b981" />
            <span>{lab.accreditation}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          {offering.homeCollection ? (
            <span style={{ fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Home size={12} /> Home Collection Available (+₹{lab.homeCollectionFee})
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Lab Visit Only
            </span>
          )}
        </div>
      </div>

      {/* Column 2: Turnaround Speed */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
          Report Turnaround
        </span>
        <div className="lab-turnaround-badge">
          <Clock size={15} color="#0284c7" />
          <span>~{offering.turnaroundHours} Hours</span>
        </div>
      </div>

      {/* Column 3: Lab Test Price */}
      <div className="lab-price-box">
        <span className="lab-price-label">Test Price</span>
        <div className="lab-price-value">₹{offering.price}</div>
      </div>

      {/* Column 4: Selection Action */}
      <div>
        <button 
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={() => onBook(lab, offering)}
        >
          <span>Choose Lab</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
