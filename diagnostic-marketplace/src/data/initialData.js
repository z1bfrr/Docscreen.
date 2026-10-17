export const INITIAL_TESTS = [
  {
    id: "test-cbc",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    sampleType: "Blood (EDTA)",
    popular: true,
    code: "CBC-01",
    description: "Evaluates overall health and detects a wide range of disorders including anemia, infection, and leukemia.",
    parametersCount: 24,
    preparation: "No fasting required. Avoid heavy meals 2 hours before sample collection.",
    turnaroundGuideline: "Expected report in 2 - 6 hours depending on lab equipment.",
    homeCollectionSupported: true,
    commonKeywords: ["cbc", "blood count", "hemoglobin", "platelets", "wbc", "rbc", "infection", "fever"]
  },
  {
    id: "test-sugar",
    name: "Fasting Blood Glucose (Sugar)",
    category: "Biochemistry",
    sampleType: "Blood (Fluoride)",
    popular: true,
    code: "GLU-F",
    description: "Measures the level of glucose in your blood after an overnight fast to screen for prediabetes and diabetes.",
    parametersCount: 1,
    preparation: "Strict overnight fasting of 10-12 hours required. Water is permitted.",
    turnaroundGuideline: "Expected report in 2 - 4 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["sugar", "glucose", "diabetes", "fasting sugar", "fbs", "blood sugar"]
  },
  {
    id: "test-hba1c",
    name: "HbA1c (Glycated Hemoglobin)",
    category: "Diabetes Care",
    sampleType: "Blood (EDTA)",
    popular: true,
    code: "HBA1C",
    description: "Reflects average blood sugar level over the past 2 to 3 months. Gold standard for diabetes monitoring.",
    parametersCount: 2,
    preparation: "No fasting required. Can be taken any time of the day.",
    turnaroundGuideline: "Expected report in 3 - 6 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["hba1c", "glycated", "3 month sugar", "diabetes check", "a1c"]
  },
  {
    id: "test-thyroid",
    name: "Thyroid Profile Total (T3, T4, TSH)",
    category: "Endocrinology",
    sampleType: "Blood (Serum)",
    popular: true,
    code: "THY-3",
    description: "Evaluates thyroid gland function to screen for hypothyroidism, hyperthyroidism, and hormone balance.",
    parametersCount: 3,
    preparation: "Morning sample preferred before taking any thyroid medication.",
    turnaroundGuideline: "Expected report in 4 - 8 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["thyroid", "tsh", "t3", "t4", "hypothyroid", "hyperthyroid", "weight"]
  },
  {
    id: "test-lipid",
    name: "Lipid Profile Complete",
    category: "Cardiology",
    sampleType: "Blood (Serum)",
    popular: true,
    code: "LIP-COMP",
    description: "Measures cholesterol and triglycerides to assess cardiovascular disease risk and heart health.",
    parametersCount: 8,
    preparation: "Overnight fasting of 12-14 hours strictly required. Avoid alcohol 24h prior.",
    turnaroundGuideline: "Expected report in 4 - 8 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["lipid", "cholesterol", "triglycerides", "hdl", "ldl", "heart", "cardiac"]
  },
  {
    id: "test-vitamind",
    name: "Vitamin D (25-Hydroxy)",
    category: "Vitamins",
    sampleType: "Blood (Serum)",
    popular: true,
    code: "VIT-D",
    description: "Assesses Vitamin D deficiency vital for bone density, calcium absorption, and immune function.",
    parametersCount: 1,
    preparation: "No special fasting required.",
    turnaroundGuideline: "Expected report in 6 - 12 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["vitamin d", "vit d", "bone", "calcium", "sunlight", "fatigue", "d3"]
  },
  {
    id: "test-lft",
    name: "Liver Function Test (LFT)",
    category: "Hepatic",
    sampleType: "Blood (Serum)",
    popular: true,
    code: "LFT-09",
    description: "Screen for liver infections, damage, and alcohol-induced hepatitis via SGOT, SGPT, and Bilirubin.",
    parametersCount: 11,
    preparation: "Overnight fasting of 8-10 hours recommended.",
    turnaroundGuideline: "Expected report in 4 - 8 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["lft", "liver", "sgot", "sgpt", "bilirubin", "jaundice", "enzymes"]
  },
  {
    id: "test-kft",
    name: "Kidney Function Test (KFT / RFT)",
    category: "Renal",
    sampleType: "Blood (Serum) & Urine",
    popular: true,
    code: "KFT-07",
    description: "Evaluates renal filtration efficacy via Serum Creatinine, Blood Urea, Uric Acid, and Electrolytes.",
    parametersCount: 9,
    preparation: "No heavy meat consumption 24 hours prior. Stay normally hydrated.",
    turnaroundGuideline: "Expected report in 4 - 8 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["kft", "rft", "kidney", "creatinine", "urea", "uric acid", "renal"]
  },
  {
    id: "test-urine",
    name: "Urine Routine & Microscopy",
    category: "Clinical Pathology",
    sampleType: "Urine (Sterile Cup)",
    popular: true,
    code: "UR-MIC",
    description: "Detects urinary tract infections (UTI), kidney disease, proteinuria, and diabetes excretion.",
    parametersCount: 15,
    preparation: "First morning mid-stream clean catch urine specimen in sterile container.",
    turnaroundGuideline: "Expected report in 2 - 4 hours.",
    homeCollectionSupported: true,
    commonKeywords: ["urine", "uti", "pus cells", "protein", "infection", "routine"]
  }
];

export const INITIAL_LABS = [
  {
    id: "lab-1",
    name: "Metropolis Diagnostics & Clinical Care",
    tagline: "High-precision automated pathology",
    accreditation: "NABL & CAP Accredited",
    isVerified: true,
    rating: 4.8,
    reviewsCount: 432,
    distanceKm: 1.2,
    address: "Plot 14, Health City, Sector 4, Indiranagar",
    city: "Bengaluru",
    operatingHours: "07:00 AM - 09:00 PM",
    homeCollectionFee: 30,
    serviceRadiusKm: 12,
    status: "ACTIVE",
    testOfferings: {
      "test-cbc": { price: 180, turnaroundHours: 4, available: true, homeCollection: true },
      "test-sugar": { price: 80, turnaroundHours: 3, available: true, homeCollection: true },
      "test-hba1c": { price: 420, turnaroundHours: 5, available: true, homeCollection: true },
      "test-thyroid": { price: 390, turnaroundHours: 6, available: true, homeCollection: true },
      "test-lipid": { price: 540, turnaroundHours: 6, available: true, homeCollection: true },
      "test-vitamind": { price: 950, turnaroundHours: 8, available: true, homeCollection: true },
      "test-lft": { price: 620, turnaroundHours: 6, available: true, homeCollection: true },
      "test-kft": { price: 650, turnaroundHours: 6, available: true, homeCollection: true },
      "test-urine": { price: 150, turnaroundHours: 3, available: true, homeCollection: true }
    }
  },
  {
    id: "lab-2",
    name: "Suburban Pathology & Imaging Hub",
    tagline: "Affordable community diagnostic testing",
    accreditation: "NABL Certified Lab",
    isVerified: true,
    rating: 4.5,
    reviewsCount: 298,
    distanceKm: 2.1,
    address: "2nd Floor, Central Plaza, Ring Road",
    city: "Bengaluru",
    operatingHours: "07:30 AM - 08:30 PM",
    homeCollectionFee: 25,
    serviceRadiusKm: 10,
    status: "ACTIVE",
    testOfferings: {
      "test-cbc": { price: 150, turnaroundHours: 8, available: true, homeCollection: true },
      "test-sugar": { price: 60, turnaroundHours: 4, available: true, homeCollection: true },
      "test-hba1c": { price: 360, turnaroundHours: 8, available: true, homeCollection: true },
      "test-thyroid": { price: 320, turnaroundHours: 8, available: true, homeCollection: true },
      "test-lipid": { price: 460, turnaroundHours: 8, available: true, homeCollection: true },
      "test-vitamind": { price: 820, turnaroundHours: 12, available: true, homeCollection: true },
      "test-lft": { price: 510, turnaroundHours: 8, available: true, homeCollection: true },
      "test-kft": { price: 560, turnaroundHours: 8, available: true, homeCollection: true },
      "test-urine": { price: 120, turnaroundHours: 4, available: true, homeCollection: true }
    }
  },
  {
    id: "lab-3",
    name: "SRL Religare Express Diagnostics",
    tagline: "Fastest turnaround with robotic analyzers",
    accreditation: "NABL & ISO 15189 Certified",
    isVerified: true,
    rating: 4.8,
    reviewsCount: 512,
    distanceKm: 0.8,
    address: "Opposite Metro Gate 2, 100ft Road",
    city: "Bengaluru",
    operatingHours: "06:30 AM - 10:00 PM",
    homeCollectionFee: 40,
    serviceRadiusKm: 15,
    status: "ACTIVE",
    testOfferings: {
      "test-cbc": { price: 220, turnaroundHours: 2, available: true, homeCollection: true },
      "test-sugar": { price: 110, turnaroundHours: 2, available: true, homeCollection: true },
      "test-hba1c": { price: 480, turnaroundHours: 3, available: true, homeCollection: true },
      "test-thyroid": { price: 450, turnaroundHours: 4, available: true, homeCollection: true },
      "test-lipid": { price: 620, turnaroundHours: 4, available: true, homeCollection: true },
      "test-vitamind": { price: 1050, turnaroundHours: 6, available: true, homeCollection: true },
      "test-lft": { price: 720, turnaroundHours: 4, available: true, homeCollection: true },
      "test-kft": { price: 740, turnaroundHours: 4, available: true, homeCollection: true },
      "test-urine": { price: 190, turnaroundHours: 2, available: true, homeCollection: true }
    }
  },
  {
    id: "lab-4",
    name: "CarePlus Pathology Centre",
    tagline: "Friendly neighborhood testing clinic",
    accreditation: "State Health Dept Licensed",
    isVerified: true,
    rating: 4.4,
    reviewsCount: 86,
    distanceKm: 3.4,
    address: "Green Glen Layout, Sarjapur Road",
    city: "Bengaluru",
    operatingHours: "08:00 AM - 08:00 PM",
    homeCollectionFee: 20,
    serviceRadiusKm: 8,
    status: "ACTIVE",
    testOfferings: {
      "test-cbc": { price: 160, turnaroundHours: 5, available: true, homeCollection: true },
      "test-sugar": { price: 70, turnaroundHours: 3, available: true, homeCollection: true },
      "test-hba1c": { price: 390, turnaroundHours: 6, available: true, homeCollection: true },
      "test-thyroid": { price: 340, turnaroundHours: 7, available: true, homeCollection: true },
      "test-lipid": { price: 490, turnaroundHours: 7, available: true, homeCollection: true },
      "test-vitamind": { price: 890, turnaroundHours: 10, available: true, homeCollection: false },
      "test-lft": { price: 540, turnaroundHours: 6, available: true, homeCollection: true },
      "test-kft": { price: 580, turnaroundHours: 6, available: true, homeCollection: true },
      "test-urine": { price: 130, turnaroundHours: 3, available: true, homeCollection: true }
    }
  }
];

export const INITIAL_COLLECTORS = [
  {
    id: "collector-1",
    name: "Amit Sharma",
    qualification: "DMLT Certified Phlebotomist",
    rating: 4.9,
    completedCollections: 342,
    isOnline: true,
    isVerified: true,
    vehicle: "Honda Activa (Equipped Cold Box + Ice Gel Packs)",
    currentZone: "Indiranagar / Sector 4",
    distanceToPatientKm: 0.9,
    phone: "+91 98765 43210",
    acceptanceRate: "98.4%",
    avgReachTimeMins: 18,
    todayEarnings: 480
  },
  {
    id: "collector-2",
    name: "Priya Patel",
    qualification: "B.Sc Medical Lab Technology",
    rating: 4.8,
    completedCollections: 198,
    isOnline: true,
    isVerified: true,
    vehicle: "TVS Jupiter (Portable Centrifuge & Vacuum Tubes)",
    currentZone: "Koramangala / Ring Road",
    distanceToPatientKm: 2.2,
    phone: "+91 98234 56789",
    acceptanceRate: "96.5%",
    avgReachTimeMins: 24,
    todayEarnings: 320
  }
];

export const INITIAL_SETTINGS = {
  platformFeeType: "FIXED", // FIXED or PERCENTAGE
  platformFeeValue: 20, // ₹20
  defaultCollectionFee: 30, // ₹30
  serviceCity: "Bengaluru",
  rankingWeights: {
    availability: 25,
    price: 25,
    distance: 20,
    turnaround: 15,
    rating: 15
  }
};

export const INITIAL_BOOKINGS = [
  {
    id: "BK-8902",
    createdAt: "2026-09-11T18:30:00Z",
    patientName: "Rahul Verma",
    patientPhone: "+91 98111 22334",
    testId: "test-cbc",
    testName: "Complete Blood Count (CBC)",
    labId: "lab-1",
    labName: "Metropolis Diagnostics & Clinical Care",
    collectionMethod: "HOME_COLLECTION",
    address: "Flat 402, Sunrise Residency, 5th Cross, Indiranagar",
    slotDate: "Today",
    slotTime: "10:30 AM - 11:30 AM",
    pricing: {
      labPrice: 180,
      collectionFee: 30,
      platformFee: 20,
      totalAmount: 230
    },
    paymentStatus: "PAID",
    paymentMethod: "UPI (Google Pay)",
    status: "PROCESSING", // Lifecycle status
    sampleStatus: "RECEIVED_BY_LAB",
    collectorId: "collector-1",
    collectorName: "Amit Sharma",
    sampleBarcode: "SMP-78291-EDTA",
    estimatedReportTime: "Today ~ 4:30 PM",
    history: [
      { status: "CONFIRMED", timestamp: "10:00 AM", note: "Booking confirmed & paid ₹230" },
      { status: "COLLECTOR_ASSIGNED", timestamp: "10:02 AM", note: "Amit Sharma matched (0.9 km away)" },
      { status: "COLLECTOR_EN_ROUTE", timestamp: "10:15 AM", note: "Collector on the way to Indiranagar" },
      { status: "SAMPLE_COLLECTED", timestamp: "10:38 AM", note: "Blood sample collected in EDTA tube (Barcode: SMP-78291)" },
      { status: "SAMPLE_RECEIVED_BY_LAB", timestamp: "11:15 AM", note: "Sample checked into Metropolis Lab central accessioning" },
      { status: "PROCESSING", timestamp: "11:30 AM", note: "Automated Sysmex analyzer processing" }
    ],
    report: null
  },
  {
    id: "BK-8750",
    createdAt: "2026-09-11T09:15:00Z",
    patientName: "Ananya Iyer",
    patientPhone: "+91 99222 33445",
    testId: "test-sugar",
    testName: "Fasting Blood Glucose (Sugar)",
    labId: "lab-3",
    labName: "SRL Religare Express Diagnostics",
    collectionMethod: "LAB_VISIT",
    address: "Walk-in to Lab: Opp. Metro Gate 2",
    slotDate: "Today",
    slotTime: "08:00 AM - 08:30 AM",
    pricing: {
      labPrice: 110,
      collectionFee: 0,
      platformFee: 20,
      totalAmount: 130
    },
    paymentStatus: "PAID",
    paymentMethod: "Credit Card",
    status: "COMPLETED",
    sampleStatus: "COMPLETED",
    collectorId: null,
    collectorName: null,
    sampleBarcode: "SMP-66120-FLU",
    estimatedReportTime: "Ready",
    history: [
      { status: "CONFIRMED", timestamp: "07:45 AM", note: "Booking confirmed for walk-in" },
      { status: "SAMPLE_COLLECTED", timestamp: "08:12 AM", note: "Sample drawn at SRL collection bay" },
      { status: "SAMPLE_RECEIVED_BY_LAB", timestamp: "08:20 AM", note: "Centrifuged and run on Beckman Coulter AU5800" },
      { status: "REPORT_READY", timestamp: "09:40 AM", note: "Clinical Pathologist Dr. N. Menon approved report" },
      { status: "COMPLETED", timestamp: "09:42 AM", note: "Report published to patient portal" }
    ],
    report: {
      url: "#",
      generatedAt: "2026-09-11T09:40:00Z",
      doctorName: "Dr. N. Menon, MD Pathologist",
      labName: "SRL Religare Express Diagnostics",
      summary: "Fasting Blood Sugar: 94 mg/dL (Normal Range: 70 - 99 mg/dL). Clinically unremarkable.",
      parameters: [
        { name: "Fasting Blood Glucose", value: "94.0", unit: "mg/dL", normalRange: "70.0 - 99.0", status: "NORMAL" }
      ]
    },
    rating: 5,
    reviewFeedback: "Extremely quick turnaround! The lab counter was clean and report was ready within 90 minutes."
  }
];
