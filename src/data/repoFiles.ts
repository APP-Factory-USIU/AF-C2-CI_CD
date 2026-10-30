export interface RepoFile {
  path: string;
  name: string;
  language: string;
  category: 'source' | 'config' | 'ci' | 'docker' | 'docs' | 'tests';
  description: string;
  content: string;
}

export const REPO_FILES: RepoFile[] = [
  {
    path: 'src/app.ts',
    name: 'app.ts',
    language: 'typescript',
    category: 'source',
    description: 'Express API setup with fail-fast environment validation and protected calculate route.',
    content: `import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { calculate, MathOperation } from './math';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates that required environment variables are set before starting the application.
 * In a university DevOps setting, this demonstrates that application initialization
 * depends on external configuration injected by the runtime environment (Docker or CI runner).
 */
export function validateEnv(): void {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_secret_here_replace_me') {
    throw new Error(
      'FATAL ERROR [CONFIG]: Missing required environment variable "API_KEY".\\n' +
      'The application cannot start without an authenticated API_KEY.\\n' +
      'Fix: Ensure .env is populated from .env.example, or pass -e API_KEY=... in Docker, or define env.API_KEY in your CI workflow.'
    );
  }
}

export function createApp(): Express {
  // Enforce environment validation on application startup
  validateEnv();

  const app = express();
  app.use(express.json());

  // Health check endpoint (for Docker HEALTHCHECK and orchestrator probes)
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Authentication middleware: Verifies incoming request has valid x-api-key or apiKey query
  const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
    const providedKey = req.headers['x-api-key'] || req.query.apiKey;
    const expectedKey = process.env.API_KEY;

    if (!providedKey || providedKey !== expectedKey) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key. Provide the x-api-key header or apiKey query parameter.',
      });
      return;
    }
    next();
  };

  /**
   * Main calculation endpoint
   * GET /calculate?a=10&b=5&op=add
   * POST /calculate body: { a: 10, b: 5, operation: "add" }
   */
  const handleCalculate = (req: Request, res: Response) => {
    try {
      const a = Number(req.body?.a ?? req.query.a);
      const b = Number(req.body?.b ?? req.query.b);
      const op = (req.body?.operation ?? req.query.op ?? 'add') as MathOperation;

      if (isNaN(a) || isNaN(b)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Parameters "a" and "b" must be valid numeric values.',
        });
        return;
      }

      const result = calculate(a, b, op);
      res.status(200).json({
        a,
        b,
        operation: op,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown calculation error';
      res.status(400).json({
        error: 'Calculation Error',
        message: errorMessage,
      });
    }
  };

  app.get('/calculate', requireApiKey, handleCalculate);
  app.post('/calculate', requireApiKey, handleCalculate);

  return app;
}

export default createApp;`,
  },
  {
    path: 'src/math.ts',
    name: 'math.ts',
    language: 'typescript',
    category: 'source',
    description: 'Pure calculation library with addition, subtraction, multiplication, division, and power.',
    content: `/**
 * Math utility module for course demonstration.
 * Provides pure arithmetic functions with explicit boundary validation.
 */

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero is not permitted');
  }
  return a / b;
}

export function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

export function calculate(a: number, b: number, operation: MathOperation): number {
  switch (operation) {
    case 'add':
      return add(a, b);
    case 'subtract':
      return subtract(a, b);
    case 'multiply':
      return multiply(a, b);
    case 'divide':
      return divide(a, b);
    case 'power':
      return power(a, b);
    default:
      throw new Error(\`Unsupported operation: "\${operation}"\`);
  }
}`,
  },
  {
    path: 'src/server.ts',
    name: 'server.ts',
    language: 'typescript',
    category: 'source',
    description: 'Server entrypoint that initializes the app and binds to process.env.PORT.',
    content: `import dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

const port = process.env.PORT || 3000;

try {
  const app = createApp();
  app.listen(port, () => {
    console.log(\`[INFO] DevOps Course Service listening on port \${port}\`);
    console.log(\`[INFO] Health check available at http://localhost:\${port}/health\`);
    console.log(\`[INFO] Calculation endpoint at http://localhost:\${port}/calculate\`);
  });
} catch (error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[FATAL] Server initialization failed:');
  console.error(msg);
  process.exit(1);
}`,
  },
  {
    path: 'tests/math.test.ts',
    name: 'math.test.ts',
    language: 'typescript',
    category: 'tests',
    description: 'Jest unit tests covering arithmetic logic and boundary conditions.',
    content: `import { add, subtract, multiply, divide, power, calculate } from '../src/math';

describe('Math Module Unit Tests', () => {
  describe('Basic Operations', () => {
    test('adds two numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });

    test('subtracts two numbers correctly', () => {
      expect(subtract(10, 4)).toBe(6);
      expect(subtract(2, 5)).toBe(-3);
    });

    test('multiplies two numbers correctly', () => {
      expect(multiply(3, 7)).toBe(21);
      expect(multiply(-2, 4)).toBe(-8);
      expect(multiply(5, 0)).toBe(0);
    });

    test('divides two numbers correctly', () => {
      expect(divide(20, 4)).toBe(5);
      expect(divide(7, 2)).toBe(3.5);
    });

    test('throws error on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero is not permitted');
    });

    test('computes power exponents correctly', () => {
      expect(power(2, 3)).toBe(8);
      expect(power(5, 0)).toBe(1);
    });
  });

  describe('Calculator Dispatcher', () => {
    test('dispatches add operation', () => {
      expect(calculate(4, 5, 'add')).toBe(9);
    });

    test('dispatches divide operation', () => {
      expect(calculate(15, 3, 'divide')).toBe(5);
    });

    test('throws error for unsupported operation', () => {
      // @ts-expect-error testing invalid runtime input
      expect(() => calculate(1, 2, 'modulus')).toThrow('Unsupported operation');
    });
  });
});`,
  },
  {
    path: 'tests/app.test.ts',
    name: 'app.test.ts',
    language: 'typescript',
    category: 'tests',
    description: 'Integration test verifying fail-fast startup when API_KEY is missing.',
    content: `import { createApp, validateEnv } from '../src/app';

describe('Application Environment & API Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clone process.env before each test to isolate mutations
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    test('passes validation when API_KEY is set in environment', () => {
      process.env.API_KEY = 'valid_test_secret_key_123';
      expect(() => validateEnv()).not.toThrow();
    });

    test('throws fatal configuration error when API_KEY is missing', () => {
      delete process.env.API_KEY;
      expect(() => validateEnv()).toThrow(/Missing required environment variable "API_KEY"/);
    });

    test('throws fatal configuration error when API_KEY is default placeholder', () => {
      process.env.API_KEY = 'your_secret_here_replace_me';
      expect(() => validateEnv()).toThrow(/Missing required environment variable "API_KEY"/);
    });
  });

  describe('Express App Initialization', () => {
    test('successfully instantiates when valid API_KEY is provided', () => {
      process.env.API_KEY = 'ci_test_pipeline_key';
      const app = createApp();
      expect(app).toBeDefined();
    });

    test('refuses to start when API_KEY is omitted in test runner', () => {
      delete process.env.API_KEY;
      expect(() => createApp()).toThrow(/Missing required environment variable "API_KEY"/);
    });
  });
});`,
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    language: 'dockerfile',
    category: 'docker',
    description: 'Multi-stage Docker build separating TypeScript compilation from the lean Alpine production runner.',
    content: `# ==============================================================================
# Multi-Stage Dockerfile for Reproducible Node.js + TypeScript Environment
# University Course: Software Engineering & DevOps
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Builder
# Purpose: Compile TypeScript to JavaScript with all devDependencies.
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies required for tsc build)
RUN npm ci

# Copy application source code
COPY src/ ./src/

# Compile TypeScript to dist/ directory
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Production Runner
# Purpose: Minimal, secure runtime container containing only compiled JS and production deps.
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production environment flag
ENV NODE_ENV=production
ENV PORT=3000

# Copy dependency manifests
COPY package*.json ./

# Install ONLY production dependencies (pruning compilers, types, and test tools)
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from Stage 1
COPY --from=builder /usr/src/app/dist ./dist

# Security Hardening: Switch from root to non-privileged 'node' user provided by Alpine
USER node

# Expose API port
EXPOSE 3000

# Health check to allow container orchestrators (or Docker) to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the compiled Node.js application
CMD ["node", "dist/server.js"]`,
  },
  {
    path: '.dockerignore',
    name: '.dockerignore',
    language: 'text',
    category: 'docker',
    description: 'Ensures host node_modules, local .env secrets, and test files are never sent to Docker daemon.',
    content: `# Ignore node_modules from host machine to guarantee clean build inside container
node_modules/

# Ignore compiled artifacts from host
dist/
build/
coverage/

# Crucial: Never bake sensitive secrets into the image layers
.env
.env.*
!.env.example

# Version control & OS metadata
.git/
.github/
.DS_Store
*.log
npm-debug.log*

# Test files not needed in production container
tests/
jest.config.*`,
  },
  {
    path: '.github/workflows/ci.yml',
    name: 'ci.yml',
    language: 'yaml',
    category: 'ci',
    description: 'Deterministic 3-job GitHub Actions pipeline: Lint -> Test (with env secrets) -> Docker Build.',
    content: `name: Continuous Integration (CI)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Code Quality & Linting
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies (Strict Lockfile)
        run: npm ci

      - name: Run Linter (ESLint & TypeCheck)
        run: npm run lint

  test:
    name: Unit & Integration Tests
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies (Strict Lockfile)
        run: npm ci

      - name: Run Test Suite (Jest)
        # Crucial DevOps Concept: In CI runners, environment variables are not loaded
        # from a host .env file (which is gitignored). They must be explicitly declared!
        env:
          NODE_ENV: test
          PORT: 3000
          API_KEY: \${{ secrets.API_KEY || 'ci_verified_pipeline_test_secret_key' }}
        run: npm test

  build:
    name: Docker Image Multi-Stage Build
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker Image (Dry Run & Verification)
        run: |
          docker build \\
            --tag devops-course-api:latest \\
            --tag devops-course-api:\${{ github.sha }} \\
            .

      - name: Verify Built Container Structure
        run: |
          echo "Verifying image size and layer generation..."
          docker images devops-course-api:latest`,
  },
  {
    path: '.github/workflows/ci-broken.yml',
    name: 'ci-broken.yml',
    language: 'yaml',
    category: 'ci',
    description: 'The broken variant for student pairs to repair (omits API_KEY in CI test step).',
    content: `# ==============================================================================
# BROKEN VARIANT FOR STUDENT PAIR-PROGRAMMING LAB EXERCISE
# File: .github/workflows/ci-broken.yml
# 
# LAB ASSIGNMENT INSTRUCTIONS:
# This workflow represents a realistic continuous integration failure encountered
# when deploying production code. When this workflow runs on GitHub Actions, the
# "test" job fails with exit code 1, blocking downstream Docker image creation.
#
# BUG IDENTIFICATION:
# Notice that the \`test\` job below invokes \`npm test\`, BUT omits the \`API_KEY\`
# environment variable.
# Because the application's \`app.ts\` requires \`process.env.API_KEY\` to start,
# the test suite crashes with:
#   "FATAL ERROR [CONFIG]: Missing required environment variable 'API_KEY'"
#
# YOUR MISSION AS A STUDENT PAIR:
# 1. Inspect the error logs from the CI run.
# 2. Identify why tests passed on a developer's local machine (where a .env file exists),
#    yet crashed inside the ephemeral GitHub Actions runner.
# 3. Fix this workflow by properly injecting the required environment variable into
#    the test step using GitHub Secrets or default step env:
#       env:
#         API_KEY: \${{ secrets.API_KEY || 'ci_test_secret_key' }}
# ==============================================================================

name: Broken CI Pipeline (Student Lab Challenge)

on:
  workflow_dispatch:
  pull_request:
    branches: [ broken-exercise-* ]

jobs:
  lint:
    name: Code Quality & Linting
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

  test:
    name: Unit & Integration Tests (FAILS HERE!)
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # ------------------------------------------------------------------------
      # THE CLASSIC DEVOPS TRAP:
      # Developer forgot that .env is in .gitignore!
      # The CI runner has no .env file, and no env: block is provided here.
      # Result: process.env.API_KEY is undefined -> Fatal Exception -> Exit code 1
      # ------------------------------------------------------------------------
      - name: Run Test Suite without required secrets
        env:
          NODE_ENV: test
          # BUG: API_KEY is completely missing here!
        run: npm test

  build:
    name: Docker Image Multi-Stage Build
    needs: [lint, test] # Blocked because 'test' fails!
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Build Docker Image
        run: docker build -t devops-course-api:latest .`,
  },
  {
    path: '.env.example',
    name: '.env.example',
    language: 'bash',
    category: 'config',
    description: 'Environment variable blueprint demonstrating 12-factor configuration.',
    content: `# ==============================================================================
# Environment Configuration Template (.env.example)
# University Course: Software Engineering & DevOps
# Lesson: Reproducible Environments and Continuous Integration (CI)
# ==============================================================================

# Application Port (default: 3000)
PORT=3000

# Runtime Environment (development | test | production)
NODE_ENV=development

# Authentication Secret (REQUIRED for application startup and route protection)
# Local setup: copy this file to \`.env\` and assign your own secret token
# Docker setup: passed via \`docker run --env-file .env\`
# CI runner setup: set in workflow step \`env: API_KEY: ...\` or via GitHub Secrets
API_KEY=course_demo_secret_key_change_me`,
  },
  {
    path: '.gitignore',
    name: '.gitignore',
    language: 'text',
    category: 'config',
    description: 'Prevents secrets (.env), dependencies, and build artifacts from leaking into Git.',
    content: `# Dependencies
node_modules/

# Production build artifacts
dist/
build/
coverage/

# OS and logs
.DS_Store
*.log
npm-debug.log*

# CRITICAL SECURITY RULE:
# Never commit real environment secrets to source control!
.env
.env.*
!.env.example`,
  },
  {
    path: 'package.json',
    name: 'package.json',
    language: 'json',
    category: 'config',
    description: 'Dependency manifest defining scripts for linting, testing, building, and running.',
    content: `{
  "name": "devops-reproducible-ci",
  "version": "1.0.0",
  "description": "University lab on Reproducible Environments & CI with Docker and GitHub Actions",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "tsx src/server.ts",
    "build": "tsc",
    "lint": "eslint src/ tests/",
    "test": "jest",
    "test:watch": "jest --watch",
    "clean": "rm -rf dist coverage"
  },
  "dependencies": {
    "dotenv": "^17.2.3",
    "express": "^4.21.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.14",
    "@types/node": "^22.14.0",
    "eslint": "^9.20.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "tsx": "^4.21.0",
    "typescript": "^5.7.0"
  }
}`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    description: 'Complete student lab guide with Docker reproducible commands and grading rubric.',
    content: `# Software Engineering & DevOps: Reproducible Environments & CI

A university-level instructional repository designed to teach the fundamentals of **reproducible execution environments**, **multi-stage containerization**, and **automated continuous integration (CI)** pipelines.

## 🚀 Clean-Run Instructions

1. **Clone repo**:
   \`\`\`bash
   git clone <repo-url>
   cd devops-reproducible-ci
   \`\`\`

2. **Configure environment**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env and set API_KEY=my_secure_student_key
   \`\`\`

3. **Build multi-stage Docker container**:
   \`\`\`bash
   docker build -t devops-course-api:latest .
   \`\`\`

4. **Run container with environment file**:
   \`\`\`bash
   docker run --rm -it -p 3000:3000 --env-file .env devops-course-api:latest
   \`\`\`

5. **Test endpoints**:
   \`\`\`bash
   # Health check
   curl http://localhost:3000/health

   # Authorized calculation
   curl -H "x-api-key: my_secure_student_key" "http://localhost:3000/calculate?a=12&b=4&op=multiply"
   \`\`\`

See the full README.md in the repository root for the student pair debugging guide and rubric!`,
  },
];
