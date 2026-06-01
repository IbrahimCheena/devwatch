<div align="center">

<img src="https://img.shields.io/badge/DevWatch-Live-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/Java-Spring Boot-green?style=for-the-badge&logo=spring" />
<img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python" />
<img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase" />
<img src="https://img.shields.io/badge/AI-Mistral 7B-orange?style=for-the-badge" />

# DevWatch

### Full-Stack GitHub Repository Analytics and QA Dashboard

**Connect any GitHub repo. See your codebase health in seconds.**

[Live Demo](https://devwatch-two.vercel.app) · [Backend API](https://devwatch-production.up.railway.app/actuator/health) · [Report Bug](https://github.com/IbrahimCheena/devwatch/issues)

</div>

---

## What is DevWatch?

DevWatch is a production-grade full-stack platform that connects to any GitHub repository and delivers real-time codebase health insights. Engineers and engineering teams use it to monitor CI/CD pipeline reliability, track test coverage trends over time, run static code quality analysis, and generate AI-powered QA reports — all from a single dashboard.

Built as a portfolio project to demonstrate end-to-end engineering across a Java Spring Boot REST API backend, a Next.js TypeScript frontend, Python automation scripts, PostgreSQL via Supabase, and free LLM inference via HuggingFace — with zero ongoing API costs.

---

## Live Demo

| Layer | URL |
|---|---|
| Frontend Dashboard | https://devwatch-two.vercel.app |
| Backend REST API | https://devwatch-production.up.railway.app |
| API Health Check | https://devwatch-production.up.railway.app/actuator/health |
| Swagger UI | https://devwatch-production.up.railway.app/swagger-ui.html |

---

## Features

### GitHub OAuth Login
Authenticate with your GitHub account in one click. DevWatch requests only the permissions it needs to read your repositories and workflow run history. Your access token is stored securely and used exclusively to call the GitHub API on your behalf.

### Real-Time Repository Dashboard
Connect any public or private GitHub repository. The dashboard loads all your repos automatically after login and displays live health metrics for each one at a glance — quality score, CI pass rate, and test coverage side by side.

### CI/CD Pipeline Health Monitor
Pulls your GitHub Actions workflow run history and visualizes pass/fail trends across the last 30 runs in an animated area chart. Instantly see if your pipeline is regressing or improving over time, with color-coded pass/fail bars and duration tracking.

### Code Quality Scanner
Runs static analysis across your entire connected repository. The scanner walks every file in the codebase, classifies test files by naming convention, counts TODO/FIXME/HACK comments, measures file structure clarity, and computes a composite quality score from 0 to 100 across four weighted dimensions.

### Test Coverage Tracker
Tracks your test-to-code file ratio over time and stores coverage snapshots in PostgreSQL every time a scan runs. Coverage trends are visualized as a smooth animated line chart across 12 weeks so you can see whether your team is investing in tests or letting them slip.

### AI-Generated QA Reports
Uses Mistral 7B via the HuggingFace free inference API to generate professional natural-language QA health reports from your repo metrics. Reports include an executive summary, key strengths, areas for improvement, recommended actions, and an overall health rating. Generated reports are stored in the database and can be exported as beautifully formatted PDF files.

### PDF Export
Every QA report can be exported as a production-quality A4 PDF with a branded dark header, metric summary strip, section headings with orange accent bars, and a footer with the DevWatch URL. PDFs are generated entirely client-side using jsPDF with no server required.

### Animated Dashboard UI
Built with Framer Motion and Recharts. Every metric card counts up from zero on load. Charts animate in with staggered delays. The landing page features floating blur orbs, a typing animation subtext, 20 floating particle dots, scroll-triggered feature card reveals, and a bouncing scroll indicator.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework, server and client components, file-based routing |
| TypeScript | Type safety across all components and API calls |
| Tailwind CSS | Utility-first styling with custom CSS variables for the design system |
| Framer Motion 11 | Page transitions, staggered reveals, count-up animations, floating particles |
| Recharts 2 | AreaChart for CI/CD trends, LineChart for coverage, RadarChart for quality breakdown |
| NextAuth v4 | GitHub OAuth login, JWT session management, access token forwarding |
| SWR | Data fetching with stale-while-revalidate caching |
| jsPDF | Client-side PDF generation with custom layout and branding |
| Supabase JS | Direct database access from frontend for coverage snapshots |

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Core runtime |
| Spring Boot 3.2 | REST API framework, dependency injection, auto-configuration |
| Spring Data JPA | ORM layer, entity management, repository pattern |
| Spring Security | CORS configuration, request filtering, security filter chain |
| OkHttp3 | HTTP client for GitHub API and HuggingFace API calls |
| PostgreSQL (Supabase) | Primary database via connection pooler for IPv4 compatibility |
| Hibernate | Schema auto-update, query generation |
| Lombok | Boilerplate reduction for entities and services |
| SpringDoc OpenAPI | Auto-generated Swagger UI at /swagger-ui.html |
| Maven | Build tool, dependency management |

### Python Scripts
| Technology | Purpose |
|---|---|
| Python 3.11 | Runtime |
| GitPython | Cloning repositories for local static analysis |
| Click | CLI interface for all three scripts |
| Requests | HTTP calls to HuggingFace API and Supabase REST API |
| python-dotenv | Environment variable management |

### Infrastructure
| Service | Purpose | Cost |
|---|---|---|
| Vercel | Frontend deployment, edge CDN, automatic preview deployments | Free |
| Railway | Java Spring Boot backend hosting, automatic deploys from GitHub | Free tier |
| Supabase | PostgreSQL database, connection pooling, REST API | Free tier |
| HuggingFace | Mistral 7B inference API for QA report generation | Free tier |
| GitHub Actions | CI/CD pipelines for frontend, backend, and scripts | Free |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
│              https://devwatch-two.vercel.app                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                    Next.js 14 Frontend                           │
│                    Vercel Edge Network                           │
│                                                                  │
│  Landing Page  →  GitHub OAuth  →  Dashboard  →  Repo Analytics │
│                                              →  QA Report + PDF  │
└────────────┬─────────────────────────────────────────────────────┘
             │ REST API calls (X-GitHub-Token header)
             │ https://devwatch-production.up.railway.app
┌────────────▼────────────────────────────────────────────────────┐
│               Java Spring Boot Backend                           │
│                    Railway (US West)                             │
│                                                                  │
│  /api/repos          →  List connected repositories              │
│  /api/repos/connect  →  Connect a new repository                 │
│  /api/repos/.../ci-runs    →  Fetch GitHub Actions history       │
│  /api/repos/.../coverage   →  Return coverage snapshots          │
│  /api/repos/.../scan       →  Trigger analysis, save snapshot    │
│  /api/repos/.../report/generate  →  Call HuggingFace, save PDF  │
└────────────┬──────────────────────┬──────────────────────────────┘
             │                      │
┌────────────▼────────┐  ┌──────────▼──────────────────────────────┐
│   GitHub API        │  │         Supabase PostgreSQL              │
│   api.github.com    │  │  users, repositories, ci_runs,           │
│                     │  │  coverage_snapshots, qa_reports          │
│  Repos, Workflow    │  │                                          │
│  Runs, Contents     │  │  Connection via IPv4 pooler              │
└─────────────────────┘  │  aws-0-us-east-1.pooler.supabase.com    │
                         └──────────────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼─────────────────────────┐
│            HuggingFace Inference API                             │
│     mistralai/Mistral-7B-Instruct-v0.2                           │
│     Generates natural language QA reports from repo metrics      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
devwatch/
│
├── frontend/                          Next.js 14 TypeScript app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               Landing page with animations
│   │   │   ├── layout.tsx             Root layout with font loading
│   │   │   ├── globals.css            CSS variables and keyframes
│   │   │   ├── api/auth/              NextAuth GitHub OAuth handler
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           Main dashboard with repo list
│   │   │       ├── layout.tsx         Dashboard layout with sidebar
│   │   │       └── [owner]/[repo]/
│   │   │           ├── page.tsx       Repo analytics with charts
│   │   │           └── report/
│   │   │               └── page.tsx   QA report with PDF export
│   │   ├── components/
│   │   │   ├── Sidebar.tsx            Navigation sidebar with logout
│   │   │   ├── StatCard.tsx           Animated count-up metric card
│   │   │   ├── SkeletonCard.tsx       Shimmer loading placeholder
│   │   │   └── Providers.tsx          NextAuth SessionProvider wrapper
│   │   └── hooks/
│   │       └── useCountUp.ts          requestAnimationFrame count-up hook
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                           Java Spring Boot REST API
│   └── src/main/java/com/devwatch/
│       ├── DevwatchApplication.java   Entry point
│       ├── config/
│       │   └── SecurityConfig.java    CORS + Spring Security config
│       ├── controller/
│       │   ├── AuthController.java    POST /api/auth/github
│       │   └── RepoController.java    All /api/repos/** endpoints
│       ├── entity/                    JPA entities (User, Repository,
│       │                              CIRun, CoverageSnapshot, QAReport)
│       ├── repository/                Spring Data JPA repositories
│       ├── service/
│       │   ├── GitHubApiService.java  OkHttp GitHub API client
│       │   └── HuggingFaceService.java  Mistral inference client
│       └── filter/
│           └── TokenAuthFilter.java   X-GitHub-Token header validation
│
├── scripts/                           Python automation scripts
│   ├── analyze_repo.py                Clone repo, walk files, score quality
│   ├── coverage_tracker.py            POST coverage snapshot to Supabase
│   ├── generate_report.py             Call HuggingFace, output markdown
│   ├── requirements.txt               requests, gitpython, click, supabase
│   └── README.md                      Script usage documentation
│
└── .github/
    └── workflows/
        ├── frontend.yml               Node 18, npm ci, lint, build
        ├── backend.yml                Java 21, mvn test, mvn package, upload JAR
        └── scripts.yml                Python 3.11, pip install, pylint
```

---

## Local Development Setup

### Prerequisites

Make sure you have these installed:

```bash
node --version    # 18 or higher
java --version    # 21 or higher
python --version  # 3.11 or higher
mvn --version     # 3.9 or higher
git --version     # any recent version
```

### 1. Clone the repository

```bash
git clone https://github.com/IbrahimCheena/devwatch.git
cd devwatch
```

### 2. Set up the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Fill in `frontend/.env.local`:

```
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NEXTAUTH_SECRET=any_random_string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
HUGGINGFACE_TOKEN=your_huggingface_token
```

```bash
npm run dev
```

### 3. Set up the backend

```bash
cd backend
```

Create `backend/.env`:

```
DATABASE_URL=jdbc:postgresql://your-supabase-pooler-url:6543/postgres?sslmode=require
DATABASE_USER=postgres.your_project_ref
DATABASE_PASS=your_supabase_database_password
HUGGINGFACE_TOKEN=your_huggingface_token
```

```bash
mvn spring-boot:run
```

### 4. Set up Python scripts

```bash
cd scripts
pip install -r requirements.txt
```

Run a test analysis:

```bash
python analyze_repo.py --owner your_username --repo your_repo --token your_github_token --output-dir ./output
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/github | Authenticate with GitHub access token |
| GET | /api/repos | List all repos for authenticated user |
| POST | /api/repos/connect | Connect a new repository |
| GET | /api/repos/{owner}/{repo}/ci-runs | Get last 30 CI workflow runs |
| GET | /api/repos/{owner}/{repo}/coverage | Get coverage snapshots over time |
| POST | /api/repos/{owner}/{repo}/scan | Trigger code quality scan |
| GET | /api/repos/{owner}/{repo}/report/latest | Get latest QA report |
| POST | /api/repos/{owner}/{repo}/report/generate | Generate new AI QA report |

Full interactive API documentation available at the [live Swagger UI](https://devwatch-production.up.railway.app/swagger-ui.html).

---

## CI/CD Pipelines

DevWatch dogfoods its own tooling — the repo has three GitHub Actions workflows that run automatically on every push:

| Workflow | Trigger | Steps |
|---|---|---|
| Frontend CI | Push to `frontend/**` | Node 18 setup, npm ci, ESLint, Next.js build |
| Backend CI | Push to `backend/**` | Java 21 setup, mvn compile, mvn test, mvn package, upload JAR artifact |
| Scripts CI | Push to `scripts/**` | Python 3.11 setup, pip install, import check, pylint score gate |

---

## Deployment

| Service | Configuration |
|---|---|
| Vercel | Root directory set to `frontend/`, all env vars configured in project settings |
| Railway | Root directory set to `backend/`, Dockerfile auto-detected, env vars set in Variables tab |
| Supabase | PostgreSQL free tier, connection via IPv4 transaction pooler on port 6543 |

---

## Resume Highlights

Built to demonstrate full-stack engineering depth across multiple roles:

**Software Engineer**
Built DevWatch, a full-stack GitHub analytics platform using Java Spring Boot, Next.js TypeScript, Python and PostgreSQL delivering real-time repo health dashboards with CI/CD monitoring and AI-generated QA reports.

**Frontend / Full-Stack Engineer**
Engineered a production Next.js dashboard with GitHub OAuth, animated Recharts visualizations, Framer Motion page transitions, skeleton loading states, PDF export and real-time backend integration deployed to Vercel.

**AI Engineer**
Integrated HuggingFace free inference API with Mistral 7B into an automated QA report generation pipeline producing natural language codebase summaries at zero API cost using open source models.

**QA Engineer**
Built automated code quality scanner and CI/CD health monitor in Python and Java surfacing pass/fail trends, test coverage ratios, TODO density and quality scores across connected GitHub repositories.

---

## Status

All phases complete and live in production.

| Phase | Status | Description |
|---|---|---|
| 1 | Complete | Next.js frontend with animated landing page |
| 2 | Complete | Java Spring Boot REST API with GitHub and HuggingFace integration |
| 3 | Complete | Python static analysis, coverage tracking and report generation |
| 4 | Complete | Dashboard UI with animated charts and real-time data |
| 5 | Complete | QA report page with markdown rendering and PDF export |
| 6 | Complete | GitHub Actions CI/CD across all three layers |
| 7 | Complete | Deployed to Vercel and Railway, fully live |

---

<div align="center">
Built by Ibrahim Cheena
</div>
