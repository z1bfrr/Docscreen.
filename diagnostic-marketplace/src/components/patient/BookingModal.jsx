import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { 
  X, 
  Home, 
  Building2, 
  Clock, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CreditCard,
  CheckCircle2,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingModal = ({ lab, test, onClose, onBookingSuccess }) => {
  const { settings, createBooking } = useMarketplace();
  const offering = lab.testOfferings[test.id];

  const [collectionMethod, setCollectionMethod] = useState(
    offering.homeCollection ? 'HOME_COLLECTION' : 'LAB_VISIT'
  );
  const [patientName, setPatientName] = useState('Rahul Verma');
  const [patientPhone, setPatientPhone] = useState('+91 98111 22334');
  const [address, setAddress] = useState('Flat 402, Sunrise Residency, 5th Cross, Indiranagar');
  const [slotDate, setSlotDate] = useState('Tomorrow');
  const [slotTime, setSlotTime] = useState('08:00 AM - 09:00 AM');
  const [paymentMethod, setPaymentMethod] = useState('UPI Instant (GPay / PhonePe)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing calculations
  const labPrice = offering.price;
  const collectionFee = collectionMethod === 'HOME_COLLECTION' ? (lab.homeCollectionFee || settings.defaultCollectionFee) : 0;
  
  // Platform fee calculation based on settings
  const platformFee = settings.platformFeeType === 'PERCENTAGE' 
    ? Math.round((labPrice * settings.platformFeeValue) / 100) 
    : settings.platformFeeValue;

  const totalAmount = labPrice + collectionFee + platformFee;

  const handleConfirmBooking = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking = createBooking({
        patientName,
        patientPhone,
        testId: test.id,
        testName: test.name,
        labId: lab.id,
        labName: lab.name,
        collectionMethod,
        address: collectionMethod === 'HOME_COLLECTION' ? address : `Walk-in: ${lab.address}`,
        slotDate,
        slotTime,
        pricing: {
          labPrice,
          collectionFee,
          platformFee,
          totalAmount
        },
        paymentMethod,
        estimatedReportTime: `Expected ~ ${offering.turnaroundHours} Hours after sample reach`
      });

      // Fire celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback gracefully
      }

      setIsSubmitting(false);
      onBookingSuccess(newBooking);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '4px' }}>Confirm Diagnostic Order</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{test.name}</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Selected Provider: <strong>{lab.name}</strong>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Collection Method Selection */}
        <div className="form-group">
          <label className="form-label">Choose Collection Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              className={`btn ${collectionMethod === 'HOME_COLLECTION' ? 'btn-primary' : 'btn-secondary'}`}
              disabled={!offering.homeCollection}
              onClick={() => setCollectionMethod('HOME_COLLECTION')}
              style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Home size={16} />
                <span>Home Collection</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                {offering.homeCollection ? `Phlebotomist arrives at home (+₹${lab.homeCollectionFee})` : 'Not supported by this lab'}
              </span>
            </button>

            <button
              type="button"
              className={`btn ${collectionMethod === 'LAB_VISIT' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCollectionMethod('LAB_VISIT')}
              style={{ padding: '12px', flexDirection: 'column', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} />
                <span>Lab Visit (Walk-in)</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                Visit clinic directly (₹0 fee)
              </span>
            </button>
          </div>
        </div>

        {/* Patient Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input 
              className="form-input" 
              value={patientName} 
              onChange={(e) => setPatientName(e.target.value)} 
              placeholder="Full name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input" 
              value={patientPhone} 
              onChange={(e) => setPatientPhone(e.target.value)} 
              placeholder="+91 Mobile"
            />
          </div>
        </div>

        {/* Address or Lab Walkin Note */}
        {collectionMethod === 'HOME_COLLECTION' ? (
          <div className="form-group">
            <label className="form-label">Sample Collection Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-input" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/flat, street, area, landmark"
              />
            </div>
          </div>
        ) : (
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '10px 14px', 
            fontSize: '0.82rem',
            color: '#475569',
            marginBottom: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            <MapPin size={16} color="#0284c7" style={{ flexShrink: 0 }} />
            <div>
              <strong>Lab Address:</strong> {lab.address}, {lab.city} (Hours: {lab.operatingHours})
            </div>
          </div>
        )}

        {/* Slot Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Preferred Date</label>
            <select className="form-select" value={slotDate} onChange={(e) => setSlotDate(e.target.value)}>
              <option value="Today">Today (Express)</option>
              <option value="Tomorrow">Tomorrow</option>
              <option value="Day After">Day After</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Time Slot</label>
            <select className="form-select" value={slotTime} onChange={(e) => setSlotTime(e.target.value)}>
              <option value="06:30 AM - 07:30 AM">06:30 AM - 07:30 AM (Fasting)</option>
              <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM (Fasting)</option>
              <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM</option>
              <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
              <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM</option>
            </select>
          </div>
        </div>

        {/* Transparent Price Breakdown (Sections 25 & 26) */}
        <div className="price-breakdown-card">
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            Transparent Price Breakdown
          </div>
          <div className="price-breakdown-row">
            <span>{test.name} (Lab Diagnostic Fee)</span>
            <span>₹{labPrice}</span>
          </div>
          <div className="price-breakdown-row">
            <span>Home Sample Collection Fee</span>
            <span>{collectionFee > 0 ? `₹${collectionFee}` : 'FREE (Lab Visit)'}</span>
          </div>
          <div className="price-breakdown-row">
            <span>Marketplace Platform Coordination Fee</span>
            <span>₹{platformFee}</span>
          </div>
          <div className="price-breakdown-row total">
            <span>Total Payable Amount</span>
            <span style={{ color: '#0284c7', fontSize: '1.25rem' }}>₹{totalAmount}</span>
          </div>
        </div>

        {/* Payment simulation */}
        <div className="form-group">
          <label className="form-label">Payment Mode</label>
          <select 
            className="form-select" 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="UPI Instant (GPay / PhonePe)">UPI Instant (Google Pay, PhonePe, Paytm)</option>
            <option value="Credit / Debit Card">Credit / Debit Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Cash / UPI on Collection">Pay on Sample Collection</option>
          </select>
        </div>

        {/* Booking CTA */}
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Securing Booking...</span>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Confirm & Pay ₹{totalAmount}</span>
            </>
          )}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '6px', 
          marginTop: '12px', 
          fontSize: '0.75rem', 
          color: '#64748b' 
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Locked Price Guarantee • Private NABL Report Delivery</span>
        </div>
      </div>
    </div>
  );
};
