# Rightful

> **Get what the policy already promised you.**  
> An evidence-backed consumer claims agent: refunds, returns, and warranty claims proven against the seller's own published policy.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Nebius Token Factory](https://img.shields.io/badge/Nebius-Token_Factory-purple.svg)](https://nebius.com)
[![NVIDIA Nemotron](https://img.shields.io/badge/NVIDIA-Nemotron_3-green.svg)](https://www.nvidia.com)
[![Tavily Search](https://img.shields.io/badge/Tavily-Live_Research-teal.svg)](https://tavily.com)

**Live Demo:** [https://rightful-nu.vercel.app](https://rightful-nu.vercel.app)  
**Repository:** [https://github.com/devprashant19/Rightful](https://github.com/devprashant19/Rightful)

---

## The Problem
Every year, billions of dollars in legitimate consumer refunds, return requests, and warranty claims are forfeited because merchant return policies are intentionally dense, fragmented, and buried in legal jargon. When products fail or shipments go wrong, consumers rarely know their exact legal deadlines or how to cite policy terms effectively to customer service agents.

## The Solution: What Rightful Does
Rightful turns an order receipt and a one-line complaint into an airtight, evidence-backed claim in under a minute:
1. **Reads messy purchase documents** (.txt, .eml email headers, PDF receipts) using **NVIDIA Nemotron 3 Nano**.
2. **Researches live seller policies** from official web pages using **Tavily Search & Extract**.
3. **Maps requirements in a Proof Ledger** with **Nemotron 3 Super (120B)**, stamping each requirement `Supported`, `Ambiguous`, `Missing`, or `Not Met`.
4. **Validates everything with a Deterministic Code Verifier**: quotes must exist verbatim in retrieved text; date windows are recomputed in deterministic code; ungrounded rows are automatically downgraded.
5. **Starts the Deadline Clock**: computes remaining days to return with an instant `.ics` calendar reminder download.
6. **Autofills a Sandbox Portal & Stops for Approval**: fills support forms field-by-field, strictly gated by explicit human sign-off.

---

## System Architecture

```
User Evidence (.eml, PDF, Text)
       │
       ▼
[1] Nemotron 3 Nano ────────► Extracted Facts (Seller, Dates, Claim Type)
       │
       ▼
[2] Tavily Search & Extract ─► Clean Official Policy Pages
       │
       ▼
[3] Nemotron 3 Super ───────► Proposed Evidence Matrix & Quotes
       │
       ▼
[4] Deterministic Verifier ──► Grounded Proof Ledger (Code Verified)
    (Pure TypeScript)         ├── Quote Substring & Sliding Token Check
                              ├── Date Window Arithmetic (Today - Delivery <= Window)
                              └── Weighted Claim Strength (0-100)
       │
       ▼
[5] Nemotron 3 Nano ────────► Cited Claim Email + Sandbox Form Autofill
       │
       ▼
[6] Sandbox Portal (/portal) ─► Human-in-the-Loop Sign-off Gate
```

---

## How We Use NVIDIA Nemotron on Nebius Token Factory

We route requests across the NVIDIA Nemotron model family to balance speed and reasoning depth:

| Step | Model Name | Role | Measured Latency | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Extraction** | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | Fact Extraction | ~1.2s | High speed, strict JSON schema adherence |
| **Research Plan** | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | Query Generation | ~0.9s | Short, targeted query formulation |
| **Proof Ledger** | `nvidia/nemotron-3-super-120b-a12b` | Evidence Matrix Reasoning | ~3.4s | Multi-document cross-referencing & policy requirements |
| **Claim Drafting** | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` | Claim Email Synthesis | ~1.5s | Professional drafting citing verified policy quotes |

---

## The Deterministic Verifier (Nemotron Proposes, Code Checks)

Large Language Models frequently hallucinate policy terms. Rightful solves this by stripping the model's authority over final verdicts:
- **Verbatim Quote Grounding:** Every cited quote must match the retrieved Tavily text via exact substring or $\ge 90\%$ sliding token window set overlap. Any ungrounded quote triggers an immediate downgrade to `ambiguous`.
- **Code Date Math:** Days elapsed is calculated deterministically:
  $$\text{days\_elapsed} = \text{Date}(\text{today}) - \text{Date}(\text{delivery\_date})$$
  If code determines a claim is within the window, code overrides model misclassifications.
- **Citation Integrity:** Hallucinated citation IDs are removed. Third-party only sources cannot yield a `supported` status without an official domain anchor.

---

## Testing Instructions for Hackathon Judges

To ensure free, unrestricted testing during the judging period:
1. Navigate to the live deployment or local app (`http://localhost:3000`).
2. Enter the **Judge Access Code** in the footer. The code is supplied in the
   *testing instructions* field of this project's Devpost submission; it is
   deliberately not published here, because it bypasses the rate limiter and
   this repository is public.
3. This code bypasses the IP rate limit (10 runs / 10 minutes) and any forced
   replay mode, executing live calls to Nebius Token Factory and Tavily.
4. Select the sample case **"Voltline Earbuds (Fictional - Benchmark)"**. It is
   the fastest and most deterministic path, resolving its policy from an
   embedded document rather than a live search.
5. Click **Build my claim** and observe the live streaming pipeline, Proof Ledger rubber stamps, and model telemetry in the **Run Log Drawer**.

---

## Local Setup & Development

```bash
# 1. Clone the repository
git clone https://github.com/devprashant19/Rightful.git
cd Rightful

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Add your NEBIUS_API_KEY and TAVILY_API_KEY to .env.local

# 4. Run connectivity smoke test
node scripts/smoke.mjs

# 5. Start development server
npm run dev
```

---

## Deployment

The app is a standard Next.js 15 project and deploys with zero extra configuration.

```bash
npm i -g vercel
vercel login
vercel --prod
```

Set these environment variables on the host before the first production request,
otherwise `/api/run` serves the pre-verified replay trace instead of live inference:

| Variable | Required | Notes |
| :--- | :--- | :--- |
| `NEBIUS_API_KEY` | yes | Nebius Token Factory key; without it the pipeline cannot reach Nemotron |
| `TAVILY_API_KEY` | yes | Tavily Search & Extract key |
| `NEBIUS_BASE_URL` | no | Defaults to `https://api.tokenfactory.nebius.com/v1` |
| `NEMOTRON_FAST_MODEL` | no | Defaults to `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` |
| `NEMOTRON_REASON_MODEL` | no | Defaults to `nvidia/nemotron-3-super-120b-a12b` |
| `JUDGE_ACCESS_CODE` | recommended | Set a private value in production. The committed default in `.env.example` is for local development only. |

Confirm a deployment is live and wired to real inference:

```bash
curl https://<your-deployment>/api/health
# expect: "live_mode": true, and both services true
```

`maxDuration` on `/api/run` is set to 60s to accommodate the Nemotron Super
reasoning step; the route runs on the Node.js runtime, not Edge.

---

## Limitations, Ethics & Privacy
- **Zero Real Submissions:** Rightful never submits claims directly to external companies without permission. Actions are restricted to the local `/portal` sandbox.
- **Zero Document Storage:** User documents and receipts are processed in memory per request and discarded immediately. No database is used; history persists only in the user's browser `localStorage`.
- **Not Legal Advice:** Rightful is an automated consumer advocacy preparation tool.

---

## AI-Assisted Build Disclosure
Built for the Nebius x NVIDIA Global AI Hackathon (2026). Architectural logic, verifier algorithms, prompts, and interface were developed under the active direction of the entrant using an AI coding assistant. All code is owned by the entrant and licensed under the MIT License.

