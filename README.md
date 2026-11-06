# Niera Question Paper Generator

**A curriculum-aware, AI-augmented question paper generation platform.**

---

## Tech Stack (v2.1 Optimized)

| Layer | Choice |
|---|---|
| **Frontend & API** | Next.js 15.5.x (App Router) + TypeScript |
| **Type Safety** | tRPC → end-to-end compile-time contracts |
| **Database** | PostgreSQL + Prisma ORM |
| **Data Model** | Hybrid: Relational columns + JSONB for flexible question payloads |
| **PDF Generation** | Playwright + KaTeX (HTML → PDF via headless Chrome) |
| **AI Integration** | Vercel AI SDK (structured outputs via Zod) |
| **Background Jobs** | BullMQ + Redis |
| **Auth** | NextAuth.js (Role-based: Student, Reviewer, Admin) |

---

## Stack Comparison

| Criterion | ✅ **TypeScript/Next.js (Chosen)** | Python/FastAPI | Go/Fiber | Node/Express |
|---|---|---|---|---|
| Type safety across all layers | **tRPC → single source of truth** | Runtime-only | Runtime-only | Runtime-only |
| Math-heavy PDF rendering | KaTeX → Playwright → pixel-perfect | WeasyPrint slower | Puppeteer bridge | Puppeteer bridge |
| Dev velocity (2-3 devs) | **Monorepo + RSC** → fastest | Separate API & web | Verbose generics | Separate repo |
| AI structured outputs | Native `useChat` streaming | SDK manual | Manual | Manual |
| Database query speed (500K+ rows) | **Postgres + GIN indexes** | Same | MongoDB slower | Same |
| Background jobs | BullMQ (battle-tested) | Celery (mature) | Machinery (newer) | BullMQ (same) |

---

## Why This Stack Wins

1. **End-to-End Type Safety**  
   A `Question` schema error is caught at **compile time**, not runtime.

2. **Single Repository**  
   UI + API share files → fewer context switches, unified testing.

3. **Math Rendering Confidence**  
   KaTeX + Playwright produces correct equations with **no symbol drift**.

4. **Fast Local Iteration**  
   Hot-reload for both frontend and API → 2–3 devs ship faster.

---

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url>
cd quepaper_gen
npm install

# 2. Set environment
cp .env.example .env
# Edit DATABASE_URL to your PostgreSQL instance

# 3. Push schema (creates tables)
npx prisma db push

# 4. Seed curriculum (Phase 0 data)
npm run seed

# 5. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server (hot-reload) |
| `npm run build` | Production build |
| `npm run seed` | Load Phase 0 curriculum & fixtures |
| `npm run prisma` | Open Prisma Studio GUI |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
.
├── NIERA_QUESTION_PAPER_GENERATION_ROADMAP_STANDALONE.md  # Product spec
├── agent_rules.md                                            # Team execution rules
├── README.md                                                # This file
├── docs/                    # Internal engineering docs
│   ├── architecture.md    # Versioned architecture log (v2.1)
│   ├── curriculum-resolver.md
│   ├── blueprint-engine.md
│   └── edge-cases.md      # 13 real-world edge cases
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   └── app/               # Next.js App Router pages
├── lib/                   # Shared utilities
└── generated/
    └── sample-fixtures/   # Phase 1 verified mock papers
```

---

## Roadmap Reference

See `NIERA_QUESTION_PAPER_GENERATION_ROADMAP_STANDALONE.md` for:
- Full product goals per flow (A–E)
- Feature priorities (P0/P1/P2)
- Phase-by-phase deliverables
- Competitor landscape

---

## Documentation Links

| Topic | Location |
|---|---|
| Architecture decisions | `docs/architecture.md` |
| All edge cases | `docs/edge-cases.md` |
| Curriculum resolver design | `docs/curriculum-resolver.md` |
| Blueprint engine design | `docs/blueprint-engine.md` |