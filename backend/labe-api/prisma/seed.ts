import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // User
  const user = await prisma.user.upsert({
    where: { email: 'test@auralab.com' },
    update: {},
    create: {
      email: 'test@auralab.com',
      name: 'Test User',
      phone: '1234567890',
      password: 'password123', // In a real app, hash this!
    },
  })
  console.log(`Created user with id: ${user.id}`)

  // Categories
  const cat1 = await prisma.testCategory.create({
    data: { name: 'Blood', icon: 'bloodtype', color: '0xFFE57373' }
  })
  const cat2 = await prisma.testCategory.create({
    data: { name: 'Urine', icon: 'water_drop', color: '0xFF81C784' }
  })
  const cat3 = await prisma.testCategory.create({
    data: { name: 'Full Body', icon: 'accessibility', color: '0xFF64B5F6' }
  })

  // Tests
  const test1 = await prisma.diagnosticTest.create({
    data: {
      name: 'Complete Blood Count',
      shortName: 'CBC',
      categoryId: cat1.id,
      description: 'Evaluates overall health and detects a wide range of disorders.',
      preparationInstructions: 'Fasting for 8 hours recommended.',
      turnaroundTime: '24 Hours',
      sampleType: 'Blood',
      parameters: 'Hemoglobin, RBC, WBC, Platelets',
      isPopular: true,
      isHomeCollectionAvailable: true
    }
  })
  
  const test2 = await prisma.diagnosticTest.create({
    data: {
      name: 'Lipid Profile',
      shortName: 'Lipid',
      categoryId: cat1.id,
      description: 'Measures the amount of cholesterol and triglycerides in your blood.',
      preparationInstructions: 'Fasting for 10-12 hours is required.',
      turnaroundTime: '24 Hours',
      sampleType: 'Blood',
      parameters: 'Total Cholesterol, HDL, LDL, Triglycerides',
      isPopular: true,
      isHomeCollectionAvailable: true
    }
  })

  // Lab
  const lab1 = await prisma.labPartner.create({
    data: {
      name: 'Apollo Diagnostics',
      address: '123 Main St',
      city: 'New York',
      distance: '2.5 km',
      rating: 4.5,
      reviewCount: 120,
      isNablCertified: true,
      isCapCertified: true,
      operatingHours: '8:00 AM - 8:00 PM',
      homeCollectionCharge: 100
    }
  })

  // Prices
  await prisma.labTestPrice.create({
    data: { testId: test1.id, labId: lab1.id, price: 500, discountPercent: 10 }
  })
  await prisma.labTestPrice.create({
    data: { testId: test2.id, labId: lab1.id, price: 800, discountPercent: 15 }
  })

  // Packages
  await prisma.healthPackage.create({
    data: {
      name: 'Basic Master Health Checkup',
      description: 'Comprehensive screening of vital organs for a healthy life.',
      testsIncluded: 'CBC, Lipid Profile, LFT, KFT',
      originalPrice: 2500,
      discountedPrice: 1499,
      discountPercent: 40,
      isBestseller: true
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
