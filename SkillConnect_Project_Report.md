# SkillConnect Mobile — Complete Project Technical Report
> **Version:** 1.0 | **Date:** April 2026 | **Prepared by:** Engineering Team  
> **Audience:** New developers, technical leads, and stakeholders

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [System Architecture](#4-system-architecture)
5. [Database Design (ERD)](#5-database-design-erd)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [API Reference](#7-api-reference)
8. [Key Workflows & Data Flow](#8-key-workflows--data-flow)
9. [Authentication & Security](#9-authentication--security)
10. [Mobile Shell (Capacitor)](#10-mobile-shell-capacitor)
11. [Environment Variables](#11-environment-variables)
12. [New Developer Onboarding](#12-new-developer-onboarding)
13. [Mobile SPA Architecture (www/)](#13-mobile-spa-architecture-www)
14. [Complete Screen Inventory](#14-complete-screen-inventory)

---

## 1. Project Overview

**SkillConnect** is a marketplace mobile application that connects:
- **Customers** who need skilled labour jobs done
- **Workers** (tradespeople, freelancers) who offer their skills for hire
- **Suppliers** who rent out tools and equipment
- **Admins** who manage the platform, resolve complaints, and verify users

The app is delivered as a native **Android APK** by wrapping a React web frontend inside a **Capacitor shell**. The backend is a standalone **Node.js REST API** backed by **MongoDB Atlas**.

### Core Features

| Feature | Description |
|---|---|
| Authentication | JWT-based register/login for all user roles |
| Job Marketplace | Customers post jobs; workers browse and apply |
| Booking System | Direct worker bookings with scheduling and status tracking |
| Equipment Rental | Suppliers list tools; customers browse and rent |
| Reviews | Post-booking star ratings from both parties |
| Complaints | Users file complaints; admins investigate and resolve |
| Profile Management | Role-specific profile fields with skill listings |

---

## 2. Technology Stack

### Backend (`mobile-backend/`)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20+ |
| Framework | Express | ^4.18.2 |
| Database | MongoDB (via Mongoose) | ^8.0.0 |
| Authentication | JSON Web Token (JWT) | ^9.0.2 |
| Password Hashing | bcryptjs | ^2.4.3 |
| CORS | cors | ^2.8.5 |
| Config | dotenv | ^16.3.1 |
| Dev | nodemon | ^3.0.2 |

### Mobile Shell (`mobile/`)

| Layer | Technology | Version |
|---|---|---|
| Native Wrapper | Capacitor | ^8.2.0 |
| Target Platform | Android (via Android Studio) | Latest |
| Web Runtime | WebView (bundled www/) | — |

### Mobile Frontend (`mobile/www/`)

The mobile frontend is a **Vanilla JS Single-Page Application (SPA)** built directly into the Capacitor `www/` directory. It does **not** use React or a build step.

| Layer | Technology |
|---|---|
| Framework | Vanilla JS (no build step) |
| Routing | Custom hash-based SPA router (`app.js`) |
| HTTP Client | Native `fetch` API |
| Styling | Vanilla CSS (one file per screen) |
| Icons | RemixIcon CDN |
| Fonts | Google Fonts — Inter |

---

## 3. Repository Structure

```
SkillConnect-Mobile/
│
├── README.md
├── SkillConnect_Project_Report.md   # This document
│
├── mobile/                          # Capacitor Android shell
│   ├── capacitor.config.json
│   ├── package.json
│   ├── www/                         # ← Vanilla JS SPA (served by WebView)
│   │   ├── index.html               # Single HTML entry point, loads all CSS/JS
│   │   ├── css/                     # One CSS file per screen
│   │   │   ├── login.css
│   │   │   ├── register.css
│   │   │   ├── home.css
│   │   │   ├── my-profile.css
│   │   │   ├── edit-profile.css
│   │   │   ├── browse-workers.css
│   │   │   ├── worker-profile.css
│   │   │   ├── job-detail.css
│   │   │   ├── job-detail-worker.css
│   │   │   ├── browse-jobs.css
│   │   │   ├── booking-detail.css
│   │   │   ├── booking-detail-worker.css
│   │   │   ├── create-booking.css
│   │   │   ├── my-bookings.css
│   │   │   ├── my-bookings-worker.css
│   │   │   ├── my-applications-worker.css
│   │   │   ├── write-review.css
│   │   │   ├── write-review-worker.css
│   │   │   ├── create-complaint.css
│   │   │   ├── create-complaint-worker.css
│   │   │   ├── my-complaints.css
│   │   │   ├── my-complaints-worker.css
│   │   │   ├── browse-equipment.css
│   │   │   ├── equipment-detail.css
│   │   │   ├── my-equipment.css
│   │   │   ├── add-equipment.css
│   │   │   ├── edit-equipment.css
│   │   │   ├── equipment-detail-supplier.css
│   │   │   ├── all-complaints-admin.css
│   │   │   ├── complaint-detail-admin.css
│   │   │   ├── all-users-admin.css
│   │   │   └── user-detail-admin.css
│   │   └── js/                      # One JS file per screen
│   │       ├── app.js               # Router + navigate() + showToast()
│   │       ├── api.js               # All fetch() wrappers keyed by feature
│   │       ├── login.js
│   │       ├── register.js
│   │       ├── home.js
│   │       ├── my-profile.js
│   │       ├── edit-profile.js
│   │       ├── browse-workers.js
│   │       ├── worker-profile.js
│   │       ├── job-detail.js
│   │       ├── job-detail-worker.js
│   │       ├── browse-jobs.js
│   │       ├── post-job.js
│   │       ├── edit-job.js
│   │       ├── booking-detail.js
│   │       ├── booking-detail-worker.js
│   │       ├── create-booking.js
│   │       ├── my-bookings.js
│   │       ├── my-bookings-worker.js
│   │       ├── my-applications-worker.js
│   │       ├── write-review.js
│   │       ├── write-review-worker.js
│   │       ├── create-complaint.js
│   │       ├── create-complaint-worker.js
│   │       ├── my-complaints.js
│   │       ├── my-complaints-worker.js
│   │       ├── browse-equipment.js
│   │       ├── equipment-detail.js
│   │       ├── my-equipment.js
│   │       ├── add-equipment.js
│   │       ├── edit-equipment.js
│   │       ├── equipment-detail-supplier.js
│   │       ├── all-complaints-admin.js
│   │       ├── complaint-detail-admin.js
│   │       ├── all-users-admin.js
│   │       └── user-detail-admin.js
│   └── android/                     # Native Android Studio project
│       └── app/src/main/
│
└── mobile-backend/                  # Node.js REST API
    ├── server.js
    ├── package.json
    ├── .env
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── User.js
    │   ├── Job.js
    │   ├── Booking.js
    │   ├── Equipment.js
    │   ├── Review.js
    │   └── Complaint.js
    └── routes/
        ├── auth.js
        ├── jobs.js
        ├── bookings.js
        ├── equipment.js
        ├── reviews.js
        ├── complaints.js
        └── profile.js
```

---

## 4. System Architecture

### High-Level Architecture

```mermaid
graph TD
    subgraph "Android Device"
        APK["📱 SkillConnect APK"]
        WV["WebView Layer"]
        CAP["Capacitor Bridge"]
        APK --> WV --> CAP
    end

    subgraph "Frontend (Bundled in www/)"
        REACT["React SPA"]
        ROUTER["React Router"]
        AXIOS["HTTP Client"]
        REACT --> ROUTER
        REACT --> AXIOS
    end

    subgraph "mobile-backend (Node.js)"
        SERVER["server.js\nExpress App"]
        AUTH_MW["middleware/auth.js\nJWT Guard"]
        subgraph "Route Handlers"
            R_AUTH["routes/auth.js"]
            R_JOBS["routes/jobs.js"]
            R_BOOK["routes/bookings.js"]
            R_EQUIP["routes/equipment.js"]
            R_REV["routes/reviews.js"]
            R_COMP["routes/complaints.js"]
            R_PROF["routes/profile.js"]
        end
        SERVER --> AUTH_MW
        AUTH_MW --> R_AUTH
        AUTH_MW --> R_JOBS
        AUTH_MW --> R_BOOK
        AUTH_MW --> R_EQUIP
        AUTH_MW --> R_REV
        AUTH_MW --> R_COMP
        AUTH_MW --> R_PROF
    end

    subgraph "MongoDB Atlas"
        DB[("MongoDB")]
        COL_U["Users Collection"]
        COL_J["Jobs Collection"]
        COL_B["Bookings Collection"]
        COL_E["Equipment Collection"]
        COL_R["Reviews Collection"]
        COL_C["Complaints Collection"]
        DB --> COL_U
        DB --> COL_J
        DB --> COL_B
        DB --> COL_E
        DB --> COL_R
        DB --> COL_C
    end

    CAP --> REACT
    AXIOS -- "HTTP REST\nBearer Token" --> SERVER
    R_AUTH --> COL_U
    R_JOBS --> COL_J
    R_JOBS --> COL_U
    R_BOOK --> COL_B
    R_EQUIP --> COL_E
    R_REV --> COL_R
    R_COMP --> COL_C
    R_PROF --> COL_U
```

### Request Lifecycle

```mermaid
sequenceDiagram
    participant App as 📱 React App
    participant MW as auth Middleware
    participant Route as Route Handler
    participant DB as MongoDB

    App->>Route: HTTP Request + Bearer Token
    Route->>MW: Invoke auth()
    MW->>DB: User.findById(decoded.userId)
    DB-->>MW: User document
    MW-->>Route: req.user & req.userId set
    Route->>DB: Query / Mutation
    DB-->>Route: Result
    Route-->>App: JSON Response {status, data}
```

---

## 5. Database Design (ERD)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string email UK
        string passwordHash
        string firstName
        string lastName
        string phone
        enum role "customer|worker|supplier|admin"
        string district
        string city
        string[] skills
        string bio
        number hourlyRate
        string experience
        string companyName
        boolean isVerified
        boolean isActive
        Date createdAt
        Date updatedAt
    }

    JOB {
        ObjectId _id PK
        ObjectId customer FK
        string jobTitle
        string jobDescription
        string category
        string locationAddress
        string city
        string district
        enum urgencyLevel "emergency|urgent|standard|scheduled"
        number budgetMin
        number budgetMax
        number estimatedDurationHours
        Date preferredStartDate
        enum jobStatus "draft|active|assigned|completed|cancelled|expired"
        Date expiryDate
        number viewsCount
        Date createdAt
        Date updatedAt
    }

    JOB_APPLICATION {
        ObjectId worker FK
        string coverLetter
        number proposedRate
        enum status "pending|accepted|rejected"
        Date appliedAt
    }

    BOOKING {
        ObjectId _id PK
        ObjectId job FK
        ObjectId worker FK
        ObjectId customer FK
        enum bookingStatus "requested|accepted|in_progress|completed|cancelled|rejected"
        Date scheduledDate
        string scheduledTime
        number estimatedDurationHours
        number finalCost
        enum paymentStatus "pending|paid|refunded"
        string notes
        string cancellationReason
        Date cancelledAt
        Date completedAt
        Date createdAt
        Date updatedAt
    }

    EQUIPMENT {
        ObjectId _id PK
        ObjectId supplier FK
        string equipmentName
        string equipmentDescription
        string category
        enum equipmentCondition "new|excellent|good|fair"
        number rentalPricePerDay
        number depositAmount
        number quantityAvailable
        number quantityTotal
        string imagePath
        boolean isAvailable
        Date createdAt
        Date updatedAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId booking FK
        ObjectId reviewer FK
        ObjectId reviewee FK
        enum reviewerType "customer|worker"
        number overallRating "1-5"
        string reviewText
        boolean isVerified
        boolean isFeatured
        Date createdAt
        Date updatedAt
    }

    COMPLAINT {
        ObjectId _id PK
        ObjectId complainant FK
        ObjectId complainedAgainst FK
        ObjectId booking FK
        enum complaintCategory "service_quality|inappropriate_behavior|fraud|payment_issue|other"
        string complaintTitle
        string complaintDescription
        enum complaintStatus "pending|investigating|resolved|rejected"
        enum priority "low|medium|high|urgent"
        string resolutionNotes
        Date resolvedAt
        Date createdAt
        Date updatedAt
    }

    USER ||--o{ JOB : "posts (as customer)"
    JOB ||--o{ JOB_APPLICATION : "receives"
    JOB_APPLICATION }o--|| USER : "submitted by (worker)"
    BOOKING }o--|| JOB : "linked to"
    BOOKING }o--|| USER : "worker"
    BOOKING }o--|| USER : "customer"
    REVIEW }o--|| BOOKING : "for"
    REVIEW }o--|| USER : "reviewer"
    REVIEW }o--|| USER : "reviewee"
    COMPLAINT }o--|| USER : "complainant"
    COMPLAINT }o--|| USER : "complainedAgainst"
    COMPLAINT }o--|| BOOKING : "related to"
    EQUIPMENT }o--|| USER : "owned by (supplier)"
```

---

## 6. User Roles & Permissions

```mermaid
graph LR
    subgraph "Role: customer"
        C1[Post Jobs]
        C2[Browse Workers]
        C3[Create Bookings]
        C4[Browse Equipment]
        C5[Write Reviews]
        C6[File Complaints]
        C7[Manage Own Profile]
    end

    subgraph "Role: worker"
        W1[Browse Active Jobs]
        W2[Apply to Jobs]
        W3[Accept/Reject Bookings]
        W4[Update Booking Status]
        W5[Write Reviews]
        W6[File Complaints]
        W7[Manage Own Profile + Skills]
    end

    subgraph "Role: supplier"
        S1[List Equipment]
        S2[Update Equipment]
        S3[Remove Equipment]
        S4[Manage Own Profile]
    end

    subgraph "Role: admin"
        A1[View ALL Complaints]
        A2[Update Complaint Status]
        A3[Verify Users]
        A4[All Permissions]
    end
```

| Field | customer | worker | supplier | admin |
|---|---|---|---|---|
| `role` value | `customer` | `worker` | `supplier` | `admin` |
| Post jobs | ✅ | ❌ | ❌ | ✅ |
| Apply to jobs | ❌ | ✅ | ❌ | ✅ |
| List equipment | ❌ | ❌ | ✅ | ✅ |
| Create bookings | ✅ | ❌ | ❌ | ✅ |
| View all complaints | ❌ | ❌ | ❌ | ✅ |
| Resolve complaints | ❌ | ❌ | ❌ | ✅ |
| `skills` field | Optional | ✅ Used | ❌ | — |
| `companyName` field | ❌ | ❌ | ✅ Used | — |
| `hourlyRate` field | ❌ | ✅ Used | ❌ | — |

---

## 7. API Reference

> **Base URL:** `http://<SERVER_IP>:5000`  
> **Auth:** All protected routes require `Authorization: Bearer <token>` header.

### 7.1 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ Public | Register new user (any role) |
| `POST` | `/api/auth/login` | ❌ Public | Login and receive JWT |
| `GET` | `/api/auth/me` | ✅ Required | Get current user from token |

**Register Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "0771234567",
  "role": "worker"
}
```

**Login Response:**
```json
{
  "status": "success",
  "data": {
    "token": "<JWT>",
    "userId": "<ObjectId>",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "worker"
  }
}
```

> Token expires after **7 days**.

---

### 7.2 Jobs — `/api/jobs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | ✅ | List active jobs (filter: `?category=&district=&status=`) |
| `GET` | `/api/jobs/my` | ✅ | Get jobs posted by me |
| `GET` | `/api/jobs/:id` | ✅ | Get job detail + applications (increments viewCount) |
| `POST` | `/api/jobs` | ✅ | Create a new job posting |
| `PUT` | `/api/jobs/:id` | ✅ | Update own job |
| `DELETE` | `/api/jobs/:id` | ✅ | Delete own job |
| `POST` | `/api/jobs/:id/apply` | ✅ | Worker applies to job (with coverLetter, proposedRate) |

---

### 7.3 Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookings/my` | ✅ | Get my bookings (`?as=customer` or `?as=worker`) |
| `GET` | `/api/bookings/:id` | ✅ | Get single booking detail |
| `POST` | `/api/bookings` | ✅ | Create booking (customer only) |
| `PATCH` | `/api/bookings/:id/status` | ✅ | Update booking status + optional reason |
| `DELETE` | `/api/bookings/:id` | ✅ | Delete booking (customer only) |

**Booking Status Flow:**

```mermaid
stateDiagram-v2
    [*] --> requested : Customer Creates Booking
    requested --> accepted : Worker Accepts
    requested --> rejected : Worker Rejects
    accepted --> in_progress : Work Begins
    in_progress --> completed : Work Done
    accepted --> cancelled : Either Party Cancels
    in_progress --> cancelled : Either Party Cancels
    completed --> [*]
    cancelled --> [*]
    rejected --> [*]
```

---

### 7.4 Equipment — `/api/equipment`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/equipment` | ✅ | List all available equipment |
| `GET` | `/api/equipment/:id` | ✅ | Get single equipment item detail |
| `POST` | `/api/equipment` | ✅ | Supplier adds new equipment |
| `PUT` | `/api/equipment/:id` | ✅ | Supplier updates own equipment |
| `DELETE` | `/api/equipment/:id` | ✅ | Supplier deletes own equipment |

---

### 7.5 Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reviews` | ✅ | List all reviews |
| `GET` | `/api/reviews/my` | ✅ | Get reviews I have written |
| `POST` | `/api/reviews` | ✅ | Submit a review (linked to a booking) |
| `PUT` | `/api/reviews/:id` | ✅ | Update own review |
| `DELETE` | `/api/reviews/:id` | ✅ | Delete own review |

---

### 7.6 Complaints — `/api/complaints`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/complaints` | ✅ | All complaints (admin sees all; others see own) |
| `GET` | `/api/complaints/my` | ✅ | Get my submitted complaints |
| `POST` | `/api/complaints` | ✅ | Submit a complaint |
| `PATCH` | `/api/complaints/:id/status` | ✅ Admin | Update status + resolutionNotes |
| `DELETE` | `/api/complaints/:id` | ✅ | Delete own complaint |

**Complaint Status Flow:**

```mermaid
stateDiagram-v2
    [*] --> pending : Complaint Filed
    pending --> investigating : Admin Reviews
    investigating --> resolved : Admin Resolves
    investigating --> rejected : Admin Rejects
    resolved --> [*]
    rejected --> [*]
```

---

### 7.7 Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile/me` | ✅ | Get my full profile |
| `PUT` | `/api/profile/me` | ✅ | Update my profile (allowed fields only) |
| `GET` | `/api/profile/workers` | ✅ | List all active workers (`?district=`) |
| `GET` | `/api/profile/workers/:id` | ✅ | Get a specific worker's public profile |

**Updatable Profile Fields:**  
`firstName`, `lastName`, `phone`, `district`, `city`, `skills`, `bio`, `hourlyRate`, `experience`, `companyName`

---

## 8. Key Workflows & Data Flow

### 8.1 User Registration & Login Flow

```mermaid
sequenceDiagram
    participant App as 📱 Mobile App
    participant API as Backend API
    participant DB as MongoDB

    App->>API: POST /api/auth/register {email, password, role}
    API->>DB: User.findOne({email}) — check duplicate
    DB-->>API: null (no duplicate)
    API->>DB: new User().save() — bcrypt hashes password
    DB-->>API: Saved User
    API-->>App: 201 {token, userId, role}

    Note over App: Stores token in localStorage/AsyncStorage

    App->>API: GET /api/auth/me (Authorization: Bearer <token>)
    API->>DB: User.findById(decoded.userId)
    DB-->>API: User document
    API-->>App: 200 {user object}
```

### 8.2 Job Posting & Application Flow

```mermaid
sequenceDiagram
    participant Cust as 👤 Customer App
    participant Work as 🔧 Worker App
    participant API as Backend API
    participant DB as MongoDB

    Cust->>API: POST /api/jobs {jobTitle, category, budget...}
    API->>DB: new Job({...body, customer: req.userId}).save()
    DB-->>API: Job saved
    API-->>Cust: 201 {job}

    Work->>API: GET /api/jobs?category=plumbing&district=Colombo
    API->>DB: Job.find({jobStatus:'active', category, district})
    DB-->>Work: [list of jobs]

    Work->>API: POST /api/jobs/:id/apply {coverLetter, proposedRate}
    API->>DB: job.applications.push({worker, ...})
    DB-->>API: Updated job
    API-->>Work: 201 {Application submitted}

    Cust->>API: GET /api/jobs/:id (view applications)
    API->>DB: Job.findById().populate('applications.worker')
    DB-->>Cust: Job with worker application details
```

### 8.3 Booking Lifecycle Flow

```mermaid
sequenceDiagram
    participant Cust as 👤 Customer
    participant Work as 🔧 Worker
    participant API as Backend API

    Cust->>API: POST /api/bookings {worker, job, scheduledDate, scheduledTime}
    API-->>Cust: 201 Booking (status: requested)

    Work->>API: GET /api/bookings/my?as=worker
    API-->>Work: [bookings list]

    Work->>API: PATCH /api/bookings/:id/status {status: "accepted"}
    API-->>Work: Updated Booking (status: accepted)

    Work->>API: PATCH /api/bookings/:id/status {status: "in_progress"}
    API-->>Work: Updated Booking

    Work->>API: PATCH /api/bookings/:id/status {status: "completed"}
    API-->>Work: Updated Booking (completedAt set)

    Cust->>API: POST /api/reviews {booking, reviewee, overallRating, reviewText}
    API-->>Cust: 201 Review created
```

---

## 9. Authentication & Security

### JWT Middleware (`middleware/auth.js`)

Every protected route passes through the `auth` middleware:

```
Request → Check Authorization header → Extract Bearer token
      → jwt.verify(token, JWT_SECRET) → User.findById()
      → Validate isActive → set req.user & req.userId → next()
```

- Token payload: `{ userId, role }`
- Token TTL: **7 days**
- Tokens are **stateless** — no server-side session storage
- Password stored as **bcrypt hash** (12 salt rounds)
- `toJSON()` override on User model **strips `passwordHash`** from all API responses

> [!WARNING]
> The current implementation does **not** enforce role-based access control (RBAC) at the middleware level for most routes. Role checks (e.g., supplier-only for equipment, admin-only for complaint resolution) are implemented *inline* within route handlers. Future improvement: centralize RBAC middleware.

---

## 10. Mobile Shell (Capacitor)

### Configuration (`mobile/capacitor.config.json`)

```json
{
  "appId": "com.skillconnect.app",
  "appName": "SkillConnect",
  "webDir": "www",
  "bundledWebRuntime": false
}
```

### Build Pipeline

```mermaid
flowchart LR
    A["React Source Code\n(Project ITP/frontend/)"] -->|npm run build| B["dist/ folder"]
    B -->|Copy to| C["mobile/www/"]
    C -->|npx cap sync android| D["Android Project\n(mobile/android/)"]
    D -->|Android Studio Build| E["📦 SkillConnect.apk"]
```

### Step-by-Step Build

```bash
# Step 1: Build the React frontend
cd "Project ITP/frontend"
npm run build

# Step 2: Copy the build to the mobile www/ folder (PowerShell)
Copy-Item -Recurse -Force "dist\*" "..\..\SkillConnect-Mobile\mobile\www\"

# Step 3: Sync and open in Android Studio
cd ..\..\SkillConnect-Mobile\mobile
npx cap sync android
npx cap open android

# Step 4: In Android Studio → Build → Build Bundle(s)/APK(s) → Build APK(s)
```

> [!IMPORTANT]
> For real device testing, set `VITE_API_BASE_URL=http://<LAN_IP>:5000/api` in the frontend `.env`.  
> **Never use `localhost`** — an Android device cannot reach your PC's localhost.

---

## 11. Environment Variables

### `mobile-backend/.env`

```env
# MongoDB Connection String (MongoDB Atlas or local)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# JWT Secret — use a long random string in production
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port (default: 5000)
PORT=5000
```

> [!CAUTION]
> Never commit `.env` to version control. Add it to `.gitignore` immediately.

---

## 12. New Developer Onboarding

### Prerequisites

- [ ] Node.js 20+ installed
- [ ] Android Studio (latest) installed with Android SDK
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] Git access to this repository

### Setup Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd SkillConnect-Mobile

# 2. Set up the backend
cd mobile-backend
npm install

# 3. Create your .env file
cp .env.example .env     # (or create .env manually — see Section 11)
# → Fill in MONGODB_URI and JWT_SECRET

# 4. Start the backend in development mode
npm run dev
# → Should print: "Connected to MongoDB" + "Mobile backend running on http://localhost:5000"

# 5. Test the health endpoint
curl http://localhost:5000/api/health
# → {"status":"ok","message":"SkillConnect Mobile API running"}
```

### Codebase Navigation Guide

| I want to... | Go to... |
|---|---|
| Add a new API endpoint | `routes/<feature>.js` |
| Change a database schema | `models/<Model>.js` |
| Change auth logic | `middleware/auth.js` |
| Register a new route | `server.js` (add `app.use(...)`) |
| Understand data relationships | Section 5 (ERD) above |
| Build the APK | Section 10 above |
| Change app ID or name | `mobile/capacitor.config.json` |

### API Response Convention

All API responses follow this standard envelope:

```json
{
  "status": "success",
  "data": { ... }          // Single object OR { content: [...] } for lists
}
```

Error responses:
```json
{
  "message": "Human-readable error description",
  "error": "Technical error details (dev only)"
}
```

### Running Tests

> Currently, there are **no automated test suites** in this repository.  
> Manual API testing can be done via:
> - **Postman** — Import the endpoints from Section 7 above
> - **curl** — Use the health endpoint as a smoke test
> - **Frontend app** — Run the React dev server against local backend

---

## 13. Mobile SPA Architecture (www/)

The mobile frontend is a **Vanilla JS SPA** running inside the Capacitor WebView. There is no build step — files are served directly.

### Routing (`app.js`)

`app.js` is the SPA shell. It implements a custom client-side router:

```javascript
// Core pattern:
function renderPage(path, params, state) {
    switch(path) {
        case '/login':  renderLogin(app); break;
        case '/worker/bookings/:id': renderBookingDetailWorker(app, state); break;
        // ... one case per route
    }
}

function navigate(pathOrDelta, state = {}) {
    if (typeof pathOrDelta === 'number') return history.go(pathOrDelta);
    history.pushState({ path, params, state }, '', path);
    renderPage(path, params, state);
}
```

### Page Rendering Pattern

Each screen follows a consistent pattern:

```javascript
async function renderMyScreen(appElement, routeState) {
    // 1. Auth/role guard
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // 2. Local state object (replaces useState)
    let s = { isLoading: true, data: null, ... };

    // 3. Pure render function (replaces React render)
    function updateUI() {
        appElement.innerHTML = buildHTML(s);
        // Re-attach DOM refs after innerHTML replacement
    }

    // 4. Single delegated event listener (replaces onClick handlers)
    appElement.addEventListener('click', e => {
        if (e.target.closest('#btn-back')) return navigate(-1);
        // ...
    });

    // 5. Async data fetch
    async function loadData() {
        const res = await api.getSomething();
        s.data = res.data;
        s.isLoading = false;
        updateUI();
    }

    updateUI(); // Show skeleton
    loadData();
}
```

### API Layer (`api.js`)

All `fetch()` calls are centralized in `api.js`:

```javascript
const BASE = import.meta?.env?.VITE_API_BASE_URL
    || window.APP_API_BASE_URL
    || 'http://localhost:5000';

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const api = {
    login: (body) => fetch(`${BASE}/api/auth/login`, { method:'POST', ... }),
    getWorkers: () => fetch(`${BASE}/api/profile/workers`, { headers: headers() }),
    updateBookingStatus: (id, body) => fetch(...),
    // ... one method per API call
};
```

### localStorage Keys

| Key | Type | Description |
|---|---|---|
| `token` | string | JWT Bearer token |
| `userId` | string | Authenticated user's `_id` |
| `role` | string | `customer` \| `worker` \| `supplier` \| `admin` |
| `name` | string | Full name for display |

### Design System Conventions

- **Tap targets:** Minimum `48px` height on all interactive elements
- **Safe area:** All screens use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`
- **Color coding by role:**
  - Customer → Amber (`#D97706`)
  - Worker → Teal (`#0D9488`)
  - Supplier → Blue (`#2563EB`)
  - Admin → Purple/brand-primary
- **Skeleton loading:** `opacity: 1 → 0.4 → 1` pulse on `#E5E7EB` placeholder blocks
- **Toast system:** Global `showToast(message, type)` function in `app.js`
- **Bottom sheets:** Slide-up overlays with backdrop for confirmations and filters

---

## 14. Complete Screen Inventory

### Customer Role

| Screen | Route | JS File | Description |
|---|---|---|---|
| Login | `/login` | `login.js` | JWT login with validation |
| Register | `/register` | `register.js` | Role-based registration |
| Home / Dashboard | `/home` | `home.js` | Role-aware dashboard |
| My Profile | `/profile` | `my-profile.js` | View own profile |
| Edit Profile | `/profile/edit` | `edit-profile.js` | Update profile fields |
| Browse Workers | `/workers` | `browse-workers.js` | Search/filter worker listings |
| Worker Profile | `/workers/:id` | `worker-profile.js` | Public worker profile |
| Browse Jobs | `/jobs` | `browse-jobs.js` | Active job listings (customer) |
| Job Detail | `/jobs/:id` | `job-detail.js` | Full job + application management |
| Post Job | `/jobs/create` | `post-job.js` | Create new job posting |
| Edit Job | `/jobs/:id/edit` | `edit-job.js` | Edit existing job |
| Create Booking | `/bookings/create` | `create-booking.js` | Book a worker |
| My Bookings | `/customer/bookings` | `my-bookings.js` | List own bookings |
| Booking Detail | `/customer/bookings/:id` | `booking-detail.js` | Full booking + cancel flow |
| Write Review | `/reviews/create` | `write-review.js` | Rate worker post-booking |
| File Complaint | `/complaints/create` | `create-complaint.js` | Submit complaint against worker |
| My Complaints | `/customer/complaints` | `my-complaints.js` | View/withdraw own complaints |
| Browse Equipment | `/equipment` | `browse-equipment.js` | Browse rental equipment |
| Equipment Detail | `/equipment/:id` | `equipment-detail.js` | View equipment listing |

### Worker Role

| Screen | Route | JS File | Description |
|---|---|---|---|
| Browse Jobs | `/worker/jobs` | `browse-jobs.js` (shared) | Browse available jobs |
| Job Detail | `/worker/jobs/:id` | `job-detail-worker.js` | Job detail + apply |
| My Applications | `/worker/applications` | `my-applications-worker.js` | View own applications |
| My Bookings | `/worker/bookings` | `my-bookings-worker.js` | Incoming booking requests |
| Booking Detail | `/worker/bookings/:id` | `booking-detail-worker.js` | Accept/reject, status updates |
| Write Review | `/worker/reviews/create` | `write-review-worker.js` | Rate customer post-booking |
| File Complaint | `/worker/complaints/create` | `create-complaint-worker.js` | Submit complaint vs customer |
| My Complaints | `/worker/complaints` | `my-complaints-worker.js` | View/withdraw own complaints |

### Supplier Role

| Screen | Route | JS File | Description |
|---|---|---|---|
| My Equipment | `/supplier/equipment` | `my-equipment.js` | Manage own equipment listings |
| Add Equipment | `/supplier/equipment/add` | `add-equipment.js` | Create new listing |
| Edit Equipment | `/supplier/equipment/:id/edit` | `edit-equipment.js` | Update listing fields |
| Equipment Detail (Own) | `/supplier/equipment/:id` | `equipment-detail-supplier.js` | Performance stats + stock controls |

### Admin Role

| Screen | Route | JS File | Description |
|---|---|---|---|
| All Complaints | `/admin/complaints` | `all-complaints-admin.js` | Platform-wide complaint dashboard |
| Complaint Detail | `/admin/complaints/:id` | `complaint-detail-admin.js` | Investigate + resolve/reject |
| All Users | `/admin/users` | `all-users-admin.js` | List all workers + verify inline |
| User Detail | `/admin/users/:id` | `user-detail-admin.js` | Full profile + moderation actions |

### Screen Count Summary

| Role | Screen Count |
|---|---|
| Customer | 19 |
| Worker | 8 |
| Supplier | 4 |
| Admin | 4 |
| **Total** | **35** |

> Shared screens (profile, home, login, register) serve multiple roles via conditional rendering.

---

*End of Report — SkillConnect Engineering Team, April 2026 (Updated)*
