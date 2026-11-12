# NEET 2027 Future Score Predictor & MBBS Admission Guidance Portal

A production-ready, mobile-first web application designed for Indian NEET 2027 medical aspirants (Class 11, Class 12, and repeaters). It provides a viral score challenge with downloadable scorecards, transparent deterministic scoring, and opt-in MBBS admission counselling lead generation.

Built with **React 19, Vite, Tailwind CSS v4, and Supabase PostgreSQL & Supabase Auth**.

---

## 🌟 Key Highlights & Features

1. **Viral Score Challenge & Instant Results**:
   - Zero-friction score prediction: **No phone number is required** to see the score!
   - Calculates projected NEET 2027 scores (capped at 720) with realistic range variance (+/- 15-25 marks).
   - Generates high-resolution **Downloadable Scorecard PNGs** rendered directly via HTML5 Canvas.
   - 1-click **WhatsApp Sharing** (`wa.me` encoded link with score and challenge invitation) and mobile **Web Share API** integration.

2. **100% Deterministic & Transparent Scoring**:
   - **No generative AI or black-box algorithms.** All calculations use an openly documented formula based on:
     - Baseline mock test score midpoint (260 to 650)
     - Daily self-study hours compounding over remaining months
     - Syllabus completion percentage (Section B question unlocking)
     - Timeline multiplier until May 2027 exam session
     - Current preparation stage (Class 11, Class 12, Dropper)
   - Subject breakdown: **Biology (360 marks: Botany 180 + Zoology 180), Physics (180 marks), and Chemistry (180 marks)**.
   - College tier benchmarking: AIIMS/Top Central Institutes, Top State GMCs, State Quota GMCs, Semi-Govt, and WHO/NMC recognized MBBS abroad universities.

3. **Ethical Opt-in Lead Generation (DPDP Act 2023 Compliant)**:
   - Non-blocking: Students can enjoy their results without submitting lead details.
   - **Separate unchecked consent checkbox** required for counselling contact.
   - **Minor protection flow**: Requires parent/guardian name for applicants under 18.
   - Explicit zero-spam guarantee: Data is never used for behavioral advertising or sold to marketing brokers.
   - Self-serve **Data Deletion / Erasure request page** to purge records at any time.

4. **Secure Admin Portal (`/admin` or `#admin`)**:
   - Authenticated via **Supabase Auth** with strict Row Level Security (RLS).
   - Real-time KPIs: Total Predictions, Total Consented Leads, Today's Leads, Conversion Rate (%), Average Predicted Score.
   - Searchable, filterable, and paginated lead table.
   - Contact status pipeline updater (`New`, `Contacted`, `Interested`, `Converted`, `Not Interested`).
   - 1-click **Export to CSV**.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Lucide React, Canvas Confetti
- **Styling**: Tailwind CSS v4, custom glassmorphism and modern medical blue/purple gradients
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth
- **Hosting**: Free static hosting ready (Cloudflare Pages, Vercel, Netlify, or GitHub Pages)

---

## 🚀 Supabase Database & Backend Architecture

The `/supabase` directory contains production-ready PostgreSQL backend configurations:

```
supabase/
├── migrations/
│   ├── 20270101_init.sql                         # Base schema, RLS policies, leads, prediction_events
│   └── 20270102_stored_procedures_and_metrics.sql # Stored procedures (RPC), triggers, anti-spam, server metrics
├── functions/
│   └── lead-alert/index.ts                       # Supabase Edge Function for webhook notifications
├── config.toml                                   # Local development config (supabase start)
└── seed.sql                                      # Intentionally empty; production starts with no sample rows
```

### Applying Migrations to Supabase:
1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Run every file in `supabase/migrations` in filename order.
4. Create an administrator in **Authentication > Users**.
5. Authorize your admin user in the `admin_users` table:
   ```sql
   INSERT INTO public.admin_users (id, email, role)
   VALUES ('<YOUR_AUTH_USER_UUID>', 'admin@neet2027.com', 'admin');
   ```

---

## ⚡ Deploying to Vercel (Production Ready)

This repository includes a `vercel.json` file configured with Single-Page Application (SPA) routing rewrites and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).

### Method 1: Vercel Dashboard (Zero Config)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Import Project** and select your repository.
3. Framework Preset will automatically detect **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
5. Click **Deploy**. Vercel will build and serve your app globally with edge routing.

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🌐 Alternative: Deploy to Cloudflare Pages (Free Static Hosting)

1. Push your repository to GitHub or GitLab.
2. In [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages > Create application > Pages > Connect to Git**.
3. Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
5. Click **Save and Deploy**.

---

## 🔐 Admin Portal Credentials

- Visit `/admin` or `#admin` on your website.
- Sign in with the Supabase Auth administrator account that is listed in `admin_users`.

---

## ⚖️ Legal & Compliance Disclaimers

- **Non-Scientific Estimation**: The score predictor is an illustrative benchmark tool for self-study planning. It is not an official NTA exam prediction.
- **Trademarks**: NEET is a registered trademark of the National Testing Agency (NTA). This website has no affiliation or endorsement from NTA.
- **Data Privacy**: Built in compliance with India's **Digital Personal Data Protection (DPDP) Act, 2023**. Minors require parental consent.

