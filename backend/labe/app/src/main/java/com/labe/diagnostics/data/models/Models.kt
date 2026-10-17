package com.labe.diagnostics.data.models

data class DiagnosticTest(
    val id: String,
    val name: String,
    val shortName: String,
    val category: TestCategory,
    val description: String,
    val preparationInstructions: String,
    val turnaroundTime: String,  // e.g. "Same Day", "24 Hours"
    val sampleType: String,       // e.g. "Blood", "Urine"
    val parameters: List<String>,
    val isPopular: Boolean = false,
    val isHomeCollectionAvailable: Boolean = true
)

data class LabPartner(
    val id: String,
    val name: String,
    val address: String,
    val city: String,
    val distance: String,           // e.g. "2.3 km"
    val rating: Float,
    val reviewCount: Int,
    val isNablCertified: Boolean,
    val isCapCertified: Boolean,
    val operatingHours: String,
    val homeCollectionCharge: Int,  // in rupees
    val tests: List<LabTestPrice>
)

data class LabTestPrice(
    val testId: String,
    val price: Int,          // in rupees
    val discountPercent: Int = 0
)

data class TestCategory(
    val id: String,
    val name: String,
    val icon: String,         // icon name for Material Icons
    val color: Long           // ARGB color hex
)

data class HealthPackage(
    val id: String,
    val name: String,
    val description: String,
    val testsIncluded: List<String>,
    val originalPrice: Int,
    val discountedPrice: Int,
    val discountPercent: Int,
    val isBestseller: Boolean = false
)

data class CartItem(
    val test: DiagnosticTest,
    val lab: LabPartner,
    val price: Int
)

data class BookingOrder(
    val id: String,
    val patientName: String,
    val patientAge: Int,
    val patientGender: String,
    val tests: List<DiagnosticTest>,
    val lab: LabPartner,
    val totalAmount: Int,
    val collectionType: CollectionType,
    val address: String?,           // for home collection
    val scheduledDate: String,
    val scheduledTimeSlot: String,
    val status: OrderStatus,
    val trackingSteps: List<TrackingStep>
)

data class TrackingStep(
    val title: String,
    val subtitle: String,
    val time: String?,
    val isCompleted: Boolean,
    val isCurrent: Boolean
)

data class TimeSlot(
    val id: String,
    val time: String,
    val isAvailable: Boolean
)

data class PatientProfile(
    val id: String,
    val name: String,
    val age: Int,
    val gender: String,
    val phone: String,
    val email: String,
    val address: String,
    val bloodGroup: String
)

enum class CollectionType {
    HOME_COLLECTION, WALK_IN
}

enum class OrderStatus {
    BOOKED, SAMPLE_COLLECTED, PROCESSING, REPORT_READY, DELIVERED
}
