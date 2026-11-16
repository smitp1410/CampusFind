# CampusFind — Premium College Campus Lost & Found Platform

> **Editorial Swiss Design &bull; 6-Factor Smart Matching &bull; Verified Ownership Handover &bull; Multi-Role University Portal**

CampusFind is a production-grade digital Lost & Found platform designed exclusively for university campuses. It replaces scattered social media groups, bulletin board flyers, and manual logs with an auditable institutional protocol.

---

## 🏛️ Art Direction & Visual Identity

- **Design Style**: Editorial Swiss design blended with modern brutalism and refined minimalism.
- **Color Palette**:
  - `Warm Ivory`: `#F7F5EF`
  - `Deep Forest`: `#153D32`
  - `Charcoal`: `#1B211F`
  - `Electric Lime`: `#C8F169`
  - `Muted Sage`: `#A7B5A5`
  - `Soft Grey`: `#E6E5DF`
  - `White`: `#FFFFFF`
- **Typography**: Refined modern sans-serif (`Plus Jakarta Sans`), contrasting editorial serif (`Playfair Display`), and technical monospace (`JetBrains Mono`).

---

## ⚡ Smart Matching Engine

CampusFind implements a deterministic 6-factor fuzzy algorithm comparing **LOST** reports against **FOUND** reports:

| Factor | Weight | Evaluation Method |
| :--- | :--- | :--- |
| **Item Name Similarity** | **25%** | Word token overlap and SequenceMatcher ratio |
| **Category Classification** | **20%** | Exact taxonomy match |
| **Location & Floor Proximity** | **20%** | Same building (16 pts) + floor bonus (4 pts); same campus (8 pts) |
| **Incident Date Proximity** | **15%** | Grace period sliding window based on elapsed days |
| **Description Text Overlap** | **10%** | Stop-word filtered token intersection |
| **Color & Finish Match** | **10%** | Primary and accent color keyword matching |

**Classifications**:
- **80% – 100%**: `Strong Match` (High confidence on name, category, and location)
- **50% – 79%**: `Possible Match` (Potential correlation across attributes)
- **Below 50%**: `Low Match`

---

## 🔑 Demo Accounts & Pre-Seeded Credentials

The database comes pre-seeded with realistic university data, item reports, active matches, and claims. All demo accounts use the standard password: `Password123!`

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@campus.edu` | `Password123!` | Full moderation, role management, audit logs |
| **Campus Security Officer** | `officer.miller@campus.edu` | `Password123!` | Claim verification, item moderation, handovers |
| **Faculty Member** | `dr.chen@campus.edu` | `Password123!` | Department reporting and claiming |
| **Student 1** | `elena.rostova@campus.edu` | `Password123!` | Architecture student (Reported lost MacBook Pro) |
| **Student 2** | `liam.hayes@campus.edu` | `Password123!` | Engineering student (Reported lost Hydro Flask) |
| **Student 3** | `priya.patel@campus.edu` | `Password123!` | Biomedical student (Reported lost Backpack) |

*(Note: On the login page, click any of the "Instant Demo Fill" buttons to autofill credentials instantly!)*

---

## 🚀 Quick Start (Running Locally)

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` or run in PowerShell:
```powershell
.\start.ps1
```
This automatically starts both the FastAPI backend (`http://localhost:8000`) and the Vite React frontend (`http://localhost:5173`).

---

### Option 2: Manual Terminal Commands

#### 1. Backend:
```powershell
cd backend
.venv\Scripts\activate
python -m app.seed   # Seeds initial database if not already seeded
python run.py        # Starts FastAPI on http://localhost:8000
```
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- ReDoc Docs: `http://localhost:8000/redoc`

#### 2. Frontend:
```powershell
cd frontend
npm run dev          # Starts Vite on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

Run the backend test suite:
```powershell
cd backend
.venv\Scripts\pytest -v
```
All 10 tests will verify authentication, password hashing, token validation, 6-factor smart matching weights, item creation, and the complete claim/handover lifecycle.

---

## ⚙️ Manual Configuration & Deployment Setup

When deploying to production or connecting to external cloud services, configure the following environment variables in `backend/.env`:

### 1. PostgreSQL / Supabase Database
By default, CampusFind runs locally on SQLite (`sqlite:///./campusfind.db`). To connect to a hosted PostgreSQL instance (e.g. Supabase, Neon, AWS RDS):
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```
Run migrations:
```powershell
alembic upgrade head
```

### 2. Cloudinary Image Storage
By default, if Cloudinary keys are empty, the backend stores images in local storage (`/backend/static_uploads`) with automatic URL serving. For cloud storage, add your free Cloudinary credentials:
```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 3. College Email Domain Verification
To restrict registration to your university's real institutional domains:
```env
ALLOWED_COLLEGE_DOMAINS="youruniversity.edu,alumni.youruniversity.edu"
```
*(Leave as `*` to permit any domain during demo testing).*

### 4. JWT Secret Key
Generate a cryptographically random secret for production token signing:
```env
SECRET_KEY="generate_a_random_64_character_hex_string_here"
```
