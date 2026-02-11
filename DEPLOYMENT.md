
# 🚀 deployment.md

## 1. Environment Setup

### Backend (.env)
```ini
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... (Secret Key, strictly backend only)
```

### Frontend (.env.local)
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh... (Public Key)
NEXT_PUBLIC_BACKEND_API_URL=https://your-render-app.onrender.com/api (Change to localhost:5000 for dev)
```

---

## 2. Supabase Setup (Database)

1. **Create Project**: Go to [Supabase](https://supabase.com) -> New Project.
2. **SQL Editor**: Copy the contents of `backend/db/schema.sql` and run it in the SQL Editor.
3. **Storage**:
   - Create a bucket named `listings`.
   - Set it to **Public**.
   - Add policy: `INSERT` allowed for Authenticated users.
4. **Auth**:
   - Go to Authentication -> Providers.
   - Enable `Email`.
   - Disable `Confirm email` for faster testing (optional).

---

## 3. Deployment Guide

### 🅰️ Backend (Render.com)
1. Push code to GitHub.
2. Go to Render -> **New Web Service**.
3. Connect your repo.
4. **Root Directory**: `backend`
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `npm start`
7. **Environment Variables**: Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
8. Click **Deploy**.

### 🅱️ Frontend (Vercel)
1. Go to Vercel -> **Add New Project**.
2. Connect your repo.
3. **Root Directory**: `frontend`
4. **Framework Preset**: Next.js.
5. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BACKEND_API_URL` (Set this to your Render Backend URL)
6. Click **Deploy**.

---

## 4. Local Development

1. **Terminal 1 (Backend)**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Terminal 2 (Frontend)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000`.

---
**Enjoy your CampusKart MVP! 🎓**
