import express from 'express';
import cors from 'cors';
import { getDb, initDb } from './db';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Welcome to LabE Node.js API' });
});

app.get('/api/v1/tests/categories', async (req, res) => {
  const db = await getDb();
  const categories = await db.all('SELECT * FROM categories');
  res.json(categories);
});

app.get('/api/v1/tests', async (req, res) => {
  const db = await getDb();
  const tests = await db.all('SELECT tests.*, categories.name as categoryName, categories.icon as categoryIcon FROM tests LEFT JOIN categories ON tests.categoryId = categories.id');
  res.json(tests);
});

app.get('/api/v1/tests/popular', async (req, res) => {
  const db = await getDb();
  const tests = await db.all('SELECT tests.*, categories.name as categoryName FROM tests LEFT JOIN categories ON tests.categoryId = categories.id WHERE isPopular = 1 LIMIT 10');
  res.json(tests);
});

app.get('/api/v1/packages', async (req, res) => {
  const db = await getDb();
  const packages = await db.all('SELECT * FROM packages');
  res.json(packages);
});

const PORT = process.env.PORT || 8000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(console.error);
