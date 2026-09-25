# VyaparAI — Agentic Back Office for Indian MSMEs

> **"Don't just tell the business owner what needs to be done. Let AI agents actually perform the work."**

VyaparAI is a multi-agent autonomous back office designed specifically for Indian micro, small, and medium enterprises (MSMEs) like Kirana shops, retailers, and distributors. Unlike traditional software that stops at displaying dashboards, VyaparAI proactively observes business operations, predicts stockouts, detects vendor ledger discrepancies, prepares GST filings, matches government subsidies, and executes approved transactions.

---

## 🌟 The Core Value Proposition

```text
Traditional Software:
DATA ──▶ DASHBOARD ──▶ HUMAN DECISION ──▶ MANUAL HUMAN ACTION

VyaparAI:
DATA ──▶ AI AGENT ──▶ DECISION ──▶ TOOL/ACTION ──▶ HUMAN APPROVAL GATE (When Needed)
```

The system demonstrates the central thesis:
**"It's not a dashboard. It's an AI back office that takes actions itself."**

---

## 🏗️ Multi-Agent Architecture

```text
                        ┌───────────────────────────────┐
                        │      Central Orchestrator     │
                        │    (Intent Router & Chain)    │
                        └──────────────┬────────────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│  Inventory   ││ Payment Recon││ Compliance   ││ Govt Scheme  ││   Expense    │
│    Agent     ││    Agent     ││    Agent     ││    Agent     ││    Agent     │
└───────┬──────┘└───────┬──────┘└───────┬──────┘└───────┬──────┘└───────┬──────┘
        │               │               │               │               │
        └───────────────┴───────┬───────┴───────────────┴───────────────┘
                                ▼
                 ┌─────────────────────────────┐
                 │  Controlled Tool Subsystem  │
                 └──────────────┬──────────────┘
                                ▼
                 ┌─────────────────────────────┐
                 │ Human-in-the-Loop Risk Gate │
                 │ (Low / Medium / High Risk)  │
                 └──────────────┬──────────────┘
                                ▼
                 ┌─────────────────────────────┐
                 │ Immutable Audit Ledger & DB │
                 └─────────────────────────────┘
```

### Specialized Agents:
1. **Inventory Agent**: Calculates stock velocity, predicts days until stockout, flags low/critical stock, calculates reorder requirements, identifies preferred suppliers, drafts purchase orders, and executes approved procurement.
2. **Vendor Payment Reconciliation Agent**: Reconciles invoices and payment vouchers, flags overdue balances, detects partial payment discrepancies (e.g. ₹2,000 mismatch on ABC Wholesale), and prepares payment instructions.
3. **GST & Compliance Agent**: Tracks filing deadlines (GSTR-3B, GSTR-1), audits inward/outward invoices, flags missing documentation, prepares draft return reconciliations, and enforces authorized taxpayer submission gates.
4. **Government Scheme Agent**: Matches business profile (turnover, sector, category, location) against official MSME schemes (PMMY Mudra, CGTMSE, PMEGP), explains eligibility rationale, and prepares prefilled application drafts.
5. **Expense Agent**: Conversational expense logging (e.g. `"Petrol 2000"`), NLP amount extraction, auto-categorization (Transportation, Utilities, Packaging, Rent), and ledger summarization.
6. **Business Insights Agent**: Holistic multi-domain analytics across sales, inventory, and expenses to produce proactive health summaries and recommended next actions.

---

## 🛡️ Human-in-the-Loop Risk Governance

Every agent action is evaluated under strict permission tiers before execution:
- **Low Risk (Autonomous)**: Stock velocity recalculation, expense categorization, deadline tracking, audit logging.
- **Medium Risk (Approval Required)**: Creating purchase orders, sending supplier communications, resolving payment discrepancies.
- **High Risk (Strict Authorization)**: Financial disbursements, tax filings, legally binding government submissions.

---

## 💻 Tech Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB with automatic zero-configuration fallback to `mongodb-memory-server`
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Agent Architecture**: Deterministic intent classification, controlled tool execution, and observable step telemetry
- **Testing**: Built-in Node test runner (`node:test`) with 100% passing unit & integration suites

---

## 🚀 Quickstart & Installation

### Prerequisites:
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install Dependencies:
```bash
git clone https://github.com/your-username/VyaparAI.git
cd VyaparAI
npm install
```

### 2. Environment Configuration:
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
*(By default, `USE_MEMORY_DB=true` is enabled, allowing instant startup without needing a local MongoDB daemon installed!)*

### 3. Run Tests:
Verify all 20 unit and end-to-end integration tests:
```bash
npm run test --workspace=backend
```

### 4. Start Development Servers:
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Dashboard & WhatsApp Simulator**: `http://localhost:3000`

---

## 📱 Demo Scenarios Walkthrough (For Judges)

The system comes pre-seeded with **Shree General Store** (Kirana & Retail store in Pune with ₹38.5 Lakhs annual turnover).

### Scenario 1 — Inventory & Stockout Prevention
1. Open the **WhatsApp Simulator** tab.
2. Ask: `"How much rice do I have?"`
   - *Agent replies:* "You currently have 18 kg of Kolam Rice. Based on your average daily sales of 6 kg/day, the stock may last approximately 3 days. Your regular supplier ABC Wholesale can provide 50 kg for ₹2,400. Would you like me to prepare the order?"
3. Ask: `"Order the rice"` or `"Handle the low stock"`.
   - *Agent plans workflow, invokes `createDraftPurchaseOrder`, and displays an Approval card with `[✅ Approve ₹2,400]` and `[❌ Reject]` buttons.*
4. Click **[✅ Approve]**.
   - *System executes the simulated purchase order, updates inventory stock, and logs the authorization to the immutable audit trail.*

### Scenario 2 — Supplier Payment Reconciliation
1. In WhatsApp Simulator, ask: `"Check supplier payments"` or `"Which supplier haven't I paid?"`.
   - *Agent reviews ledger:*
     - ABC Wholesale: ₹12,500 pending
     - Kumar Distributors: ₹8,200 pending
     - Shree Suppliers: ₹15,400 pending
     - **Total: ₹36,100 pending**
   - *Flags discrepancy:* "⚠️ Discrepancy Detected: I found a ₹2,000 mismatch between an ABC Wholesale invoice and the recorded payment voucher."
2. Open the **Payments** tab to view the flagged invoice and click **"Resolve"**.

### Scenario 3 — GST Compliance Audit
1. In WhatsApp Simulator, ask: `"What compliance tasks are pending?"`.
   - *Agent responds:* "Your next compliance task GSTR-3B Monthly Return is due in 5 days. Agent reconciled 42 purchase invoices. I found 4 invoices needing attention before submission (missing supplier E-way bill). I've prepared the required draft information for your review."
2. Navigate to the **GST & Compliance** tab to review the prepared turnover and input tax credit (ITC) figures.

### Scenario 4 — MSME Government Scheme Discovery
1. In WhatsApp Simulator, ask: `"Find schemes for my business"`.
   - *Agent matches business profile against the scheme database:*
     1. **Pradhan Mantri Mudra Yojana (PMMY) — Kishor**: 94% match (Working capital loan up to ₹5,00,000).
     2. **CGTMSE**: 88% match (85% credit guarantee up to ₹2 Crore).
     3. **PMEGP**: 76% match (Project subsidy up to 35%).
   - *Clear label:* DEMO DATA — replace with verified government data before production.
2. Click **"Prepare Application Draft"** in the Government Schemes tab to generate a pre-filled application draft.

### Scenario 5 — Conversational Expense Tracking
1. In WhatsApp Simulator, type: `"Petrol 2000"` or `"Packaging 850"`.
   - *Agent extracts amount, auto-classifies category as Transportation / Packaging, records the expense, and logs the audit event.*

### Scenario 6 — Holistic Business Health Overview
1. In WhatsApp Simulator, ask: `"How is my business doing?"` (or in Hindi `"मेरा व्यापार कैसा चल रहा है?"` / Marathi `"माझा व्यवसाय कसा चालू आहे?"`).
   - *Business Insights Agent synthesizes sales velocity, critical inventory alerts, vendor dues, and GST deadlines into a unified executive summary with prioritized next actions.*

---

## 🇮🇳 Multilingual & Accessibility Features

1. **Regional Language Toggle (`[EN]` | `[हिंदी]` | `[मराठी]`)**:
   - Header selector instantaneously localizes all 12 navigation tabs, scenario prompts, and system banners into English, Hindi, or Marathi.
2. **Native Intent Understanding**:
   - Central Orchestrator Agent recognizes and routes colloquial queries in Hindi and Marathi (e.g. `"चावल कितना बचा है?"`, `"सप्लायर्सचे पेमेंट तपासा"`, `"पेट्रोल 500"`).
3. **Voice Response Synthesis (`🔊 Listen`)**:
   - Every agent response in the WhatsApp Simulator includes a voice note player powered by the Web Speech API (`window.speechSynthesis`), allowing non-technical Kirana owners to listen to agent recommendations aloud.

---

## 🏢 Strict Multi-Tenant Isolation & Live Switcher

To prove zero cross-business contamination to judges and security auditors:
- **Enterprise 1: Shree General Store (Pune)**: Retail Kirana (Turnover: ₹38.5L), selling Rice, Oil, Sugar.
- **Enterprise 2: Sharma Auto Spares (Nagpur)**: Auto Parts Wholesale (Turnover: ₹72L), selling Engine Oil, Ceramic Brake Pads.
- **1-Click Switcher**: Use the Enterprise dropdown in the header to switch between businesses. Each profile displays strictly isolated inventory, suppliers, pending liabilities, tax filings, and WhatsApp chat history with zero data overlap.

---

## 📑 Official Document Exports & Printing

- **Download Form GSTR-3B JSON**: The compliance return modal allows one-click export of an authentic GSTN-compatible JSON return payload with aggregated turnover, CGST, SGST, IGST, and ITC figures.
- **Print Purchase Order Vouchers**: The Purchase Order modal features a `Print Voucher` button with custom `@media print` styling that formats clean A4/thermal purchase orders for suppliers.

---

## 🔍 Observability & Audit Trail

- **Agent Activity Tab**: Inspect step-by-step reasoning chains (`OBSERVE` ➔ `UNDERSTAND` ➔ `PLAN` ➔ `TOOL INVOCATION` ➔ `HUMAN APPROVAL GATE`).
- **Audit Logs Tab**: Immutable ledger recording `timestamp`, `agentName`, `actionType`, `resourceType`, `riskTier`, and `status`.

---

## 🔒 Security & Tenant Isolation

- Mandatory `businessId` query scoping on all MongoDB operations.
- JWT-based authentication with bcrypt password hashing.
- Role-based authorization (`OWNER`, `MANAGER`, `STAFF`).
- Clean service interfaces (`ISupplierService`, `IPaymentService`, `IGSTService`, `IWhatsAppService`) allowing real API credentials to be plugged into `.env` without modifying agent logic.

---

## 🎤 3-Minute Hackathon / Investor Pitch Script

> **"Judges, small Indian business owners don't fail because they lack ambition. They fail because they spend 70% of their day on administrative firefighting—counting stock, chasing supplier invoices, and worrying about GST penalties.**
>
> **Traditional software tells the owner: 'Here is a dashboard. Now go figure out what to do.'**
>
> **VyaparAI flips the paradigm: 'It's not a dashboard. It's an AI back office that actually takes action.'**
>
> **When cooking oil runs low, VyaparAI doesn't just show a red bar—it forecasts a 2-day stockout, matches Kumar Distributors, calculates the exact reorder quantity, and prepares a Purchase Order. The owner clicks 'Approve' on WhatsApp, and the order is placed, audited, and logged.**
>
> **From GSTR-3B preparation to finding government MSME subsidies and tracking expenses in Hindi and Marathi, VyaparAI gives every small shopkeeper an autonomous CFO, supply chain manager, and compliance officer in their pocket."**

---

## 📜 License
ISC License — VyaparAI Team.
