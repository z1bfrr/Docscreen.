export interface TestCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface DiagnosticTest {
  id: number;
  name: string;
  shortName: string;
  categoryId: number;
  description: string;
  preparationInstructions: string;
  turnaroundTime: string;
  sampleType: string;
  parameters: string;
  isPopular: boolean;
  isHomeCollectionAvailable: boolean;
  category?: TestCategory;
}

export interface LabPartner {
  id: number;
  name: string;
  address: string;
  city: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isNablCertified: boolean;
  isCapCertified: boolean;
  operatingHours: string;
  homeCollectionCharge: number;
}

export interface HealthPackage {
  id: number;
  name: string;
  description: string;
  testsIncluded: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  isBestseller: boolean;
}

export interface BookingOrder {
  id: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  labId: number;
  totalAmount: number;
  collectionType: string;
  address?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  status: string;
  createdAt: string;
}
