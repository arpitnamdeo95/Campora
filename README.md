# CampusKart (Beta)

Hyperlocal College Marketplace with **AI Pricing** and **Real-time Chat**.

---

## 🚀 Features

*   **AI Price Estimation**: Rule-based pricing engine suggests fair market value using demand and condition logic.
*   **College-Verified Auth**: Only students can join (email verification via Supabase).
*   **Realtime Marketplace**: Live search, filtering, and instant messaging.
*   **Demand Tracking**: "High Demand" badges based on search volume.
*   **Secure**: Row Level Security (RLS) ensures data privacy.

---

## 🛠 Tech Stack

**Frontend**:
*   Next.js 14 (App Router)
*   Tailwind CSS (Modern UI)
*   Lucide React (Icons)

**Backend**:
*   Node.js + Express
*   Supabase (PostgreSQL, Auth, Storage, Realtime)

---

## 🏃‍♂️ Quick Start

### Prerequisites
*   Node.js 18+
*   Supabase Account

### 1. Setup Database
1.  Create a Supabase Project.
2.  Go to `SQL Editor` and run the script in `backend/db/schema.sql`.
3.  Create a storage bucket named `listings` (Public).

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with your credentials (see .env.example or DEPLOYMENT.md)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env.local file with your credentials
npm run dev
```

Visit `http://localhost:3000` to start trading!

---

## 📂 Project Structure

*   `/backend` - API Logic and Database Schema
    *   `/controllers` - Request handlers
    *   `/services` - Business logic (Price Engine)
    *   `/routes` - API Endpoints
*   `/frontend` - Next.js UI
    *   `/app` - Pages (App Router)
    *   `/components` - Reusable UI

---

## 📜 License
MIT
"# Campora" 
