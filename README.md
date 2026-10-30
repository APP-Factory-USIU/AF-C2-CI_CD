# Software Engineering & DevOps: Reproducible Environments & CI

[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?style=flat-square&logo=githubactions)](https://github.com/)
[![Docker Multi-Stage](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x%20Alpine-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325?style=flat-square&logo=jest)](https://jestjs.io/)

A university-level instructional repository designed to teach the fundamentals of **reproducible execution environments**, **multi-stage containerization**, and **automated continuous integration (CI)** pipelines.

---

## 🎯 Educational Objectives

By completing this laboratory module, students will learn:
1. **The "Works on My Machine" Anti-Pattern**: Why developer workstations differ (OS, Node versions, local environment variables) and how containerization eliminates machine drift.
2. **Multi-Stage Docker Builds**: How to separate heavy compilation tooling (TypeScript, devDependencies) from lightweight, hardened production runtime artifacts.
3. **Twelve-Factor App Configuration (Principle III)**: Why configuration must be strictly separated from code, stored in environment variables, and never checked into version control.
4. **CI Pipeline Invariants**: How automated GitHub Actions enforce deterministic quality gates (Linting $\to$ Testing $\to$ Container Packaging) on every pull request.
5. **CI Debugging & Secret Ingestion**: How to diagnose pipeline failures caused by omitted environment variables in ephemeral CI runners.

---

## 📂 Repository Architecture

```text
├── .env.example                 # Environment template with dummy variables
├── .gitignore                   # Excludes .env, node_modules/, dist/, coverage/
├── .dockerignore                # Prevents local artifacts and secrets from leaking into images
├── Dockerfile                   # Two-stage multi-stage build (builder -> runner)
├── .github/
│   └── workflows/
│       ├── ci.yml               # Production CI pipeline (Lint -> Test -> Docker Build)
│       └── ci-broken.yml        # Intentional failing pipeline for student debugging
├── src/
│   ├── app.ts                   # Express server definition & startup env validation
│   ├── math.ts                  # Pure arithmetic utility functions
│   └── server.ts                # Application process entrypoint (app.listen)
├── tests/
│   ├── app.test.ts              # Integration tests for startup env validation
│   └── math.test.ts             # Unit tests for calculation logic
├── package.json                 # Project dependencies & npm scripts
├── tsconfig.json                # TypeScript compilation configuration
└── README.md                    # Clean-run lab guide (this document)
```

---

## 🚀 The Clean-Run Guide (Step-by-Step)

Follow these steps to demonstrate that the service runs identically on any workstation with Docker installed, without requiring Node.js or TypeScript installed on your host machine.

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-university-org/devops-reproducible-ci.git
cd devops-reproducible-ci
```

### Step 2: Configure Your Environment Variables

The application enforces a **fail-fast startup check**: if `API_KEY` is undefined or contains the default placeholder, the server aborts initialization immediately.

Create your local `.env` file by copying the template:

```bash
cp .env.example .env
```

Open `.env` in your editor and set your own secret key:

```env
PORT=3000
NODE_ENV=development
API_KEY=student_super_secret_token_42
```

> ⚠️ **Critical Security Note**: Notice that `.env` is listed in `.gitignore`. It will **never** be committed to Git. Only `.env.example` is tracked.

### Step 3: Build the Multi-Stage Container

Execute Docker build from the repository root:

```bash
docker build -t devops-course-api:latest .
```

#### What happens during this build?
* **Stage 1 (`builder`)**: Uses `node:20-alpine`, installs all dependencies (including TypeScript compilers and types), and runs `npm run build` to output compiled JavaScript into `/usr/src/app/dist`.
* **Stage 2 (`runner`)**: Starts from a fresh minimal `node:20-alpine` base, installs **only** production dependencies (`npm ci --omit=dev`), copies just the compiled `dist/` directory from Stage 1, switches to the unprivileged `USER node` for security, and sets the container entrypoint.
* **Result**: The final container image is ~118MB instead of ~890MB, contains zero source files or compilers, and runs reproducibly on any Docker host.

### Step 4: Run the Container

Launch the container, passing your local `.env` file into the container runtime:

```bash
docker run --rm -it \
  --name course-api \
  -p 3000:3000 \
  --env-file .env \
  devops-course-api:latest
```

You should see the startup confirmation in your terminal:
```text
[INFO] DevOps Course Service listening on port 3000
[INFO] Health check available at http://localhost:3000/health
[INFO] Calculation endpoint at http://localhost:3000/calculate
```

---

## 🧪 Verifying the Endpoints (Curl)

Open a second terminal window to test the running container.

### 1. Health Probe (No authentication required)

```bash
curl -i http://localhost:3000/health
```

**Expected Response (`200 OK`):**
```json
{
  "status": "healthy",
  "environment": "production",
  "uptimeSeconds": 14,
  "timestamp": "2026-10-30T07:30:00.000Z"
}
```

### 2. Calculation Endpoint Without Key (Tests 401 Unauthorized)

```bash
curl -i "http://localhost:3000/calculate?a=12&b=4&op=multiply"
```

**Expected Response (`401 Unauthorized`):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing API key. Provide the x-api-key header or apiKey query parameter."
}
```

### 3. Calculation With Valid `x-api-key` Header

```bash
curl -i -H "x-api-key: student_super_secret_token_42" \
  "http://localhost:3000/calculate?a=12&b=4&op=multiply"
```

**Expected Response (`200 OK`):**
```json
{
  "a": 12,
  "b": 4,
  "operation": "multiply",
  "result": 48,
  "timestamp": "2026-10-30T07:31:15.000Z"
}
```

### 4. POST Request with JSON Body

```bash
curl -i -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -H "x-api-key: student_super_secret_token_42" \
  -d '{"a": 100, "b": 25, "operation": "divide"}'
```

**Expected Response (`200 OK`):**
```json
{
  "a": 100,
  "b": 25,
  "operation": "divide",
  "result": 4,
  "timestamp": "2026-10-30T07:32:00.000Z"
}
```

---

## 🛠️ The Continuous Integration Pipeline (`ci.yml`)

The repository includes a GitHub Actions workflow `.github/workflows/ci.yml` that triggers on all pushes and pull requests to `main`.

It defines three sequential quality gates:
1. **`lint`**: Runs `npm run lint` (ESLint and TypeScript strict checks).
2. **`test`**: Runs Jest unit and integration tests. Notice that the CI workflow explicitly declares the `API_KEY` variable in the test job's `env` section, ensuring the tests pass without a host `.env` file!
3. **`build`**: Executes a Docker build inside the GitHub Actions runner to guarantee that the multi-stage build compiles cleanly.

---

## 🔬 Student Pair Challenge: Repairing `ci-broken.yml`

In this lab, student pairs are tasked with diagnosing and fixing `.github/workflows/ci-broken.yml`.

### The Problem Description
A new developer pushed a feature branch and noticed their GitHub Actions pipeline turned **RED** ❌:
* The `lint` job succeeded.
* The `test` job failed with exit code 1.
* The `build` job was skipped because `needs: [lint, test]` was blocked.

### Viewing the Error in CI Runner Logs
```text
FAIL tests/app.test.ts
  ● Application Environment & API Tests › Express App Initialization › refuses to start when API_KEY is omitted in test runner

  FATAL ERROR [CONFIG]: Missing required environment variable "API_KEY".
  The application cannot start without an authenticated API_KEY.
  Fix: Ensure .env is populated from .env.example, or pass -e API_KEY=... in Docker, or define env.API_KEY in your CI workflow.
```

### Why did this happen?
On the developer's laptop, tests passed because they had created a local `.env` file. However:
1. `.env` is ignored by Git (by design, to avoid leaking credentials).
2. The GitHub Actions runner checks out a fresh, pristine copy of the repository that does **not** have a `.env` file.
3. In `ci-broken.yml`, the author forgot to declare `env: API_KEY: ...` in the test step.

### Your Task
1. Inspect `.github/workflows/ci-broken.yml`.
2. Locate the `Run Test Suite` step in the `test` job.
3. Inject the `API_KEY` environment variable into the workflow step:
   ```yaml
   - name: Run Test Suite
     env:
       NODE_ENV: test
       API_KEY: ${{ secrets.API_KEY || 'ci_test_secret_key' }}
     run: npm test
   ```
4. Push your changes and observe the pipeline turn **GREEN** ✅.

---

## 📋 Lab Grading Rubric (For Instructors & TAs)

| Criteria | Points | Verification Method |
| :--- | :---: | :--- |
| **Reproducibility** | 25% | Application builds and passes health checks using solely `docker build` and `docker run` |
| **Multi-Stage Build Efficiency** | 20% | Final container uses Alpine, has no TypeScript compiler, and runs as non-root `node` |
| **Config & Secrets Discipline** | 20% | `.env` is gitignored; `.env.example` documented; app fails fast if `API_KEY` is absent |
| **CI Pipeline Architecture** | 15% | `.github/workflows/ci.yml` has distinct `lint`, `test`, and `build` jobs |
| **Pair Debugging Challenge** | 20% | Successful identification and repair of the missing environment variable in `ci-broken.yml` |

---

## 📜 License
Apache-2.0. Developed for University Software Engineering & DevOps coursework.
