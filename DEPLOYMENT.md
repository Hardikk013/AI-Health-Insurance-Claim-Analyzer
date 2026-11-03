# ClaimFight Deployment & Setup Guide

This guide details how to deploy ClaimFight to production on **Render** (Full-Stack Web Service) or across Vercel / n8n Cloud with genuine **Google Gemini Multimodal AI** document analysis.

---

## 1. Environment Variables Configuration

Set these environment variables in your deployment environment (e.g. Render Dashboard or `.env`):

```bash
# Google Gemini Multimodal Document Analysis (Backend only)
GEMINI_API_KEY=AIzaSy...                  # Your Google AI Studio API key
GEMINI_MODEL=gemini-2.0-flash              # Primary model (fallback to gemini-1.5-flash)

# Optional Automation Webhook (if using external n8n)
CLAIM_ANALYSIS_WEBHOOK_URL=https://your-n8n.cloud/webhook/claimfight/analyse

# Server Configuration
PORT=3001
NODE_ENV=production
```

> [!IMPORTANT]
> `GEMINI_API_KEY` is exclusively read by the Node.js backend. It is never exposed in client JavaScript or browser network payloads.

---

## 2. Deploying on Render (Preferred Full-Stack Architecture)

1. Connect your GitHub repository: `https://github.com/Hardikk013/AI-Health-Insurance-Claim-Analyzer`
2. Create a **New Web Service**:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/)
   - `GEMINI_MODEL`: `gemini-2.0-flash`
4. Click **Deploy Web Service**.
   - Render will build the frontend (`dist/`), start the Express backend on `PORT`, and serve both the API endpoints (`/api/*`) and the static React app.

---

## 3. Local Development

Run the frontend and backend together:

```bash
# Terminal 1: Start Backend Server
npm run server

# Terminal 2: Start Vite Dev Server
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api/health`
- Vite automatically proxies `/api/*` requests to the backend server.

---

## 4. API Endpoints

- `POST /api/cases/analyze`: Accepts 3 multipart files (`rejection`, `policy`, `discharge`). Starts asynchronous Gemini analysis.
- `GET /api/cases/:id/status`: Polls real-time step progress (Step 1 to 6).
- `GET /api/cases/:id/result`: Returns validated structured JSON response conforming to the ClaimFight contract.
- `POST /api/cases/:id/appeal`: Refines / personalizes grievance appeal letter.
- `POST /api/cases/:id/ombudsman`: Refines Insurance Ombudsman complaint.
- `POST /api/admin/config`: Allows updating Gemini API key and model dynamically.
- `GET /api/health`: Health status and Gemini readiness indicator.

---

## 5. Security & 24-Hour Purge

- Uploaded files are processed in a private temporary directory (`uploads/temp/`).
- Files are automatically deleted from disk immediately upon completion of analysis or purged after 24 hours.
- Documents are never used for model training or permanently logged.
