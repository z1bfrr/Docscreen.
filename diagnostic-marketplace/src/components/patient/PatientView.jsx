import React, { useState, useMemo } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { TestCard } from './TestCard';
import { LabComparisonCard } from './LabComparisonCard';
import { BookingModal } from './BookingModal';
import { ReportViewModal } from './ReportViewModal';
import { ActiveTrackingDrawer } from './ActiveTrackingDrawer';
import { 
  Search, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  CheckCircle2, 
  FileText,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const PatientView = () => {
  const { tests, labs, bookings, calculateLabScore } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTest, setSelectedTest] = useState(tests[0]); // Default to CBC
  const [sortBy, setSortBy] = useState('recommended'); // recommended, price, speed, distance, rating
  
  // Modals state
  const [bookingTarget, setBookingTarget] = useState(null); // { lab, test }
  const [activeReportBooking, setActiveReportBooking] = useState(null);

  // Filter tests by search & category
  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.commonKeywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'ALL' || test.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [tests, searchQuery, selectedCategory]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(tests.map(t => t.category));
    return ['ALL', ...Array.from(set)];
  }, [tests]);

  // Labs offering the selected test, sorted dynamically
  const sortedLabOfferings = useMemo(() => {
    if (!selectedTest) return [];

    const availableLabs = labs.filter(lab => {
      const offering = lab.testOfferings[selectedTest.id];
      return offering && offering.available;
    });

    // Compute scores
    const withScores = availableLabs.map(lab => {
      const offering = lab.testOfferings[selectedTest.id];
      const score = calculateLabScore(lab, selectedTest.id);
      return { lab, offering, score };
    });

    // Sorting algorithms
    switch (sortBy) {
      case 'price':
        return withScores.sort((a, b) => a.offering.price - b.offering.price);
      case 'speed':
        return withScores.sort((a, b) => a.offering.turnaroundHours - b.offering.turnaroundHours);
      case 'distance':
        return withScores.sort((a, b) => a.lab.distanceKm - b.lab.distanceKm);
      case 'rating':
        return withScores.sort((a, b) => b.lab.rating - a.lab.rating);
      case 'recommended':
      default:
        return withScores.sort((a, b) => b.score - a.score);
    }
  }, [labs, selectedTest, sortBy, calculateLabScore]);

  // Patient bookings
  const patientBookings = bookings.slice(0, 3);

  return (
    <div>
      {/* Patient Hero Banner (Sections 8 & 9) */}
      <section className="patient-hero">
        <div className="patient-hero-badge">
          <ShieldCheck size={14} />
          <span>Independent Diagnostic Marketplace • Zero Markups</span>
        </div>
        <h1>Compare Verified Labs. Save Time & Money.</h1>
        <p>
          Search any test, transparently compare accredited laboratories near you by price, speed, and distance, and book home collection in 60 seconds.
        </p>

        {/* Big Search Input (Section 8: "What test are you looking for?") */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={22} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="What test are you looking for? (e.g. CBC, Blood Sugar, Thyroid, Vitamin D, Lipid...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Popular Test Chips (Section 8) */}
          <div className="quick-chips-row">
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Popular:</span>
            {['CBC', 'Blood Sugar', 'HbA1c', 'Thyroid Profile', 'Lipid Profile', 'Vitamin D', 'LFT', 'KFT'].map(name => (
              <button
                key={name}
                className="quick-chip"
                onClick={() => {
                  setSearchQuery(name);
                  const found = tests.find(t => t.name.toLowerCase().includes(name.toLowerCase()));
                  if (found) setSelectedTest(found);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', whiteSpace: 'nowrap' }}
          >
            {cat === 'ALL' ? 'All Tests' : cat}
          </button>
        ))}
      </div>

      {/* Tests Catalog Grid */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Select Diagnostic Test</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {filteredTests.length} available investigations
            </p>
          </div>
        </div>

        <div className="tests-grid">
          {filteredTests.map(test => (
            <TestCard
              key={test.id}
              test={test}
              isSelected={selectedTest?.id === test.id}
              onSelect={(t) => {
                setSelectedTest(t);
                // Smooth scroll to comparison
                const el = document.getElementById('marketplace-comparison');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </section>

      {/* Nearby Labs Marketplace Comparison (Sections 11, 12, 13) */}
      {selectedTest && (
        <section id="marketplace-comparison" className="comparison-container card" style={{ padding: '28px', background: '#fafbfc' }}>
          <div className="comparison-header">
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
                Marketplace Comparison
              </span>
              <h2 style={{ fontSize: '1.4rem' }}>
                Nearby Laboratories Offering: <span style={{ color: '#0284c7' }}>{selectedTest.name}</span>
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Comparing {sortedLabOfferings.length} independent verified laboratories within your service area
              </p>
            </div>

            {/* Sorting Tabs (Section 12: Sort/Filter by Recommended, Lowest Price, Nearest, Fastest Report, Highest Rated) */}
            <div className="sort-filters-bar">
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                <ArrowUpDown size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                Sort By:
              </span>
              <button 
                className={`sort-btn ${sortBy === 'recommended' ? 'active' : ''}`}
                onClick={() => setSortBy('recommended')}
              >
                Recommended
              </button>
              <button 
                className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                onClick={() => setSortBy('price')}
              >
                Lowest Price
              </button>
              <button 
                className={`sort-btn ${sortBy === 'speed' ? 'active' : ''}`}
                onClick={() => setSortBy('speed')}
              >
                Fastest Report
              </button>
              <button 
                className={`sort-btn ${sortBy === 'distance' ? 'active' : ''}`}
                onClick={() => setSortBy('distance')}
              >
                Nearest Lab
              </button>
              <button 
                className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                Highest Rated
              </button>
            </div>
          </div>

          {/* Labs Comparison Cards List (Section 11) */}
          <div className="lab-cards-list">
            {sortedLabOfferings.map(({ lab, score }, index) => (
              <LabComparisonCard
                key={lab.id}
                lab={lab}
                test={selectedTest}
                score={score}
                isTopMatch={sortBy === 'recommended' && index === 0}
                onBook={(targetLab, offering) => {
                  setBookingTarget({ lab: targetLab, test: selectedTest });
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Patient Active Bookings & Tracking Drawer (Sections 21, 31) */}
      {patientBookings.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={20} color="#0284c7" />
            <h2 style={{ fontSize: '1.35rem' }}>Your Diagnostic Orders & Sample Tracking</h2>
          </div>

          {patientBookings.map(booking => (
            <ActiveTrackingDrawer
              key={booking.id}
              booking={booking}
              onViewReport={(b) => setActiveReportBooking(b)}
            />
          ))}
        </section>
      )}

      {/* Booking Confirmation Modal */}
      {bookingTarget && (
        <BookingModal
          lab={bookingTarget.lab}
          test={bookingTarget.test}
          onClose={() => setBookingTarget(null)}
          onBookingSuccess={(newBooking) => {
            setBookingTarget(null);
          }}
        />
      )}

      {/* Report View Modal */}
      {activeReportBooking && (
        <ReportViewModal
          booking={activeReportBooking}
          onClose={() => setActiveReportBooking(null)}
        />
      )}
    </div>
  );
};
