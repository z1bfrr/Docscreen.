import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_TESTS,
  INITIAL_LABS,
  INITIAL_COLLECTORS,
  INITIAL_SETTINGS,
  INITIAL_BOOKINGS
} from '../data/initialData';

const MarketplaceContext = createContext();

export const MarketplaceProvider = ({ children }) => {
  // 1. Core State with LocalStorage Persistence
  const [role, setRole] = useState(() => {
    return localStorage.getItem('diag_role') || 'patient';
  });

  const [tests, setTests] = useState(() => {
    const saved = localStorage.getItem('diag_tests');
    return saved ? JSON.parse(saved) : INITIAL_TESTS;
  });

  const [labs, setLabs] = useState(() => {
    const saved = localStorage.getItem('diag_labs');
    return saved ? JSON.parse(saved) : INITIAL_LABS;
  });

  const [collectors, setCollectors] = useState(() => {
    const saved = localStorage.getItem('diag_collectors');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTORS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('diag_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('diag_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  // Active user IDs for portals
  const [activeLabId, setActiveLabId] = useState('lab-1');
  const [activeCollectorId, setActiveCollectorId] = useState('collector-1');

  // Notifications system
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Welcome to DiagMarket',
      message: 'Explore verified laboratories near you and compare prices transparently.',
      timestamp: 'Just now',
      read: false,
      role: 'all'
    }
  ]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('diag_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('diag_tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('diag_labs', JSON.stringify(labs));
  }, [labs]);

  useEffect(() => {
    localStorage.setItem('diag_collectors', JSON.stringify(collectors));
  }, [collectors]);

  useEffect(() => {
    localStorage.setItem('diag_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('diag_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Add a notification helper
  const addNotification = (title, message, targetRole = 'all') => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: 'Just now',
      read: false,
      role: targetRole
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 15)]);
  };

  // 2. Ranking Algorithm Function (Section 13)
  const calculateLabScore = (lab, testId) => {
    const offering = lab.testOfferings[testId];
    if (!offering || !offering.available) return -1;

    const weights = settings.rankingWeights;

    // Normalizations based on market ranges
    // Availability: 1.0 if available, 0 if not
    const availabilityScore = offering.available ? 100 : 0;

    // Price: Lower is better (between ₹50 and ₹1500)
    // Formula: (MaxPrice - Price) / (MaxPrice - MinPrice) * 100
    const priceScore = Math.max(0, 100 - (offering.price / 10));

    // Distance: Closer is better (0 to 10 km)
    const distanceScore = Math.max(0, 100 - (lab.distanceKm * 15));

    // Turnaround: Faster is better (1 to 24 hrs)
    const turnaroundScore = Math.max(0, 100 - (offering.turnaroundHours * 8));

    // Rating: Higher is better (0 to 5)
    const ratingScore = (lab.rating / 5) * 100;

    // Weighted composite
    const totalWeight = weights.availability + weights.price + weights.distance + weights.turnaround + weights.rating;
    const finalScore = (
      (availabilityScore * weights.availability) +
      (priceScore * weights.price) +
      (distanceScore * weights.distance) +
      (turnaroundScore * weights.turnaround) +
      (ratingScore * weights.rating)
    ) / totalWeight;

    return Math.round(finalScore);
  };

  // 3. Create Booking (Patient Journey)
  const createBooking = (bookingData) => {
    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      createdAt: new Date().toISOString(),
      patientName: bookingData.patientName || 'Rahul Verma',
      patientPhone: bookingData.patientPhone || '+91 98111 22334',
      testId: bookingData.testId,
      testName: bookingData.testName,
      labId: bookingData.labId,
      labName: bookingData.labName,
      collectionMethod: bookingData.collectionMethod,
      address: bookingData.address || 'Flat 402, Sunrise Residency, Indiranagar',
      slotDate: bookingData.slotDate || 'Tomorrow',
      slotTime: bookingData.slotTime || '09:00 AM - 10:00 AM',
      pricing: bookingData.pricing,
      paymentStatus: 'PAID',
      paymentMethod: bookingData.paymentMethod || 'UPI Instant',
      status: bookingData.collectionMethod === 'HOME_COLLECTION' ? 'COLLECTOR_SEARCHING' : 'CONFIRMED',
      sampleStatus: 'AWAITING_COLLECTION',
      collectorId: null,
      collectorName: null,
      sampleBarcode: `SMP-${Math.floor(10000 + Math.random() * 90000)}-${bookingData.testId.toUpperCase().slice(-4)}`,
      estimatedReportTime: bookingData.estimatedReportTime || 'Same Day (~ 6 hrs)',
      history: [
        {
          status: 'CONFIRMED',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Booking confirmed via ${bookingData.paymentMethod || 'UPI'}. Total paid: ₹${bookingData.pricing.totalAmount}`
        }
      ],
      report: null
    };

    setBookings(prev => [newBooking, ...prev]);

    // Dispatch notifications
    addNotification(
      'Booking Placed',
      `Booking #${bookingId} for ${bookingData.testName} confirmed with ${bookingData.labName}.`,
      'patient'
    );
    addNotification(
      'New Order Received',
      `New order #${bookingId} (${bookingData.testName}) assigned to your lab.`,
      'lab'
    );

    if (bookingData.collectionMethod === 'HOME_COLLECTION') {
      addNotification(
        'Nearby Job Available',
        `New ${bookingData.testName} collection in ${bookingData.address.slice(0, 20)}... (Earn ₹${settings.defaultCollectionFee + 50})`,
        'collector'
      );
    }

    return newBooking;
  };

  // 4. Collector Flow: Accept Job
  const acceptJob = (bookingId, collectorId) => {
    const collector = collectors.find(c => c.id === collectorId) || collectors[0];

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'COLLECTOR_ASSIGNED',
          collectorId: collector.id,
          collectorName: collector.name,
          history: [
            ...b.history,
            {
              status: 'COLLECTOR_ASSIGNED',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: `Phlebotomist ${collector.name} (${collector.qualification}) accepted the job.`
            }
          ]
        };
      }
      return b;
    }));

    addNotification(
      'Phlebotomist Assigned',
      `${collector.name} has accepted your home collection and will arrive as scheduled.`,
      'patient'
    );
  };

  // 5. Update Booking Status / Lifecycle Step
  const advanceBookingStatus = (bookingId, nextStatus, customNote = '') => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;

      let sampleStatus = b.sampleStatus;
      if (nextStatus === 'COLLECTOR_EN_ROUTE') sampleStatus = 'AWAITING_COLLECTION';
      if (nextStatus === 'COLLECTOR_ARRIVED') sampleStatus = 'COLLECTOR_ON_SITE';
      if (nextStatus === 'SAMPLE_COLLECTED') sampleStatus = 'COLLECTED';
      if (nextStatus === 'SAMPLE_RECEIVED_BY_LAB') sampleStatus = 'RECEIVED_BY_LAB';
      if (nextStatus === 'PROCESSING') sampleStatus = 'PROCESSING';
      if (nextStatus === 'REPORT_READY') sampleStatus = 'REPORT_READY';
      if (nextStatus === 'COMPLETED') sampleStatus = 'COMPLETED';

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        ...b,
        status: nextStatus,
        sampleStatus,
        history: [
          ...b.history,
          {
            status: nextStatus,
            timestamp: timeString,
            note: customNote || `Status updated to ${nextStatus.replace(/_/g, ' ')}`
          }
        ]
      };
    }));
  };

  // 6. Lab Uploads Report
  const uploadReport = (bookingId, reportData) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    const lab = labs.find(l => l.id === targetBooking?.labId) || labs[0];

    const generatedReport = {
      url: reportData?.url || '#',
      generatedAt: new Date().toISOString(),
      doctorName: reportData?.doctorName || 'Dr. K. S. Sharma, MD (Pathology)',
      labName: lab.name,
      summary: reportData?.summary || `All tested parameters are clinically verified. Result within expected diagnostic tolerances.`,
      parameters: reportData?.parameters || [
        { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'NORMAL' },
        { name: 'Total Leukocyte Count (WBC)', value: '7,400', unit: 'cells/mcL', normalRange: '4,000 - 11,000', status: 'NORMAL' },
        { name: 'Platelet Count', value: '2.4', unit: 'lakhs/mcL', normalRange: '1.5 - 4.5', status: 'NORMAL' },
        { name: 'RBC Count', value: '4.8', unit: 'mill/mcL', normalRange: '4.5 - 5.5', status: 'NORMAL' }
      ]
    };

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'COMPLETED',
          sampleStatus: 'COMPLETED',
          report: generatedReport,
          history: [
            ...b.history,
            {
              status: 'REPORT_READY',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: `Diagnostic report verified & uploaded by ${lab.name}.`
            },
            {
              status: 'COMPLETED',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: 'Booking successfully fulfilled. Report available for download.'
            }
          ]
        };
      }
      return b;
    }));

    addNotification(
      'Report Ready!',
      `Your verified diagnostic report for #${bookingId} is ready to view and download.`,
      'patient'
    );
  };

  // 7. Patient Rates Booking
  const rateBooking = (bookingId, stars, review) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          rating: stars,
          reviewFeedback: review
        };
      }
      return b;
    }));

    addNotification(
      'Feedback Received',
      `Patient left a ${stars}-star review for #${bookingId}.`,
      'lab'
    );
  };

  // 8. Collector Toggle Online
  const toggleCollectorStatus = (collectorId) => {
    setCollectors(prev => prev.map(c => {
      if (c.id === collectorId) {
        return { ...c, isOnline: !c.isOnline };
      }
      return c;
    }));
  };

  // 9. Lab Updates Test Offering
  const updateLabOffering = (labId, testId, updates) => {
    setLabs(prev => prev.map(l => {
      if (l.id === labId) {
        const currentOffering = l.testOfferings[testId] || {};
        return {
          ...l,
          testOfferings: {
            ...l.testOfferings,
            [testId]: {
              ...currentOffering,
              ...updates
            }
          }
        };
      }
      return l;
    }));
  };

  // 10. Admin Updates Settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 11. Reset State to Initial Demo
  const resetDemoData = () => {
    setTests(INITIAL_TESTS);
    setLabs(INITIAL_LABS);
    setCollectors(INITIAL_COLLECTORS);
    setSettings(INITIAL_SETTINGS);
    setBookings(INITIAL_BOOKINGS);
    localStorage.removeItem('diag_tests');
    localStorage.removeItem('diag_labs');
    localStorage.removeItem('diag_collectors');
    localStorage.removeItem('diag_settings');
    localStorage.removeItem('diag_bookings');
    addNotification('Demo Data Reset', 'All laboratories, tests, and bookings restored to factory preset.', 'all');
  };

  return (
    <MarketplaceContext.Provider
      value={{
        role,
        setRole,
        tests,
        setTests,
        labs,
        setLabs,
        collectors,
        settings,
        updateSettings,
        bookings,
        activeLabId,
        setActiveLabId,
        activeCollectorId,
        setActiveCollectorId,
        notifications,
        addNotification,
        calculateLabScore,
        createBooking,
        acceptJob,
        advanceBookingStatus,
        uploadReport,
        rateBooking,
        toggleCollectorStatus,
        updateLabOffering,
        resetDemoData
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => useContext(MarketplaceContext);
