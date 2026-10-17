import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, Base, async_session_maker
from app.models.test import TestCategory, DiagnosticTest, HealthPackage
from app.models.lab import LabPartner, LabTestPrice
from app.core.security import get_password_hash
from app.models.user import User

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_maker() as session:
        # Create test user
        user = User(
            email="test@labe.com",
            hashed_password=get_password_hash("password"),
            full_name="Test User",
            phone="1234567890",
            is_active=True
        )
        session.add(user)

        # Categories
        cat1 = TestCategory(name="Blood", icon="bloodtype", color="0xFFE57373")
        cat2 = TestCategory(name="Urine", icon="water_drop", color="0xFF81C784")
        cat3 = TestCategory(name="Full Body", icon="accessibility", color="0xFF64B5F6")
        
        session.add_all([cat1, cat2, cat3])
        await session.commit()
        await session.refresh(cat1)

        # Tests
        test1 = DiagnosticTest(
            name="Complete Blood Count",
            short_name="CBC",
            category_id=cat1.id,
            description="Evaluates overall health and detects a wide range of disorders.",
            preparation_instructions="Fasting for 8 hours recommended.",
            turnaround_time="24 Hours",
            sample_type="Blood",
            parameters="Hemoglobin, RBC, WBC, Platelets",
            is_popular=True,
            is_home_collection_available=True
        )
        test2 = DiagnosticTest(
            name="Lipid Profile",
            short_name="Lipid",
            category_id=cat1.id,
            description="Measures the amount of cholesterol and triglycerides in your blood.",
            preparation_instructions="Fasting for 10-12 hours is required.",
            turnaround_time="24 Hours",
            sample_type="Blood",
            parameters="Total Cholesterol, HDL, LDL, Triglycerides",
            is_popular=True,
            is_home_collection_available=True
        )
        session.add_all([test1, test2])
        
        # Labs
        lab1 = LabPartner(
            name="Apollo Diagnostics",
            address="123 Main St",
            city="New York",
            distance="2.5 km",
            rating=4.5,
            review_count=120,
            is_nabl_certified=True,
            is_cap_certified=True,
            operating_hours="8:00 AM - 8:00 PM",
            home_collection_charge=100
        )
        session.add(lab1)
        await session.commit()
        await session.refresh(test1)
        await session.refresh(test2)
        await session.refresh(lab1)

        # Prices
        price1 = LabTestPrice(test_id=test1.id, lab_id=lab1.id, price=500, discount_percent=10)
        price2 = LabTestPrice(test_id=test2.id, lab_id=lab1.id, price=800, discount_percent=15)
        session.add_all([price1, price2])

        # Packages
        pkg1 = HealthPackage(
            name="Basic Master Health Checkup",
            description="Comprehensive screening of vital organs for a healthy life.",
            tests_included="CBC, Lipid Profile, LFT, KFT",
            original_price=2500,
            discounted_price=1499,
            discount_percent=40,
            is_bestseller=True
        )
        session.add(pkg1)

        await session.commit()
        print("Database initialized with seed data successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
