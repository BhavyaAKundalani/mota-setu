# MoTA SETU: Automated Tribal Scholarship Scrutiny & Reconciliation Engine
### Smart India Hackathon (SIH 2026) | Problem Statement: `SIH26239`
**Theme:** Smart Education | **Category:** Software | **Team:** Builders

---

## 🏛️ Executive Overview
**MoTA SETU** is an institutional-grade, AI-driven scrutiny, defect-resolution, and financial reconciliation engine engineered for the **Ministry of Tribal Affairs (MoTA)**, Government of India. 

It addresses the fundamental systemic bottleneck in tribal welfare: **arbitrary technical rejections and multi-month clerical backlogs** affecting first-generation Scheduled Tribe scholars applying for statutory national schemes (**NFST** and **NOS**).

---

## 🚀 Key Innovations

### 1. Dual-Engine Document Intelligence
- **Edge OpenCV Quality Guard:** Pre-evaluates mobile photo uploads for Laplacian blur, histogram contrast, and corner alignment before submission, preventing dark/shaky uploads.
- **Multimodal Gemini 2.0 Flash Vision:** Extracts applicant names, father's names, tribal category, and official Sub-Divisional Magistrate (SDM) / Tehsildar rubber seals into structured JSON.

### 2. The "Dialect-Shield" (Statutory Rule 14b Phonetics)
- Resolves transliteration disparities between English marksheets and vernacular caste certificates (*Soren* vs *Saren*, *Munda* vs *Mounda*, *Kerketta* vs *Kerketa*) using custom Soundex & Levenshtein distance.
- Automatically applies **Rule 14(b) Gazette Dialect Exemption** so students are never wrongfully disqualified.

### 3. "Zero-Dead-End" Closed-Loop Cure Protocol
- Instead of outright rejection, flags generate an automated SMS/WhatsApp link giving scholars a **15-day Right to Cure** via single-element photo re-upload.

### 4. Human-in-the-Loop (HITL) Sovereign Governance
- AI functions strictly as an **Autonomous Advisory Auditor**. Final sanction authority resides exclusively with gazetted Desk Officers (L-2/SNO) with Section 65B-compliant SHA-256 cryptographic audit logs.

### 5. Unified 6-Screen Command Architecture
1. **Gateway Portal (`/`)**: Sovereign entrance with dual student & officer access and live metrics ribbon.
2. **Student Application Portal (`/apply`)**: Step-by-step form with live CV pre-check and bilingual audio guide.
3. **Officer Scrutiny Console (`/officer`)**: Ergonomic dual-pane workspace with zoom, rotate, high-contrast filters, and J/K/Ctrl+Enter keyboard shortcuts.
4. **Track & Cure Defect (`/track-cure`)**: Jargon-free reassurance portal with instant seal re-uploader and CSC village kiosk locator.
5. **Executive Ministry Analytics (`/analytics`)**: State-wise ingestion matrix, PVTG demographic parity metrics, and friction diagnostics.
6. **PFMS & DBT Settlement Ledger (`/ledger`)**: Pre-disbursal Aadhaar bridge validation, NPCI APBS status tracking, and 1-click batch mandate staging.

---

## ⚡ Quick Start (1-Click Run)

### Option A: The One-Click Launcher (Windows)
Double-click:
```bat
D:\Hackathon\mota-setu\start.bat
```
This automatically boots the FastAPI backend and launches the portal in your browser!

### Option B: Manual Command Line
1. Open PowerShell or Command Prompt in `D:\Hackathon\mota-setu\backend`:
```powershell
.\.venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
2. Open your browser:
- **Web Portal:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔑 Adding Your Free Google AI Studio Key
Open `D:\Hackathon\mota-setu\backend\.env` and add:
```env
GEMINI_API_KEY=your_actual_key_here
```
*(Note: If no key is set or the internet drops during the hackathon, MoTA SETU automatically activates its high-precision offline failsafe mode so your demo will never fail on stage!)*

---

## 🏆 Presentation Walkthrough for Hackathon Judges
1. **Start at `/` (Gateway):** Highlight the 3 Root Bottlenecks and live national metrics (₹480 Cr disbursed, 14d -> 48h velocity).
2. **Click "Officer Scrutiny Console" (`/officer`):** Show the dual-pane certificate viewer, zoom/contrast controls, and the **Rule 14(b) Dialect Exemption** on *Mangal Soren*. Press `Ctrl+Enter` to approve!
3. **Show "Direct Scholar Clarification":** Click the button to demonstrate the simulated SMS/WhatsApp dispatch.
4. **Open `/track-cure`:** Show the student reassurance banner (*"Your scholarship is NOT rejected"*), audio guide in Odia/Hindi, and 1-click seal re-upload.
5. **Open `/analytics`:** Show the Ministry Command Center, state matrix, and PVTG inclusion rates.
6. **Open `/ledger`:** Show live PFMS / APBS batch staging and click **"Authorize Batch Push"**.
7. **Open `/docs`:** Show the backend REST API documentation to prove it's a real full-stack software system!
