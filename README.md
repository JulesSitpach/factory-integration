# Factory Integration

A modular, event-driven platform that connects ERP, MES, SCADA/IIoT and other manufacturing systems, delivering real-time data flow, automated workflows and operational visibility for smart-factory initiatives.

---

## 🌟 Key Features
| Category | Description |
|----------|-------------|
| System Connectors | Plug-in adapters for ERP, MES, SCADA/IIoT, databases and legacy protocols. |
| Transformation Engine | Declarative mappings & enrichment rules ensure data compatibility. |
| Routing & Orchestration | Event-driven micro-flows with robust retry, deduplication and DLQ handling. |
| Authentication & RBAC | NextAuth-based auth, server-side session validation and role-based access. |
| Multilingual UI | Full i18n (English & Spanish) powered by `next-i18next`. |
| **Cost Calculator (NEW)** | Dashboard tool + REST endpoint that estimates manufacturing cost from Materials, Labor & Overhead. |
| Observability | Centralised logging, metrics and tracing hooks (OpenTelemetry-ready). |
| CI/CD | GitHub Actions pipeline with unit, integration & e2e test stages. |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Front-End | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Back-End | Next.js App Router API routes, Supabase (via Postgres) |
| Auth | NextAuth.js + OAuth / Email magic-link |
| Messaging (planned) | Apache Kafka / RabbitMQ adapters |
| Testing | Jest, React Testing Library, Supertest |
| Dev Ops | Docker, GitHub Actions, optional Kubernetes manifests |

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+
* pnpm (preferred) or npm/yarn
* A Supabase project (or Postgres instance)  
  Add credentials to `.env` (see `.env.example`).

### 2. Installation
```bash
pnpm install          # install dependencies
pnpm db:migrate       # run SQL migrations (if using Supabase CLI)
```

### 3. Development server
```bash
pnpm dev
```
The app will be available at **http://localhost:3000**.

### 4. Running Tests
```bash
pnpm test             # unit & integration tests
```

---

## 🎯 Using the Cost Calculator

1. Sign in and navigate: **Dashboard → Cost Calculator**.  
2. Enter **Materials**, **Labor** and **Overhead** costs.  
3. Press **Calculate** – totals appear instantly; values are persisted in the browser session.

Under the hood the page calls:

```
POST /api/cost-calculator
{
  "materials": 100,
  "labor": 200,
  "overhead": 150
}
→ { "totalCost": 450, "breakdown": { … }, "timestamp": "…" }
```

The endpoint validates input, computes totals and returns a JSON payload consumable by other services.

---

## 📂 Project Structure (excerpt)

```
.
├─ app/                          # Next.js App Router
│  ├─ dashboard/[locale]/        # Auth-protected UI
│  │  └─ calculator/             # ← New cost calculator page
│  └─ api/
│     └─ cost-calculator/        # ← API route
├─ lib/                          # Shared utilities (auth, db, currency utils)
├─ __tests__/                    # Jest tests
└─ docs/                         # Architecture & ADRs
```

---

## 🤝 Contributing

1. Fork & clone the repo.
2. Create a branch: `git checkout -b feat/my-feature`.
3. Follow coding standards (`pnpm lint`).
4. Add/adjust tests.
5. Open a Pull Request – CI must pass.

---

## 📜 License

MIT © Factory Integration Team
