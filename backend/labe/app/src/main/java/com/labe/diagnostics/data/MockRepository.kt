package com.labe.diagnostics.data

import com.labe.diagnostics.data.models.*

object MockRepository {

    // ── Categories ──────────────────────────────────────────────────────────────
    val categories = listOf(
        TestCategory("blood", "Blood Tests", "bloodtype", 0xFF1D4ED8),
        TestCategory("urine", "Urine Tests", "science", 0xFF06B6D4),
        TestCategory("xray", "X-Ray", "radiology", 0xFF7C3AED),
        TestCategory("mri", "MRI Scan", "mri_scan", 0xFFEC4899),
        TestCategory("ct", "CT Scan", "computer", 0xFFF97316),
        TestCategory("ecg", "ECG", "monitor_heart", 0xFFEF4444),
        TestCategory("ultrasound", "Ultrasound", "water_drop", 0xFF10B981),
        TestCategory("thyroid", "Thyroid", "biotech", 0xFF8B5CF6),
        TestCategory("diabetes", "Diabetes", "glucose", 0xFFD97706),
        TestCategory("vitamin", "Vitamin Tests", "nutrition", 0xFF059669),
        TestCategory("hormone", "Hormones", "lab_research", 0xFFDB2777),
        TestCategory("covid", "Covid Tests", "coronavirus", 0xFF64748B)
    )

    // ── Diagnostic Tests ─────────────────────────────────────────────────────────
    val allTests = listOf(
        DiagnosticTest(
            id = "t001", name = "Complete Blood Count (CBC)", shortName = "CBC",
            category = categories[0], description = "Measures the cells that make up your blood: red blood cells, white blood cells, and platelets.",
            preparationInstructions = "No special preparation required. Fasting not necessary.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Hemoglobin", "RBC Count", "WBC Count", "Platelet Count", "Hematocrit", "MCV", "MCH", "MCHC"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t002", name = "Liver Function Test (LFT)", shortName = "LFT",
            category = categories[0], description = "Evaluates liver function and detects liver damage or disease.",
            preparationInstructions = "Fast for 8-10 hours before the test. Water is allowed.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("SGOT", "SGPT", "Alkaline Phosphatase", "Total Bilirubin", "Direct Bilirubin", "Total Protein", "Albumin"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t003", name = "Kidney Function Test (KFT)", shortName = "KFT",
            category = categories[0], description = "Assesses how well your kidneys are working.",
            preparationInstructions = "Fast for 8-10 hours. Avoid excessive water intake before test.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Creatinine", "Urea", "Uric Acid", "eGFR", "BUN", "Sodium", "Potassium", "Chloride"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t004", name = "Lipid Profile", shortName = "Lipid",
            category = categories[0], description = "Measures fats and fatty substances in your blood to assess heart disease risk.",
            preparationInstructions = "Fast for 10-12 hours before the test.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Total Cholesterol", "HDL", "LDL", "VLDL", "Triglycerides", "LDL/HDL Ratio"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t005", name = "Thyroid Profile (T3, T4, TSH)", shortName = "Thyroid",
            category = categories[7], description = "Evaluates thyroid gland function.",
            preparationInstructions = "No fasting required. Collect sample in the morning.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("T3 (Triiodothyronine)", "T4 (Thyroxine)", "TSH (Thyroid Stimulating Hormone)"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t006", name = "Blood Sugar (Fasting)", shortName = "FBS",
            category = categories[8], description = "Measures blood glucose level after fasting.",
            preparationInstructions = "Fast for 8-12 hours. Water is allowed.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Fasting Blood Glucose"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t007", name = "HbA1c (Glycated Hemoglobin)", shortName = "HbA1c",
            category = categories[8], description = "Measures average blood sugar over the past 2-3 months.",
            preparationInstructions = "No fasting required.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("HbA1c %", "Estimated Average Glucose (eAG)"),
            isPopular = true
        ),
        DiagnosticTest(
            id = "t008", name = "Vitamin D (25-OH)", shortName = "Vit D",
            category = categories[9], description = "Measures vitamin D levels to assess deficiency.",
            preparationInstructions = "No special preparation required.",
            turnaroundTime = "24 Hours", sampleType = "Blood",
            parameters = listOf("25-Hydroxyvitamin D"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t009", name = "Vitamin B12", shortName = "B12",
            category = categories[9], description = "Measures vitamin B12 level in the blood.",
            preparationInstructions = "No fasting required.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Vitamin B12 (Cobalamin)"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t010", name = "Iron Studies", shortName = "Iron",
            category = categories[0], description = "Evaluates iron stores and metabolism in the body.",
            preparationInstructions = "Fast for 8 hours. Avoid iron supplements 24 hours before.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Serum Iron", "TIBC", "Transferrin Saturation", "Ferritin"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t011", name = "Urine Routine & Microscopy", shortName = "Urine R/M",
            category = categories[1], description = "Detects abnormalities in urine composition.",
            preparationInstructions = "Collect mid-stream urine sample in the morning.",
            turnaroundTime = "Same Day", sampleType = "Urine",
            parameters = listOf("Color", "pH", "Specific Gravity", "Protein", "Glucose", "Ketones", "RBC", "WBC", "Casts"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t012", name = "ECG (Electrocardiogram)", shortName = "ECG",
            category = categories[5], description = "Records electrical activity of the heart.",
            preparationInstructions = "Wear comfortable clothing. Avoid applying lotions on chest.",
            turnaroundTime = "Immediate", sampleType = "Physical",
            parameters = listOf("Heart Rate", "Rhythm", "P Wave", "QRS Complex", "T Wave", "PR Interval", "QTc"),
            isPopular = true, isHomeCollectionAvailable = false
        ),
        DiagnosticTest(
            id = "t013", name = "Chest X-Ray (PA View)", shortName = "Chest X-Ray",
            category = categories[2], description = "Imaging of lungs, heart, and chest wall.",
            preparationInstructions = "Remove jewelry and metal objects. Wear comfortable clothing.",
            turnaroundTime = "Same Day", sampleType = "Imaging",
            parameters = listOf("Lung Fields", "Cardiac Shadow", "Mediastinum", "Diaphragm", "Ribs"),
            isPopular = true, isHomeCollectionAvailable = false
        ),
        DiagnosticTest(
            id = "t014", name = "MRI Brain (Plain)", shortName = "MRI Brain",
            category = categories[3], description = "Detailed imaging of brain structures without contrast.",
            preparationInstructions = "Remove all metal objects. Inform about any implants. Claustrophobic patients may need sedation.",
            turnaroundTime = "24 Hours", sampleType = "Imaging",
            parameters = listOf("Brain Parenchyma", "Ventricles", "White Matter", "Grey Matter", "Brainstem", "Cerebellum"),
            isPopular = false, isHomeCollectionAvailable = false
        ),
        DiagnosticTest(
            id = "t015", name = "CT Scan Abdomen (Plain)", shortName = "CT Abdomen",
            category = categories[4], description = "Detailed imaging of abdominal organs.",
            preparationInstructions = "Fast for 4 hours. Remove metal objects. Avoid wearing tight clothing.",
            turnaroundTime = "Same Day", sampleType = "Imaging",
            parameters = listOf("Liver", "Gallbladder", "Pancreas", "Spleen", "Kidneys", "Adrenal Glands", "Bowel"),
            isPopular = false, isHomeCollectionAvailable = false
        ),
        DiagnosticTest(
            id = "t016", name = "Ultrasound Abdomen", shortName = "USG Abdomen",
            category = categories[6], description = "Ultrasound imaging of abdominal organs.",
            preparationInstructions = "Fast for 4-6 hours. Drink 4-6 glasses of water 1 hour before and do not urinate.",
            turnaroundTime = "Same Day", sampleType = "Imaging",
            parameters = listOf("Liver", "Gallbladder", "Pancreas", "Spleen", "Kidneys", "Aorta"),
            isPopular = false, isHomeCollectionAvailable = false
        ),
        DiagnosticTest(
            id = "t017", name = "COVID-19 RT-PCR", shortName = "COVID PCR",
            category = categories[11], description = "Gold-standard test for COVID-19 diagnosis from nasopharyngeal swab.",
            preparationInstructions = "Do not eat, drink, or brush teeth 30 minutes before sample collection.",
            turnaroundTime = "24 Hours", sampleType = "Nasal Swab",
            parameters = listOf("SARS-CoV-2 RNA Detection", "Ct Value"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t018", name = "Dengue NS1 Antigen", shortName = "Dengue NS1",
            category = categories[0], description = "Early detection of dengue fever.",
            preparationInstructions = "No preparation required.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("NS1 Antigen", "IgM Antibody", "IgG Antibody"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t019", name = "PSA (Prostate Specific Antigen)", shortName = "PSA",
            category = categories[10], description = "Screens for prostate cancer and monitors prostate conditions.",
            preparationInstructions = "No ejaculation 24 hours before. Avoid rectal exam 1 week prior.",
            turnaroundTime = "24 Hours", sampleType = "Blood",
            parameters = listOf("Total PSA", "Free PSA", "Free/Total PSA Ratio"),
            isPopular = false
        ),
        DiagnosticTest(
            id = "t020", name = "Electrolytes Panel", shortName = "Electrolytes",
            category = categories[0], description = "Measures key electrolytes to assess fluid and acid-base balance.",
            preparationInstructions = "No special preparation.",
            turnaroundTime = "Same Day", sampleType = "Blood",
            parameters = listOf("Sodium", "Potassium", "Chloride", "Bicarbonate", "Calcium", "Magnesium", "Phosphorus"),
            isPopular = false
        )
    )

    // ── Lab Partners ─────────────────────────────────────────────────────────────
    val labPartners = listOf(
        LabPartner(
            id = "l001", name = "Apollo Diagnostics", address = "42, Bypass Road, Near Big Bazaar",
            city = "Madurai", distance = "1.2 km", rating = 4.8f, reviewCount = 2340,
            isNablCertified = true, isCapCertified = true,
            operatingHours = "6:00 AM – 9:00 PM",
            homeCollectionCharge = 0,
            tests = listOf(
                LabTestPrice("t001", 350, 20), LabTestPrice("t002", 650, 15),
                LabTestPrice("t003", 550, 10), LabTestPrice("t004", 750, 20),
                LabTestPrice("t005", 850, 15), LabTestPrice("t006", 120, 0),
                LabTestPrice("t007", 550, 10), LabTestPrice("t008", 1200, 20),
                LabTestPrice("t009", 800, 15), LabTestPrice("t011", 180, 0),
                LabTestPrice("t012", 400, 0), LabTestPrice("t013", 550, 10),
                LabTestPrice("t018", 900, 10), LabTestPrice("t020", 600, 15)
            )
        ),
        LabPartner(
            id = "l002", name = "Lister Metropolis Lab", address = "78, Anna Nagar Main Road",
            city = "Madurai", distance = "2.5 km", rating = 4.6f, reviewCount = 1876,
            isNablCertified = true, isCapCertified = false,
            operatingHours = "7:00 AM – 8:00 PM",
            homeCollectionCharge = 50,
            tests = listOf(
                LabTestPrice("t001", 380, 10), LabTestPrice("t002", 700, 10),
                LabTestPrice("t003", 580, 5), LabTestPrice("t004", 780, 15),
                LabTestPrice("t005", 900, 10), LabTestPrice("t006", 100, 0),
                LabTestPrice("t007", 580, 5), LabTestPrice("t008", 1100, 15),
                LabTestPrice("t009", 850, 10), LabTestPrice("t011", 200, 0),
                LabTestPrice("t018", 950, 5), LabTestPrice("t020", 650, 10)
            )
        ),
        LabPartner(
            id = "l003", name = "SRL Diagnostics", address = "15, Kochadai Junction",
            city = "Madurai", distance = "3.1 km", rating = 4.5f, reviewCount = 1543,
            isNablCertified = true, isCapCertified = false,
            operatingHours = "6:30 AM – 9:30 PM",
            homeCollectionCharge = 0,
            tests = listOf(
                LabTestPrice("t001", 320, 25), LabTestPrice("t002", 600, 20),
                LabTestPrice("t003", 520, 15), LabTestPrice("t004", 700, 25),
                LabTestPrice("t005", 800, 20), LabTestPrice("t006", 110, 0),
                LabTestPrice("t007", 520, 15), LabTestPrice("t008", 1050, 25),
                LabTestPrice("t009", 780, 20), LabTestPrice("t011", 160, 0),
                LabTestPrice("t018", 880, 15), LabTestPrice("t020", 580, 20)
            )
        ),
        LabPartner(
            id = "l004", name = "Dr. Lal PathLabs", address = "33, Mattuthavani Main Road",
            city = "Madurai", distance = "4.0 km", rating = 4.7f, reviewCount = 3120,
            isNablCertified = true, isCapCertified = true,
            operatingHours = "5:30 AM – 10:00 PM",
            homeCollectionCharge = 0,
            tests = listOf(
                LabTestPrice("t001", 360, 18), LabTestPrice("t002", 680, 12),
                LabTestPrice("t003", 560, 8), LabTestPrice("t004", 760, 18),
                LabTestPrice("t005", 860, 12), LabTestPrice("t006", 130, 0),
                LabTestPrice("t007", 560, 10), LabTestPrice("t008", 1180, 18),
                LabTestPrice("t009", 820, 12), LabTestPrice("t011", 190, 0),
                LabTestPrice("t018", 920, 8), LabTestPrice("t020", 620, 12)
            )
        ),
        LabPartner(
            id = "l005", name = "Thyrocare Centre", address = "67, Town Hall Road",
            city = "Madurai", distance = "1.8 km", rating = 4.4f, reviewCount = 980,
            isNablCertified = true, isCapCertified = false,
            operatingHours = "7:00 AM – 7:00 PM",
            homeCollectionCharge = 60,
            tests = listOf(
                LabTestPrice("t001", 299, 30), LabTestPrice("t002", 599, 25),
                LabTestPrice("t003", 499, 20), LabTestPrice("t004", 649, 30),
                LabTestPrice("t005", 749, 25), LabTestPrice("t006", 89, 0),
                LabTestPrice("t007", 499, 20), LabTestPrice("t008", 999, 30),
                LabTestPrice("t009", 749, 25), LabTestPrice("t011", 149, 0)
            )
        ),
        LabPartner(
            id = "l006", name = "KIMS Scan & Lab Centre", address = "22, KK Nagar 3rd Street",
            city = "Madurai", distance = "2.9 km", rating = 4.9f, reviewCount = 4250,
            isNablCertified = true, isCapCertified = true,
            operatingHours = "24 Hours",
            homeCollectionCharge = 0,
            tests = listOf(
                LabTestPrice("t001", 420, 5), LabTestPrice("t002", 720, 5),
                LabTestPrice("t003", 600, 5), LabTestPrice("t004", 820, 5),
                LabTestPrice("t005", 920, 5), LabTestPrice("t006", 150, 0),
                LabTestPrice("t012", 350, 0), LabTestPrice("t013", 600, 5),
                LabTestPrice("t014", 4500, 10), LabTestPrice("t015", 3800, 10),
                LabTestPrice("t016", 1200, 5), LabTestPrice("t018", 1000, 5)
            )
        ),
        LabPartner(
            id = "l007", name = "Meenakshi Mission Diagnostics", address = "Lake Area, Vandiyur",
            city = "Madurai", distance = "5.2 km", rating = 4.6f, reviewCount = 2100,
            isNablCertified = true, isCapCertified = false,
            operatingHours = "7:00 AM – 9:00 PM",
            homeCollectionCharge = 80,
            tests = listOf(
                LabTestPrice("t001", 400, 10), LabTestPrice("t002", 690, 8),
                LabTestPrice("t003", 570, 6), LabTestPrice("t004", 790, 12),
                LabTestPrice("t012", 380, 0), LabTestPrice("t013", 580, 8),
                LabTestPrice("t014", 4800, 8), LabTestPrice("t015", 4000, 8),
                LabTestPrice("t016", 1300, 8), LabTestPrice("t019", 1100, 10)
            )
        ),
        LabPartner(
            id = "l008", name = "Velan Scanning Centre", address = "18, Vaigai Salai, Tallakulam",
            city = "Madurai", distance = "3.7 km", rating = 4.3f, reviewCount = 760,
            isNablCertified = false, isCapCertified = false,
            operatingHours = "8:00 AM – 8:00 PM",
            homeCollectionCharge = 100,
            tests = listOf(
                LabTestPrice("t001", 280, 35), LabTestPrice("t002", 550, 30),
                LabTestPrice("t003", 480, 25), LabTestPrice("t004", 620, 35),
                LabTestPrice("t005", 720, 30), LabTestPrice("t006", 80, 0),
                LabTestPrice("t013", 500, 15), LabTestPrice("t016", 1100, 12)
            )
        )
    )

    // ── Health Packages ───────────────────────────────────────────────────────────
    val healthPackages = listOf(
        HealthPackage(
            id = "p001", name = "AuraLab Full Body Checkup",
            description = "Comprehensive 72-parameter health screening package",
            testsIncluded = listOf("t001", "t002", "t003", "t004", "t005", "t006", "t007", "t008", "t009", "t011"),
            originalPrice = 5500, discountedPrice = 1999, discountPercent = 64,
            isBestseller = true
        ),
        HealthPackage(
            id = "p002", name = "Diabetes Care Package",
            description = "Complete diabetes management panel",
            testsIncluded = listOf("t006", "t007", "t003", "t020"),
            originalPrice = 1800, discountedPrice = 699, discountPercent = 61,
            isBestseller = false
        ),
        HealthPackage(
            id = "p003", name = "Cardiac Risk Profile",
            description = "Heart health assessment with ECG",
            testsIncluded = listOf("t004", "t001", "t006", "t012"),
            originalPrice = 2200, discountedPrice = 999, discountPercent = 55,
            isBestseller = true
        ),
        HealthPackage(
            id = "p004", name = "Women's Wellness Package",
            description = "Comprehensive health panel designed for women",
            testsIncluded = listOf("t001", "t005", "t008", "t009", "t010", "t011"),
            originalPrice = 3500, discountedPrice = 1499, discountPercent = 57,
            isBestseller = false
        ),
        HealthPackage(
            id = "p005", name = "Senior Citizen Health Package",
            description = "Age-specific comprehensive screening for 50+",
            testsIncluded = listOf("t001", "t002", "t003", "t004", "t005", "t006", "t007", "t012"),
            originalPrice = 4200, discountedPrice = 1799, discountPercent = 57,
            isBestseller = false
        )
    )

    // ── Time Slots ─────────────────────────────────────────────────────────────
    val timeSlots = listOf(
        TimeSlot("s01", "6:00 AM – 7:00 AM", true),
        TimeSlot("s02", "7:00 AM – 8:00 AM", true),
        TimeSlot("s03", "8:00 AM – 9:00 AM", false),
        TimeSlot("s04", "9:00 AM – 10:00 AM", true),
        TimeSlot("s05", "10:00 AM – 11:00 AM", true),
        TimeSlot("s06", "11:00 AM – 12:00 PM", true),
        TimeSlot("s07", "12:00 PM – 1:00 PM", false),
        TimeSlot("s08", "1:00 PM – 2:00 PM", true),
        TimeSlot("s09", "3:00 PM – 4:00 PM", true),
        TimeSlot("s10", "4:00 PM – 5:00 PM", false),
        TimeSlot("s11", "5:00 PM – 6:00 PM", true),
        TimeSlot("s12", "6:00 PM – 7:00 PM", true)
    )

    // ── Mock Orders ────────────────────────────────────────────────────────────
    val mockOrders = listOf(
        BookingOrder(
            id = "ORD-2024-001",
            patientName = "Mukesh Z",
            patientAge = 28,
            patientGender = "Male",
            tests = listOf(allTests[0], allTests[1], allTests[3]),
            lab = labPartners[0],
            totalAmount = 1549,
            collectionType = CollectionType.HOME_COLLECTION,
            address = "12, Gandhi Nagar, 4th Cross, Madurai - 625020",
            scheduledDate = "Today",
            scheduledTimeSlot = "7:00 AM – 8:00 AM",
            status = OrderStatus.SAMPLE_COLLECTED,
            trackingSteps = listOf(
                TrackingStep("Booking Confirmed", "Your booking is confirmed", "9:00 PM", isCompleted = true, isCurrent = false),
                TrackingStep("Phlebotomist Assigned", "Ramesh Kumar will collect your sample", "6:45 AM", isCompleted = true, isCurrent = false),
                TrackingStep("Sample Collected", "Sample collected successfully", "7:23 AM", isCompleted = true, isCurrent = true),
                TrackingStep("Processing at Lab", "Samples under analysis", null, isCompleted = false, isCurrent = false),
                TrackingStep("Report Ready", "Download your report", null, isCompleted = false, isCurrent = false)
            )
        ),
        BookingOrder(
            id = "ORD-2024-002",
            patientName = "Mukesh Z",
            patientAge = 28,
            patientGender = "Male",
            tests = listOf(allTests[4], allTests[6]),
            lab = labPartners[2],
            totalAmount = 1019,
            collectionType = CollectionType.WALK_IN,
            address = null,
            scheduledDate = "Yesterday",
            scheduledTimeSlot = "10:00 AM – 11:00 AM",
            status = OrderStatus.REPORT_READY,
            trackingSteps = listOf(
                TrackingStep("Booking Confirmed", "Your booking is confirmed", "8:00 AM", isCompleted = true, isCurrent = false),
                TrackingStep("Sample Collected", "Collected at lab", "10:15 AM", isCompleted = true, isCurrent = false),
                TrackingStep("Processing at Lab", "Samples analyzed", "1:00 PM", isCompleted = true, isCurrent = false),
                TrackingStep("Report Ready", "Your report is ready for download", "4:30 PM", isCompleted = true, isCurrent = true)
            )
        )
    )

    // ── Patient Profile ────────────────────────────────────────────────────────
    val patientProfile = PatientProfile(
        id = "u001",
        name = "Mukesh Z",
        age = 28,
        gender = "Male",
        phone = "+91 98765 43210",
        email = "mukesh@example.com",
        address = "12, Gandhi Nagar, 4th Cross, Madurai - 625020",
        bloodGroup = "O+"
    )

    // ── Helper Functions ───────────────────────────────────────────────────────
    fun getTestById(id: String): DiagnosticTest? = allTests.find { it.id == id }

    fun getLabById(id: String): LabPartner? = labPartners.find { it.id == id }

    fun getPriceForTestInLab(testId: String, labId: String): Int? {
        val lab = getLabById(labId) ?: return null
        val testPrice = lab.tests.find { it.testId == testId } ?: return null
        val originalPrice = testPrice.price
        val discount = testPrice.discountPercent
        return (originalPrice * (100 - discount) / 100)
    }

    fun searchTests(query: String): List<DiagnosticTest> {
        if (query.isBlank()) return allTests
        val q = query.lowercase()
        return allTests.filter {
            it.name.lowercase().contains(q) ||
            it.shortName.lowercase().contains(q) ||
            it.category.name.lowercase().contains(q) ||
            it.parameters.any { p -> p.lowercase().contains(q) }
        }
    }

    fun getTestsByCategory(categoryId: String): List<DiagnosticTest> {
        if (categoryId == "all") return allTests
        return allTests.filter { it.category.id == categoryId }
    }

    fun getLabsForTest(testId: String): List<LabPartner> {
        return labPartners.filter { lab -> lab.tests.any { it.testId == testId } }
    }

    fun getPopularTests() = allTests.filter { it.isPopular }
}
