import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function getDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await getDb();
  
  // Drop tables to force a fresh seed with rich data
  await db.exec(`
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS tests;
    DROP TABLE IF EXISTS packages;
    
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      icon TEXT,
      color TEXT
    );
    
    CREATE TABLE IF NOT EXISTS tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      shortName TEXT,
      categoryId INTEGER,
      description TEXT,
      preparationInstructions TEXT,
      turnaroundTime TEXT,
      sampleType TEXT,
      parameters TEXT,
      isPopular BOOLEAN,
      isHomeCollectionAvailable BOOLEAN,
      price INTEGER,
      labsCount INTEGER
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      testsIncluded TEXT,
      originalPrice INTEGER,
      discountedPrice INTEGER,
      discountPercent INTEGER,
      isBestseller BOOLEAN
    );
  `);

  // Seed Categories
  await db.run(`INSERT INTO categories (name, icon, color) VALUES ('Blood Tests', 'Droplet', '0xFFE8EEFD')`);
  await db.run(`INSERT INTO categories (name, icon, color) VALUES ('Urine Tests', 'FlaskConical', '0xFFE0F7F6')`);
  await db.run(`INSERT INTO categories (name, icon, color) VALUES ('X-Ray', 'Stethoscope', '0xFFEBE3FC')`);
  await db.run(`INSERT INTO categories (name, icon, color) VALUES ('MRI Scan', 'Activity', '0xFFFCE4EC')`);
  
  // Seed Tests
  const tests = [
    { name: 'Complete Blood Count', shortName: 'CBC', cat: 1, desc: 'Measures the cells that make up your blood: red blood cells, white blood cells, and platelets.', prep: 'None', time: 'Same Day', sample: 'Blood', params: '24 params', pop: 1, home: 1, price: 182, labs: 8 },
    { name: 'Liver Function Test', shortName: 'LFT', cat: 1, desc: 'Evaluates liver function and detects liver damage or disease.', prep: 'Fasting 8-10 hours', time: 'Same Day', sample: 'Blood', params: '11 params', pop: 1, home: 1, price: 385, labs: 8 },
    { name: 'Kidney Function Test', shortName: 'KFT', cat: 1, desc: 'Assesses how well your kidneys are working by measuring urea and creatinine.', prep: 'None', time: 'Same Day', sample: 'Blood', params: '9 params', pop: 1, home: 1, price: 360, labs: 8 },
    { name: 'Lipid Profile', shortName: 'Lipid', cat: 1, desc: 'Measures total cholesterol, LDL, HDL, and triglycerides.', prep: 'Fasting 10-12 hours', time: 'Same Day', sample: 'Blood', params: '8 params', pop: 1, home: 1, price: 450, labs: 6 },
    { name: 'Thyroid Profile', shortName: 'T3, T4, TSH', cat: 1, desc: 'Checks thyroid gland function.', prep: 'None', time: '24 Hours', sample: 'Blood', params: '3 params', pop: 1, home: 1, price: 399, labs: 7 },
    { name: 'Routine Urine Analysis', shortName: 'Urine R/M', cat: 2, desc: 'Detects urinary tract infections, kidney disease, and diabetes.', prep: 'First morning sample', time: 'Same Day', sample: 'Urine', params: '15 params', pop: 0, home: 1, price: 150, labs: 12 },
    { name: 'Chest X-Ray PA View', shortName: 'Chest X-Ray', cat: 3, desc: 'Imaging test to look at the heart, lungs, and bones.', prep: 'None', time: 'Same Day', sample: 'N/A', params: '1 param', pop: 0, home: 0, price: 400, labs: 4 },
    { name: 'MRI Brain', shortName: 'MRI', cat: 4, desc: 'Detailed images of the brain and nerve tissues.', prep: 'Remove metal objects', time: '24 Hours', sample: 'N/A', params: '1 param', pop: 0, home: 0, price: 4500, labs: 2 }
  ];

  for (const t of tests) {
    await db.run(
      `INSERT INTO tests (name, shortName, categoryId, description, preparationInstructions, turnaroundTime, sampleType, parameters, isPopular, isHomeCollectionAvailable, price, labsCount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.name, t.shortName, t.cat, t.desc, t.prep, t.time, t.sample, t.params, t.pop, t.home, t.price, t.labs]
    );
  }

  // Seed Packages
  await db.run(`
    INSERT INTO packages (name, description, testsIncluded, originalPrice, discountedPrice, discountPercent, isBestseller)
    VALUES ('AuraLab Full Body Checkup', 'Comprehensive 72-parameter health screening package', '10 tests included', 5500, 1999, 64, 1)
  `);
  await db.run(`
    INSERT INTO packages (name, description, testsIncluded, originalPrice, discountedPrice, discountPercent, isBestseller)
    VALUES ('Diabetes Care Package', 'Complete diabetes management panel', '4 tests included', 1800, 699, 61, 0)
  `);
  await db.run(`
    INSERT INTO packages (name, description, testsIncluded, originalPrice, discountedPrice, discountPercent, isBestseller)
    VALUES ('Womens Advanced Health', 'Specially curated for women over 40', '8 tests included', 4000, 1599, 60, 0)
  `);
}
