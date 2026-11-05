# ClaimFight Redesign Migration Notes & Safety Checklist

This checklist inventories all routes, API endpoints, forms, and stateful features to guarantee that 100% of the backend logic, API contracts, and user data flows remain fully operational during and after the visual redesign.

---

## 1. Routes Inventory

| URL Route | Page Component | Purpose | Status |
|---|---|---|:---:|
| `/` | `LandingPage.tsx` | Home page: Hero, Dropzone, 3-step explanation, live scanner demo, 4 core grounds, sample cases, trust stats, FAQ, CTA | Preserved |
| `/new` | `NewCasePage.tsx` | Multi-step case creation flow (Step 1-5) | Preserved |
| `/new-case` | `NewCasePage.tsx` | Alias for `/new` | Preserved |
| `/case/:id` | `ResultPage.tsx` | Direct route to view a specific analyzed case by ID | Supported |
| `/result` | `ResultPage.tsx` | Active case audit, 5-figure financial breakdown, date/continuity credit audit, Ombudsman Rule 17 verification, document comparisons, actions | Preserved |
| `/processing` | `ProcessingPage.tsx` | Animated step-by-step document analysis with real-time status updates | Preserved |
| `/appeal` | `AppealEditorPage.tsx` | Formal Grievance Redressal Appeal editor, placeholder replacer, PDF/DOCX download | Preserved |
| `/ombudsman` | `OmbudsmanComplaintPage.tsx` | Rule 13 Ombudsman complaint editor, center selector, download | Preserved |
| `/next-steps` | `NextStepsPage.tsx` | What-to-do-next escalation roadmap (GRO $\rightarrow$ Ombudsman) | Preserved |
| `/dashboard` | `DashboardPage.tsx` | "My cases" list, status badges, deletion, countdown to 24h purge | Preserved |
| `/samples` | `SampleCasesPage.tsx` | 4 watermarked sample cases with download links and one-click loading | Preserved |
| `/sources` | `OfficialSourcesPage.tsx` | Official regulatory links (IRDAI, CIO, Supreme Court precedents) | Preserved |
| `/official-rules` | `OfficialSourcesPage.tsx` | Alias for `/sources` | Preserved |
| `/privacy` | `PrivacyDataPage.tsx` | Privacy commitment, DPDP Act 2023 alignment, 24h auto-deletion | Preserved |
| `/terms` | `TermsPage.tsx` | Terms of service and non-legal-advice disclaimer | Preserved |
| `/settings` | `AccountSettingsPage.tsx` | User profile, daily quota usage, clear local data | Preserved |
| `/admin` | `AdminPanelPage.tsx` | Admin panel (passcode, unlimited quota toggle, Gemini model/key config) | Preserved |
| `/login` | `LoginPage.tsx` | Authentication login | Preserved |
| `/register` | `RegisterPage.tsx` | User registration | Preserved |
| `/forgot-password` | `ForgotPasswordPage.tsx` | Password recovery | Preserved |
| `/verify-email` | `VerifyEmailPage.tsx` | Email confirmation | Preserved |

---

## 2. Backend API Endpoints Inventory

| Method & Route | Request Body / Params | Expected Response | Preserved |
|---|---|---|:---:|
| `GET /api/health` | None | `{ status: 'ok', timestamp, gemini_configured, model, version }` | Preserved |
| `POST /api/cases/analyze` | Multipart FormData: `rejection`, `policy`, `discharge` (files), `user_id` (string) | `{ jobId, status: 'pending', message }` (HTTP 202) or HTTP 400 on invalid/missing file | Preserved |
| `GET /api/cases/:id/status` | URL param `:id` | `{ id, status, progressPercent, currentStepIndex, steps, error, expiresAt }` | Preserved |
| `GET /api/cases/:id/result` | URL param `:id` | `{ id, status, result: AnalysisResponseContract }` | Preserved |
| `POST /api/cases/:id/appeal` | `{ customNotes, customSubject }` | `{ appeal: { subject, body } }` | Preserved |
| `POST /api/cases/:id/ombudsman` | `{ customFacts, customRelief }` | `{ ombudsman_complaint: { subject, body } }` | Preserved |
| `POST /api/admin/config` | `{ apiKey, model }` | `{ success: true, message, model, gemini_configured }` | Preserved |

---

## 3. Forms & Data Flow Inventory

1. **Upload & Case Wizard Form (`NewCasePage.tsx` / `LandingPage.tsx`)**:
   - Inputs: Rejection ground (radio), Insurer name (select/search), Claim amount (number), Hospitalization date (date), 3 Document upload slots (file input, drag-and-drop, mobile camera).
   - Validation: File type (.pdf, .png, .jpg, .jpeg), file size ($\le 15$ MB), required rejection letter.
   - Submitted to: `POST /api/cases/analyze` as FormData.
2. **Appeal Refinement Form (`AppealEditorPage.tsx`)**:
   - Inputs: Subject line, recipient details, letter body text, interactive placeholders.
   - Outputs: PDF generation (`exportLetterToPdf`), DOCX generation (`exportLetterToDocx`), Copy to clipboard.
3. **Ombudsman Refinement Form (`OmbudsmanComplaintPage.tsx`)**:
   - Inputs: Centre selection, relief claimed, factual clarifications.
   - Outputs: PDF/DOCX generation, copy, statutory Rule 17 check display.
4. **Account & Quota Form (`AccountSettingsPage.tsx` / `AdminPanelPage.tsx`)**:
   - Inputs: Full name, email, phone, custom quota limit, unlimited mode switch, Gemini API key/model.
   - Persisted: LocalStorage + `POST /api/admin/config`.

---

## 4. Stateful Features Inventory

- **User Profile & Daily Quota**: `getStoredUserProfile()`, `updateUserProfile()` in `api.ts`. Enforces 3 free analyses per day with automatic calendar-day reset.
- **Saved Cases Store**: `useCaseStore` using Zustand, backed by `localStorage` (`claimfight_saved_cases`). Auto-seeds initial sample case.
- **Analysis Execution**: `executeAnalysisPipeline` in `n8nService.ts` calling `/api/cases/analyze`, polling `/api/cases/:id/status` until completed, saving to `useCaseStore`.
- **24-Hour Document Purge**: `expires_at` timestamp calculated as `Date.now() + 24*60*60*1000`. Displayed with live countdown on dashboard and detail views.
- **Internationalization (i18n)**: English (default) with configuration in `src/i18n/config.ts`.
- **PDF & Word Export**: `exportService.ts` utilizing `jspdf` and `docx`.

---

## 5. Critical Flow Verification Checklist

- [x] Home page loads with Poulo layout + Milgram calm styling.
- [x] Upload box on home page accepts drag-and-drop, click, camera upload.
- [x] New Case 5-step wizard runs smoothly with Framer Motion transitions without losing state on refresh.
- [x] Gemini Multimodal Vision analysis runs against real PDF documents and returns genuine structured adjudication.
- [x] Results page displays 5 distinct financial metrics, deterministic date & continuity credit calculation, and Ombudsman Rule 17 statutory verification.
- [x] Download PDF generates grievance appeal and Ombudsman complaint documents.
- [x] All 4 pre-loaded sample cases load and run.
- [x] "My cases" listing, viewing, and deletion work.
- [x] Dark mode toggle works with WCAG AA contrast.
- [x] Daily free-analysis limit (3/day) works as intended.
- [x] 24-hour auto-purge warning and timer remain active.
