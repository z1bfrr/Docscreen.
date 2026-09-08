# DocScreen — AI-Based Fake Identity & Document Screening System
### SIH 2026 Prototype

> **Multi-Layer AI Document Intelligence and Risk Screening**
> Signal Fusion Risk Engine · Explainable AI · Human-in-the-Loop

---

## 🏗 Architecture

```
User → Next.js Frontend → FastAPI Backend → Analysis Pipeline
                                               ├── Preprocessor (OpenCV, PIL)
                                               ├── OCR Engine (Tesseract → EasyOCR fallback)
                                               ├── Template Classifier (CV + keywords)
                                               ├── Pattern Engine (regex + temporal rules)
                                               ├── Forensic Engine (noise/ELA/edge analysis)
                                               ├── QR Engine (pyzbar + cross-field check)
                                               ├── Consistency Engine (cross-field logic)
                                               └── Anomaly Engine (Isolation Forest)
                                                        ↓
                                               Risk Engine (weighted signal fusion)
                                                        ↓
                                               Human Verification → SQLite DB
```

---

## ⚡ Quick Start

### Prerequisites

| Requirement | Install |
|---|---|
| Python 3.11+ | python.org |
| Node.js 18+ | nodejs.org |
| Tesseract OCR | `choco install tesseract` (Windows) or `apt install tesseract-ocr` (Linux) |
| libzbar (for QR) | `choco install zbar` (Windows) or `apt install libzbar0` (Linux) |

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Generate synthetic demo documents
python ..\scripts\generate_demo_documents.py

# Train anomaly model
python ..\scripts\train_anomaly_model.py

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API Docs (Swagger): http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 🎮 Demo Flow (SIH 90-second demo)

1. Open http://localhost:3000
2. Click **Demo Mode → Authentic Document** → expect 🟢 LOW RISK ~12/100
3. Click **Demo Mode → Text Tampered** → expect 🔴 HIGH RISK ~84/100
4. Open **Key Findings** → see tamper + OCR anomalies
5. Open **OCR Fields** → click a field → bbox highlights
6. Open **Risk Score Breakdown** → see weighted signal breakdown
7. Click **Manual Verification** → Reject → logged to DB

---

## 📡 API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/analyze` | POST | Upload + analyze document |
| `/api/analysis/{id}` | GET | Get analysis result |
| `/api/documents` | GET | List all documents |
| `/api/risk-queue` | GET | Pending review queue |
| `/api/review` | POST | Submit human decision |
| `/api/compare` | POST | Compare two analyses |
| `/api/analytics` | GET | Aggregated stats |
| `/api/demo/documents` | GET | List 8 demo docs |
| `/api/demo/run/{name}` | POST | Run demo pipeline |
| `/api/health` | GET | System health check |

---

## 🔬 Risk Score Signals

| Signal | Weight |
|---|---|
| Visual Tamper | 25% |
| Template / Layout | 15% |
| Cross-Field Consistency | 15% |
| ML Anomaly (Isolation Forest) | 15% |
| OCR Anomalies | 10% |
| Pattern Violations | 10% |
| Metadata Anomalies | 5% |
| Image Quality | 5% |

**Thresholds:** 0–30 = LOW · 31–65 = MEDIUM · 66–100 = HIGH

---

## 🚀 Switching to Gemini Pro

After validating the logic, replace `backend/app/ocr/structured_extractor.py`'s
`extract_fields()` function with a Gemini Pro vision-language call.

The integration point is clearly documented in the file:
```python
# ── INTEGRATION POINT FOR GEMINI PRO ──
# Replace this function body with:
#   from app.ocr.gemini_extractor import extract_fields_gemini
#   return extract_fields_gemini(ocr_result, image_bytes)
```

This single swap replaces brittle regex parsing with robust vision-language extraction
with **zero architectural changes** to the rest of the pipeline.

---

## 🐳 Docker

```bash
# Generate demo docs + train model first
cd backend && python ../scripts/generate_demo_documents.py
cd backend && python ../scripts/train_anomaly_model.py

# Build and run
docker-compose up --build
```

---

## ⚠️ Disclaimer

This is a **prototype for SIH 2026**. It is:
- NOT suitable for production government use
- NOT a legal document authenticator
- Using ONLY synthetic/fictional documents
- Designed as a **decision-support screening tool**

All documents in DEMO MODE use fictional names, fictional IDs, and fictional addresses.

---

## 📁 Project Structure

```
PJS/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # FastAPI route handlers
│   │   ├── anomaly/         # Isolation Forest detector
│   │   ├── core/            # Config, DB engine
│   │   ├── forensics/       # EXIF/metadata analysis
│   │   ├── models/          # SQLAlchemy ORM
│   │   ├── ocr/             # OCR engines + field extractor
│   │   ├── pipelines/       # Main pipeline, pattern/QR/consistency
│   │   ├── risk/            # Risk engine
│   │   ├── templates/       # Template store, classifier, layout
│   │   └── vision/          # Preprocessor, tamper detector
│   └── main.py
├── frontend/
│   ├── app/                 # Next.js app router pages
│   └── components/          # Shared React components
├── scripts/
│   ├── generate_demo_documents.py
│   ├── train_anomaly_model.py
│   └── evaluate_model.py
└── data/synthetic/          # Generated demo documents
```
