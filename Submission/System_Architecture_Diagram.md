# SkillConnect Mobile Platform - System Architecture

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    END USER DEVICES                              │
│              Mobile App (Android) via APK                        │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS/SSL
                     │ (Mobile-to-Server Communication)
                     ↓
        ┌────────────────────────────────────────────┐
        │      API GATEWAY / LOAD BALANCER            │
        │  (nginx - future deployment)                │
        └────────────┬───────────────────────────────┘
                     │
        ┌────────────────────────────────────────────┐
        │    APPLICATION SERVER (Node.js/Express)    │
        │  Port 5000 (Development/Production)        │
        │  - Request Handler                         │
        │  - Business Logic                          │
        │  - API Routes                              │
        └────────────┬───────────────────────────────┘
                     │
        ┌────────────┴──────────────────┬────────────┐
        ↓                               ↓            ↓
    ┌─────────────┐         ┌──────────────┐   ┌──────────────┐
    │   MongoDB   │         │   Redis      │   │   File       │
    │   Database  │         │   Cache      │   │   Storage    │
    │             │         │  (Optional)  │   │  (Logs)      │
    │ Collections:│         │              │   │              │
    │ • Users     │         │ Features:    │   │ Features:    │
    │ • Jobs      │         │ • Query      │   │ • Error Log  │
    │ • Bookings  │         │   caching    │   │ • Access Log │
    │ • Reviews   │         │ • Session    │   │ • Performance│
    │ • Complaints│         │   storage    │   │   Metrics    │
    │ • Equipment │         │              │   │              │
    └─────────────┘         └──────────────┘   └──────────────┘
```

## System Components

### 1. Frontend Layer (Mobile Application)
- **Framework:** React.js
- **Platform:** Capacitor Android
- **Features:**
  - User Interface Components
  - API Integration
  - Local Storage
  - Push Notifications
  - Offline Support (future)

### 2. API Layer (Backend Server)
- **Framework:** Node.js/Express.js
- **Port:** 5000 (Development), 80/443 (Production)
- **Components:**
  - Routes (7 modules)
  - Controllers/Logic
  - Middleware
  - Error Handling
  - Logging

### 3. Data Layer (Database)
- **Primary DB:** MongoDB
- **Cache:** Redis (optional)
- **Features:**
  - Document-based storage
  - Flexible schema
  - Query optimization
  - Indexing
  - Replication (production)

### 4. Storage Layer (Logs & Files)
- **Log Files:** Winston + Morgan
- **Location:** /logs directory
- **Files:**
  - combined.log (all events)
  - error.log (errors only)
  - Performance metrics

## Middleware Architecture

```
Request
  │
  ├─→ CORS Validation
  │
  ├─→ Rate Limiting (Auth endpoints: 5/15min)
  │
  ├─→ Body Parser (JSON)
  │
  ├─→ Request Logger (Morgan → Winston)
  │
  ├─→ Input Sanitization (XSS prevention)
  │
  ├─→ JWT Authentication (if required)
  │
  ├─→ Authorization Check (RBAC)
  │
  ├─→ Route Handler
  │     │
  │     ├─→ Input Validation (Joi)
  │     ├─→ Database Query
  │     ├─→ Business Logic
  │     └─→ Response Formatting
  │
  ├─→ Error Handler
  │
  └─→ Response Logger
        │
        ↓
      Response
```

## Data Flow Architecture

### Authentication Flow
```
User Input (email, password)
    │
    ├─→ XSS Sanitization
    ├─→ Input Validation (Joi)
    ├─→ Check if user exists
    ├─→ Verify password (bcryptjs)
    ├─→ Generate JWT token
    └─→ Return token + user data
```

### Booking Flow
```
User Request (Create Booking)
    │
    ├─→ Validate input (date, cost, etc.)
    ├─→ Check authorization (customer or admin)
    ├─→ Verify job exists and active
    ├─→ Create booking (status: requested)
    ├─→ Log transaction
    └─→ Return booking details
```

## Security Architecture

```
┌─────────────────────────────────────┐
│  REQUEST SECURITY LAYERS            │
├─────────────────────────────────────┤
│ 1. HTTPS/TLS (Transport)            │
│    ↓                                │
│ 2. Rate Limiting (DoS Prevention)   │
│    ↓                                │
│ 3. Input Sanitization (XSS)         │
│    ↓                                │
│ 4. Input Validation (Joi)           │
│    ↓                                │
│ 5. Authentication (JWT)             │
│    ↓                                │
│ 6. Authorization (RBAC)             │
│    ↓                                │
│ 7. Field Filtering (Whitelist)      │
│    ↓                                │
│ 8. Database Operations (Parameterized)|
│    ↓                                │
│ 9. Output Encoding                  │
│    ↓                                │
│ 10. Response Logging               │
└─────────────────────────────────────┘
```

## Database Architecture

### MongoDB Collections

**1. Users Collection**
```
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  role: String (customer, worker, admin),
  ratings: Number,
  reviews: Number,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Indexes: email, role, createdAt
```

**2. Jobs Collection**
```
{
  _id: ObjectId,
  customer: ObjectId (ref: User),
  jobTitle: String,
  description: String,
  category: String,
  budget: Number,
  status: String (active, completed, expired),
  expiryDate: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Indexes: customer, status, expiryDate, createdAt
```

**3. Bookings Collection**
```
{
  _id: ObjectId,
  job: ObjectId (ref: Job),
  customer: ObjectId (ref: User),
  worker: ObjectId (ref: User),
  status: String (requested, accepted, in_progress, completed, cancelled),
  scheduledDate: Date,
  scheduledTime: String,
  cost: Number,
  notes: String,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Indexes: customer, worker, status, scheduledDate
```

**4. Reviews Collection**
```
{
  _id: ObjectId,
  booking: ObjectId (ref: Booking),
  customer: ObjectId (ref: User),
  worker: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
Indexes: booking, worker, rating, createdAt
```

**5. Complaints Collection**
```
{
  _id: ObjectId,
  booking: ObjectId (ref: Booking),
  filed_by: ObjectId (ref: User),
  complaint_type: String,
  description: String,
  status: String (filed, under_review, resolved, closed),
  resolution: String,
  createdAt: Date,
  updatedAt: Date
}
Indexes: booking, status, filed_by, createdAt
```

**6. Equipment Collection**
```
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  owner: ObjectId (ref: User),
  availability: Boolean,
  rentPrice: Number,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
Indexes: category, owner, createdAt
```

## API Architecture

### Endpoint Organization
```
/api/v1/
├── /auth          (4 endpoints: register, login, logout, refresh)
├── /jobs          (5 endpoints: list, create, read, update, delete)
├── /bookings      (5 endpoints: list, create, read, update, cancel)
├── /profile       (3 endpoints: view, update, delete)
├── /reviews       (3 endpoints: list, create, read)
├── /complaints    (3 endpoints: list, create, update)
├── /equipment     (3 endpoints: list, create, delete)
└── /health        (1 endpoint: health check)
```

### Request/Response Pipeline
```
Request
  │
  ├─→ Parse URL & Headers
  ├─→ Route Matching
  ├─→ Middleware Execution
  ├─→ Controller Logic
  │     ├─→ Validate Input
  │     ├─→ Database Query
  │     ├─→ Process Response
  │     └─→ Format Output
  ├─→ Error Handling
  └─→ Send Response
```

## Deployment Architecture

### Development Environment
- Local: Node.js + MongoDB (local or Atlas)
- Server: npm run dev
- Port: 5000
- Database: Development cluster

### Production Environment
- Server: Node.js application server
- Database: MongoDB Atlas or managed service
- Cache: Redis (optional)
- Monitoring: Sentry, Winston logs
- Load Balancing: nginx (optional)
- SSL/TLS: HTTPS only

### Monitoring & Logging
```
Application
    │
    ├─→ Winston Logger (File + Console)
    ├─→ Morgan Logger (HTTP Requests)
    ├─→ Sentry (Error Tracking)
    ├─→ Health Check Endpoint
    └─→ Performance Metrics
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Load balancer distribution
- Database replication
- Redis cluster support

### Vertical Scaling
- Database indexing optimization
- Query result caching
- Connection pooling
- Memory management

### Performance Optimization
- Database indexes on all queries
- Query result pagination
- Redis caching layer
- Response compression
- CDN for static assets (future)

## High Availability

### Fault Tolerance
- Graceful shutdown handling
- Error recovery mechanisms
- Retry logic for failures
- Circuit breaker pattern (future)

### Disaster Recovery
- Database backups
- Point-in-time recovery
- Soft deletes for audit trail
- Transaction support

---

**Document Version:** 1.0  
**Date:** April 2026  
**Status:** Final

Architecture designed for scalability, security, and maintainability.
