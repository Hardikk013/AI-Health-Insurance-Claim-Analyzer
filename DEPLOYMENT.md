# ClaimFight Deployment & Setup Guide

This guide details how to deploy ClaimFight to production across Vercel (Frontend), Supabase Cloud (Database, Auth, Storage, Cron), and n8n Cloud (Automation & AI Orchestration).

---

## 1. Frontend Deployment on Vercel

### Step A: Push Code to GitHub / GitLab
```bash
git init
git add .
git commit -m "feat: complete ClaimFight hackathon web app"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step B: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Framework Preset: **Vite**.
4. Set Root Directory: `./`
5. Configure Environment Variables in Vercel Project Settings:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anonymous key
   - `VITE_N8N_WEBHOOK_URL`: Your n8n Cloud webhook endpoint (`https://your-tenant.app.n8n.cloud/webhook/claimfight/analyse`)
6. Click **Deploy**. Vercel will build and assign your production domain.

---

## 2. Supabase Cloud Configuration

1. Create a project at [database.new](https://database.new).
2. Navigate to **SQL Editor**.
3. Copy the full contents of `supabase/schema.sql` into the editor and click **Run**.
   - Creates tables: `profiles`, `cases`, `documents`, `extracted_text`, `clauses`, `rejection_reasons`, `comparisons`, `letters`, `official_rules`, `audit_log`.
   - Seeds official rules: Ombudsman financial ceiling (₹30 Lakhs), 60-month moratorium, room rent circulars, etc.
   - Activates Row Level Security (RLS) policies.
   - Schedules the hourly auto-purge cron job.
4. Go to **Storage**:
   - Create a new bucket named `claim_documents`.
   - Toggle **Public bucket: OFF** (Private bucket only).
5. Go to **Project Settings** -> **API**:
   - Note the `Project URL` and `anon public` key.
   - Store `service_role` key securely for n8n Cloud.

---

## 3. n8n Cloud Automation Workflow Setup

1. Log into your [n8n Cloud](https://n8n.io) workspace.
2. In the workflows section, click the **+ (Create)** button.
3. Click the three dots menu (top right) -> **Import from File**.
4. Select `n8n/claimfight_analysis_workflow.json` from the repository.
5. Setup the required credentials in n8n:
   - **Anthropic API**: Input your Anthropic API Key (`ANTHROPIC_API_KEY`). Ensure Claude 3.5 Sonnet access is enabled.
   - **Google Cloud Vision (Optional for OCR)**: Service account JSON or API Key.
   - **Environment Variables in n8n**:
     - `SUPABASE_URL`: Your Supabase project URL.
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key.
6. Click **Save** and toggle the workflow to **Active**.
7. Copy the production webhook URL from the `Webhook: POST /claimfight/analyse` node and update `VITE_N8N_WEBHOOK_URL` in your Vercel / `.env` settings.

---

## 4. Testing End-to-End Live Execution

1. Open your deployed Vercel URL.
2. Click **"New Case"**.
3. Upload the 3 sample PDFs generated in `/public/samples` (or click one of the quick sample auto-fill buttons).
4. Check the mandatory DPDP Act consent checkbox.
5. Click **"Run Multi-Step Analysis"**.
6. Watch the live 6-step progress screen complete within 60 seconds.
7. Inspect the **Result Screen** side-by-side view ("Insurer says" vs "Policy says" vs "Medical fact").
8. Click any quoted line to open the source document viewer with the highlighted quote.
9. Click **"Draft Grievance Appeal"** to edit the letter, fill in any missing details, and download as PDF (`jsPDF`) or Word (`docx`).

---

## 5. Security & Verification Checklist

- [x] HTTPS only on Vercel and Supabase
- [x] RLS enabled on all Supabase tables
- [x] Storage bucket private; 15-minute signed URLs
- [x] No health data or document text stored in server logs
- [x] 24-Hour hourly purge configured via `public.purge_expired_claim_data()`
- [x] Zero model training guarantee verified
- [x] Persistent non-legal-advice banner rendered across application
