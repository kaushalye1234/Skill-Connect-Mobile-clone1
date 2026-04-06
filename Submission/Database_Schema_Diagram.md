# SkillConnect Mobile Platform - Database Schema Diagram

## Database Overview

### Database Type
- **Primary Database:** MongoDB (NoSQL, Document-based)
- **Total Collections:** 6
- **Total Fields:** 70+
- **Indexes:** 15+ on key fields
- **Relationships:** All relationships via ObjectId references

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                                │
└──────────────────────────────────────────────────────────────────┘

                          ┌──────────────┐
                          │   USERS      │
                          │   (Primary)  │
                          └──────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ↓            ↓            ↓
            ┌──────────────┐ ┌────────┐ ┌──────────────┐
            │    JOBS      │ │BOOKINGS│ │  COMPLAINTS  │
            │ (posted by)  │ │(between)  │(by customers)
            └──────┬───────┘ └────┬───┘ └──────┬───────┘
                   │              │             │
                   │         ┌────┴─────┐       │
                   │         │           │       │
                   ↓         ↓           ↓       ↓
            ┌──────────────────────┐  ┌──────────────┐
            │     REVIEWS          │  │ (referenced) │
            │(for completed jobs)  │  └──────────────┘
            └──────────────────────┘

            ┌──────────────────────────────────┐
            │      EQUIPMENT (optional)        │
            │      (owned by workers)          │
            └──────────────────────────────────┘
```

---

## Collection Schemas

### 1. USERS Collection

**Purpose:** Store user information (customers, workers, admins)

**Schema:**
```
Users: {
  _id: ObjectId (auto-generated),
  firstName: String (required, max 50),
  lastName: String (required, max 50),
  email: String (required, unique, indexed),
  password: String (required, hashed with bcryptjs),
  phone: String (format validation),
  role: String (enum: "customer", "worker", "admin"),
  profilePhoto: String (URL),
  skills: Array[String] (for workers),
  ratings: Number (0-5, average),
  totalReviews: Number,
  bio: String (max 500),
  location: String,
  verificationStatus: String (verified, pending, rejected),
  isDeleted: Boolean (default: false, soft delete),
  deletedAt: Date (when deleted),
  createdAt: Date (auto-set),
  updatedAt: Date (auto-update)
}

Indexes:
  • email (unique, ascending)
  • role (ascending)
  • createdAt (descending)
  • ratings (descending)
```

---

### 2. JOBS Collection

**Purpose:** Store job listings posted by customers

**Schema:**
```
Jobs: {
  _id: ObjectId (auto-generated),
  customer: ObjectId (ref: Users._id, required),
  jobTitle: String (required, max 100),
  description: String (required, max 1000),
  category: String (enum: cleaning, repair, teaching, etc.),
  subcategory: String,
  budget: Number (required, min: 0),
  location: String (required),
  
  status: String (enum: "active", "pending", "completed", "cancelled"),
  
  expiryDate: Date (future date validation),
  startDate: Date,
  endDate: Date,
  
  skills_required: Array[String],
  qualifications_required: String,
  
  applicants: Array[ObjectId] (ref: Users._id),
  selectedWorker: ObjectId (ref: Users._id),
  
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  • customer (ascending)
  • status (ascending)
  • expiryDate (ascending)
  • category (ascending)
  • createdAt (descending)
```

---

### 3. BOOKINGS Collection

**Purpose:** Manage booking transactions between customers and workers

**Schema:**
```
Bookings: {
  _id: ObjectId (auto-generated),
  
  job: ObjectId (ref: Jobs._id, required),
  customer: ObjectId (ref: Users._id, required),
  worker: ObjectId (ref: Users._id, required),
  
  status: String (enum: "requested", "accepted", "in_progress", 
                                     "completed", "cancelled"),
  
  scheduledDate: Date (required, future date),
  scheduledTime: String (format: HH:MM),
  estimatedDuration: Number (in hours),
  
  cost: Number (required, positive),
  currency: String (default: "USD"),
  paymentStatus: String (enum: "pending", "paid", "refunded"),
  paymentMethod: String,
  
  notes: String (customer notes),
  updates: Array (status update history),
  
  cancellation: {
    cancelledBy: ObjectId,
    reason: String,
    timestamp: Date
  },
  
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  • customer (ascending)
  • worker (ascending)
  • status (ascending)
  • scheduledDate (ascending)
  • job (ascending)
  • createdAt (descending)

Status Transitions (Validated):
  requested → accepted | rejected
  accepted → in_progress | cancelled
  in_progress → completed | cancelled
  completed → [terminal]
```

---

### 4. REVIEWS Collection

**Purpose:** Store customer reviews and ratings for completed work

**Schema:**
```
Reviews: {
  _id: ObjectId (auto-generated),
  
  booking: ObjectId (ref: Bookings._id, required),
  customer: ObjectId (ref: Users._id, required),
  worker: ObjectId (ref: Users._id, required),
  
  rating: Number (required, enum: 1, 2, 3, 4, 5),
  comment: String (max 500),
  
  categories: {
    quality: Number (1-5),
    communication: Number (1-5),
    timeliness: Number (1-5),
    professionalism: Number (1-5)
  },
  
  helpful_count: Number (upvotes),
  
  photos: Array[String] (URLs),
  
  isDeleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  • booking (ascending, unique)
  • worker (ascending)
  • customer (ascending)
  • rating (ascending)
  • createdAt (descending)
```

---

### 5. COMPLAINTS Collection

**Purpose:** Handle customer complaints and disputes

**Schema:**
```
Complaints: {
  _id: ObjectId (auto-generated),
  
  booking: ObjectId (ref: Bookings._id, required),
  filed_by: ObjectId (ref: Users._id, required),
  filed_against: ObjectId (ref: Users._id),
  
  complaint_type: String (enum: "quality", "behavior", "safety", "other"),
  description: String (required, max 1000),
  evidence: Array[String] (photo URLs),
  
  status: String (enum: "filed", "under_review", "resolved", "closed"),
  priority: String (enum: "low", "medium", "high", "critical"),
  
  assigned_to: ObjectId (ref: Users._id, admin),
  
  resolution: String (max 500),
  resolution_date: Date,
  refund_amount: Number,
  
  notes: Array[{
    author: ObjectId,
    text: String,
    timestamp: Date
  }],
  
  isDeleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  • booking (ascending)
  • filed_by (ascending)
  • status (ascending)
  • priority (ascending)
  • assigned_to (ascending)
  • createdAt (descending)

Resolution Workflow:
  filed → under_review → resolved → closed
```

---

### 6. EQUIPMENT Collection

**Purpose:** Store equipment available for rental

**Schema:**
```
Equipment: {
  _id: ObjectId (auto-generated),
  
  name: String (required, max 100),
  description: String (max 500),
  category: String (required),
  
  owner: ObjectId (ref: Users._id, required),
  
  rentPrice: Number (required, per day/hour),
  rentUnit: String (enum: "hour", "day", "week"),
  
  availability: Boolean (default: true),
  availableFrom: Date,
  availableTo: Date,
  
  specifications: {
    brand: String,
    model: String,
    condition: String,
    year: Number
  },
  
  photos: Array[String] (URLs),
  
  booking_history: Array[ObjectId] (ref: Bookings._id),
  
  ratings: Number (0-5),
  reviews_count: Number,
  
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  • owner (ascending)
  • category (ascending)
  • availability (ascending)
  • rentPrice (ascending)
  • createdAt (descending)
```

---

## Index Strategy

### Performance Indexes

| Collection | Field | Type | Purpose |
|-----------|-------|------|---------|
| Users | email | unique | Fast user lookup |
| Users | role | ascending | Filter by user type |
| Users | createdAt | descending | Recent users |
| Jobs | customer | ascending | User's jobs |
| Jobs | status | ascending | Filter active jobs |
| Jobs | expiryDate | ascending | Find expired jobs |
| Bookings | customer | ascending | Customer's bookings |
| Bookings | worker | ascending | Worker's assignments |
| Bookings | status | ascending | Filter by status |
| Reviews | worker | ascending | Worker's reviews |
| Reviews | booking | unique | One review per booking |
| Complaints | status | ascending | Track complaints |
| Equipment | owner | ascending | Owned equipment |
| Equipment | category | ascending | Browse equipment |

### Index Statistics
- **Total Indexes:** 15+
- **Unique Indexes:** 3 (email, booking→review, review→booking)
- **Compound Indexes:** Planned for common queries
- **Index Size:** ~2-5MB (depends on data volume)

---

## Data Validation Rules

### Field Validation

**Email Fields:**
```
Pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
Example: user@example.com
```

**Phone Fields:**
```
Pattern: ^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$
Example: +94771234567
```

**Dates:**
```
- Start dates must be in future
- End dates must be after start dates
- Expiry dates must be after creation date
```

**Numbers:**
```
- Ratings: 1-5 (inclusive)
- Budget: >= 0
- Cost: > 0
- Duration: > 0
```

---

## Data Relationships

### Reference Map

```
Users
  ├─→ Jobs (customer_id)
  ├─→ Bookings (customer_id, worker_id)
  ├─→ Reviews (customer_id, worker_id)
  ├─→ Complaints (filed_by_id, filed_against_id)
  └─→ Equipment (owner_id)

Jobs
  ├─→ Users (customer_id) [Many-to-One]
  ├─→ Bookings (job_id) [One-to-Many]
  └─→ Reviews (via Bookings)

Bookings
  ├─→ Jobs (job_id) [Many-to-One]
  ├─→ Users (customer_id, worker_id) [Many-to-One]
  ├─→ Reviews (booking_id) [One-to-One]
  └─→ Complaints (booking_id) [One-to-Many]

Reviews
  ├─→ Bookings (booking_id) [Many-to-One]
  └─→ Users (customer_id, worker_id) [Many-to-One]

Complaints
  ├─→ Bookings (booking_id) [Many-to-One]
  └─→ Users (filed_by_id, filed_against_id) [Many-to-One]

Equipment
  └─→ Users (owner_id) [Many-to-One]
```

---

## Soft Delete Implementation

### Strategy
- **Approach:** Flag-based soft delete
- **Flag:** `isDeleted: Boolean (default: false)`
- **Timestamp:** `deletedAt: Date (null if not deleted)`

### Query Pattern
```javascript
// Before querying, automatically filter:
{
  isDeleted: false,
  // OR include with soft delete flag
}

// Example: Get active jobs
db.Jobs.find({
  isDeleted: false,
  status: "active"
})
```

### Benefits
- Preserves data for audit trail
- Allows recovery
- Maintains referential integrity
- Soft delete can be reversed

---

## Backup & Recovery

### Backup Strategy
- MongoDB Atlas automatic backups
- Point-in-time recovery available
- Daily snapshots
- Retention: 30 days

### Recovery Procedure
```
1. Identify recovery point
2. Restore from backup
3. Validate data integrity
4. Perform tests
5. Switch to recovered database
```

---

## Performance Optimization

### Query Optimization
- Indexes on all filtered fields
- Pagination (20 items/page default)
- Projection (select only needed fields)
- Connection pooling

### Expected Performance
- Single document lookup: ~5ms
- Indexed query: ~10ms
- List with pagination: ~20-30ms
- Complex query: ~50-100ms

---

**Document Version:** 1.0  
**Date:** April 2026  
**Collections:** 6  
**Total Fields:** 70+  
**Indexes:** 15+  
**Status:** Final

Database designed for scalability, reliability, and optimal query performance.
