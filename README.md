# Wissen Seat Booking System (Production Ready)

A dynamic, scalable, and configurable web-based Seat Booking System designed for the hybrid workforce model, matching the exact requirements of Wissen.

## Features Implemented

*   **Hybrid Roster Rules**: Supports 2 batches (40 users each) with 50 total seats.
*   **Intelligent Two-Week Rotation**: Automatically assigns Batch 1 to Mon/Tue/Wed (Week 1) and Thu/Fri (Week 2), swapping with Batch 2.
*   **Time & Constraint Based Booking**: 
    *   Bookings must be made before 3:00 PM on regular days (IST timezone).
    *   Advance bookings up to 2 weeks out.
    *   No double-booking a single seat on the same day.
    *   Non-assigned regular day booking available *only after* 3 PM of the previous day, enforcing dynamic buffer logic.
*   **Live Available Capacity (Dynamic Buffer)**: Visual availability updates in real-time.
*   **Admin Dashboard**: Manage and revoke bookings dynamically; observe occupancy.
*   **Tech Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, ShadCN UI, Supabase (PostgreSQL & Auth).

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm
- A Supabase Project (Create one at [https://supabase.com](https://supabase.com))

### 2. Environment Variables
Create a `.env.local` file at the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-for-seed
```

### 3. Database Schema setup
Navigate to your Supabase SQL Editor and run the entire contents of `supabase/schema.sql` to configure the tables, unique constraints, and Row-Level Security policies.

### 4. Seed Data
We have provided a fully automated node.js seed script to generate all 80 generic employees according to Batch 1 and Batch 2 schemas, plus one Admin User.

Ensure `SUPABASE_SERVICE_ROLE_KEY` is inside `.env.local` to allow bypassing Supabase Auth restrictions.

Run the seed script:
```sh
node seed.js
```

**Demo accounts created by seed:**
*   Admin: `admin@wissen.com` | `password123`
*   User (Batch 1): `b1.user1@wissen.com` | `password123`
*   User (Batch 2): `b2.user1@wissen.com` | `password123`

### 5. Running the Application
Install dependencies and run the local development server:

```sh
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Technical Highlight: Rules Engine
Found in `src/utils/bookingRules.ts`, this rules engine handles all edge cases utilizing `date-fns-tz` to enforce the strict 3:00 PM `Asia/Kolkata` cutoff times and dynamic logic without affecting the UI timeline. All data operations utilize server-side Row Level Security to prevent unauthorized endpoint access or double booking.
# seat-booking-system
