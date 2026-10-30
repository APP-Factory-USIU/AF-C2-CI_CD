import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, Terminal, ArrowRight, Wrench } from 'lucide-react';

export type PipelineScenario = 'clean' | 'broken_env' | 'broken_node' | 'broken_secret';
export type JobStatus = 'idle' | 'running' | 'success' | 'failure' | 'skipped';

interface JobState {
  id: string;
  name: string;
  status: JobStatus;
  duration: number; // in seconds
  logs: string[];
}

export const PipelineSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<PipelineScenario>('broken_env');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeJobIndex, setActiveJobIndex] = useState<number>(-1);
  const [studentFixApplied, setStudentFixApplied] = useState<boolean>(false);
  const [activeLogTab, setActiveLogTab] = useState<string>('test');

  const [jobs, setJobs] = useState<JobState[]>([
    { id: 'lint', name: 'Lint & Type Check', status: 'idle', duration: 0, logs: [] },
    { id: 'test', name: 'Jest Test Suite', status: 'idle', duration: 0, logs: [] },
    { id: 'build', name: 'Docker Multi-Stage Build', status: 'idle', duration: 0, logs: [] },
  ]);

  const resetPipeline = () => {
    setIsRunning(false);
    setActiveJobIndex(-1);
    setJobs([
      { id: 'lint', name: 'Lint & Type Check', status: 'idle', duration: 0, logs: [] },
      { id: 'test', name: 'Jest Test Suite', status: 'idle', duration: 0, logs: [] },
      { id: 'build', name: 'Docker Multi-Stage Build', status: 'idle', duration: 0, logs: [] },
    ]);
  };

  const handleScenarioChange = (scenario: PipelineScenario) => {
    setSelectedScenario(scenario);
    setStudentFixApplied(false);
    resetPipeline();
    if (scenario === 'clean') {
      setActiveLogTab('lint');
    } else {
      setActiveLogTab('test');
    }
  };

  const runPipeline = () => {
    resetPipeline();
    setIsRunning(true);
    setActiveJobIndex(0);
  };

  useEffect(() => {
    if (!isRunning) return;

    let timeoutId: NodeJS.Timeout;

    if (activeJobIndex === 0) {
      // Running Lint
      setJobs((prev) =>
        prev.map((j, i) => (i === 0 ? { ...j, status: 'running', logs: ['[Step: checkout] Checking out repository ref: refs/heads/main...', '[Step: setup-node] Setting up Node.js v20.12.2 (x64)...', '[Step: npm ci] Validating package-lock.json and installing dependencies...', '[Step: npm run lint] Executing tsc --noEmit && eslint src/ tests/...'] } : j))
      );

      timeoutId = setTimeout(() => {
        // Scenario 2: Node version mismatch breaks during lint / build if simulated on runner
        if (selectedScenario === 'broken_node' && !studentFixApplied) {
          setJobs((prev) => [
            {
              id: 'lint',
              name: 'Lint & Type Check',
              status: 'failure',
              duration: 2.4,
              logs: [
                '[Step: setup-node] Runner active with Node.js v16.20.0',
                '[Error] SyntaxError: Cannot use top-level await outside a module or with target ES2022',
                '[Error] Incompatible Node.js version detected! Engine required: >=20.0.0, current: 16.20.0',
                '##[error] Process completed with exit code 1.',
              ],
            },
            { id: 'test', name: 'Jest Test Suite', status: 'skipped', duration: 0, logs: ['Job skipped due to upstream dependency "lint" failure.'] },
            { id: 'build', name: 'Docker Multi-Stage Build', status: 'skipped', duration: 0, logs: ['Job skipped due to upstream dependency "lint" failure.'] },
          ]);
          setIsRunning(false);
          setActiveJobIndex(-1);
          setActiveLogTab('lint');
          return;
        }

        // Lint passes
        setJobs((prev) =>
          prev.map((j, i) =>
            i === 0
              ? {
                  ...j,
                  status: 'success',
                  duration: 2.1,
                  logs: [
                    ...j.logs,
                    'Checking 5 TypeScript files in /src and /tests...',
                    '  src/app.ts: Clean (0 errors, 0 warnings)',
                    '  src/math.ts: Clean (0 errors, 0 warnings)',
                    '  src/server.ts: Clean (0 errors, 0 warnings)',
                    '  tests/math.test.ts: Clean (0 errors, 0 warnings)',
                    '  tests/app.test.ts: Clean (0 errors, 0 warnings)',
                    'All lint and type checks completed successfully.',
                  ],
                }
              : j
          )
        );
        setActiveJobIndex(1);
      }, 1400);
    } else if (activeJobIndex === 1) {
      // Running Tests
      setActiveLogTab('test');
      setJobs((prev) =>
        prev.map((j, i) => (i === 1 ? { ...j, status: 'running', logs: ['[Step: checkout] Repository workspace active.', '[Step: setup-node] Node.js 20.12.2 environment verified.', '[Step: test runner] Executing jest --config jest.config.cjs --runInBand...'] } : j))
      );

      timeoutId = setTimeout(() => {
        // Scenario 1: Missing API_KEY in CI environment (THE CLASSIC TRAP)
        if (selectedScenario === 'broken_env' && !studentFixApplied) {
          setJobs((prev) => [
            prev[0],
            {
              id: 'test',
              name: 'Jest Test Suite',
              status: 'failure',
              duration: 3.2,
              logs: [
                ...prev[1].logs,
                'PASS tests/math.test.ts (7 tests passed in 410ms)',
                'FAIL tests/app.test.ts',
                '  ● Application Environment & API Tests › Express App Initialization › refuses to start when API_KEY is omitted in test runner',
                '',
                '    FATAL ERROR [CONFIG]: Missing required environment variable "API_KEY".',
                '    The application cannot start without an authenticated API_KEY.',
                '    Fix: Ensure .env is populated from .env.example, or pass -e API_KEY=... in Docker, or define env.API_KEY in your CI workflow.',
                '',
                '      at validateEnv (src/app.ts:16:11)',
                '      at createApp (src/app.ts:28:3)',
                '      at Object.<anonymous> (tests/app.test.ts:32:15)',
                '',
                'Test Suites: 1 failed, 1 passed, 2 total',
                'Tests:       1 failed, 8 passed, 9 total',
                'Snapshots:   0 total',
                'Time:        2.812 s',
                '##[error] Process completed with exit code 1.',
              ],
            },
            {
              id: 'build',
              name: 'Docker Multi-Stage Build',
              status: 'skipped',
              duration: 0,
              logs: ['Job "build" was skipped because dependency "test" returned status: failure.'],
            },
          ]);
          setIsRunning(false);
          setActiveJobIndex(-1);
          return;
        }

        // Scenario 3: Secret scan fails
        if (selectedScenario === 'broken_secret' && !studentFixApplied) {
          setJobs((prev) => [
            prev[0],
            {
              id: 'test',
              name: 'Jest Test Suite',
              status: 'failure',
              duration: 1.8,
              logs: [
                ...prev[1].logs,
                '[Security Step: Secret Scanner (Gitleaks / TruffleHog)]',
                'Scanning git commit tree for high-entropy secrets and production API tokens...',
                '##[error] HIGH SEVERITY LEAK DETECTED:',
                '  File: tests/app.test.ts:14',
                '  Pattern: Raw secret literal "prod_sk_live_9941a87b32c" checked into Git!',
                '  Rule ID: generic-api-key',
                'Policy violation: Git repositories must never contain production secrets. Use GitHub Secrets.',
                '##[error] Process completed with exit code 1.',
              ],
            },
            {
              id: 'build',
              name: 'Docker Multi-Stage Build',
              status: 'skipped',
              duration: 0,
              logs: ['Job skipped due to secret detection policy failure.'],
            },
          ]);
          setIsRunning(false);
          setActiveJobIndex(-1);
          return;
        }

        // Clean test pass
        setJobs((prev) =>
          prev.map((j, i) =>
            i === 1
              ? {
                  ...j,
                  status: 'success',
                  duration: 2.8,
                  logs: [
                    ...j.logs,
                    'PASS tests/math.test.ts (7 tests passed in 380ms)',
                    '  Math Module Unit Tests',
                    '    ✓ adds two numbers correctly (4 ms)',
                    '    ✓ subtracts two numbers correctly (1 ms)',
                    '    ✓ multiplies two numbers correctly (1 ms)',
                    '    ✓ divides two numbers correctly (2 ms)',
                    '    ✓ throws error on division by zero (2 ms)',
                    '    ✓ computes power exponents correctly (1 ms)',
                    '    ✓ dispatches calculator operations (2 ms)',
                    'PASS tests/app.test.ts (4 tests passed in 520ms)',
                    '  Application Environment & API Tests',
                    '    ✓ passes validation when API_KEY is set in environment (12 ms)',
                    '    ✓ throws fatal configuration error when API_KEY is missing (3 ms)',
                    '    ✓ throws fatal configuration error when API_KEY is default placeholder (2 ms)',
                    '    ✓ successfully instantiates when valid API_KEY is provided (18 ms)',
                    '',
                    'Test Suites: 2 passed, 2 total',
                    'Tests:       11 passed, 11 total',
                    'Snapshots:   0 total',
                    'Time:        2.314 s',
                    'Environment variable API_KEY validated: [VERIFIED via secrets.API_KEY]',
                  ],
                }
              : j
          )
        );
        setActiveJobIndex(2);
      }, 1600);
    } else if (activeJobIndex === 2) {
      // Running Docker Multi-Stage Build
      setActiveLogTab('build');
      setJobs((prev) =>
        prev.map((j, i) => (i === 2 ? { ...j, status: 'running', logs: ['[Step: setup-buildx] Initializing Docker Buildx v0.14.0...', '[Step: docker build] Executing multi-stage build: docker build -t devops-course-api:latest .'] } : j))
      );

      timeoutId = setTimeout(() => {
        setJobs((prev) =>
          prev.map((j, i) =>
            i === 2
              ? {
                  ...j,
                  status: 'success',
                  duration: 4.6,
                  logs: [
                    ...j.logs,
                    '#1 [internal] load build definition from Dockerfile',
                    '#1 transferring dockerfile: 1.48kB done',
                    '#2 [internal] load .dockerignore',
                    '#2 transferring context: 380B done',
                    '#3 [builder 1/5] FROM docker.io/library/node:20-alpine AS builder',
                    '#4 [builder 2/5] WORKDIR /usr/src/app',
                    '#5 [builder 3/5] COPY package*.json tsconfig.json ./',
                    '#6 [builder 4/5] RUN npm ci',
                    '#6 added 84 packages in 1.4s',
                    '#7 [builder 5/5] RUN npm run build',
                    '#7 > tsc',
                    '#7 Output compiled JavaScript to dist/ directory: server.js, app.js, math.js',
                    '#8 [runner 1/6] FROM docker.io/library/node:20-alpine AS runner',
                    '#9 [runner 2/6] WORKDIR /usr/src/app',
                    '#10 [runner 3/6] COPY package*.json ./',
                    '#11 [runner 4/6] RUN npm ci --omit=dev && npm cache clean --force',
                    '#11 added 22 production packages (pruned 62 devDependencies)',
                    '#12 [runner 5/6] COPY --from=builder /usr/src/app/dist ./dist',
                    '#13 [runner 6/6] USER node',
                    '#14 exporting to image',
                    '#14 naming to docker.io/library/devops-course-api:latest',
                    '-----------------------------------------------------------------',
                    'IMAGE COMPILATION SUMMARY:',
                    '  REPOSITORY             TAG       IMAGE ID       SIZE',
                    '  devops-course-api      latest    e3f19c8402a1   118MB',
                    '  (Stage 1 builder size was 890MB -> 86.7% size reduction!)',
                    '  Security: Running as unprivileged UID 1000 (node)',
                    '  Healthcheck: Configured with wget spider against /health',
                    'Docker Multi-Stage Build completed successfully.',
                  ],
                }
              : j
          )
        );
        setIsRunning(false);
        setActiveJobIndex(-1);
      }, 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [isRunning, activeJobIndex, selectedScenario, studentFixApplied]);

  const activeJobData = jobs.find((j) => j.id === activeLogTab) || jobs[0];

  return (
    <div className="space-y-6">
      {/* Scenario Selection Deck */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">GitHub Actions CI Pipeline Simulator</h2>
            <p className="text-sm text-slate-400 mt-1">
              Select a workflow variant to simulate how continuous integration validates code quality, executes tests with secrets, and builds multi-stage containers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runPipeline}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-sm shadow-sky-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Pipeline Running...' : 'Trigger CI Run'}</span>
            </button>
            <button
              onClick={resetPipeline}
              disabled={isRunning}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Workflow Segmented Controller */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleScenarioChange('clean')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'clean'
                ? 'bg-sky-950/40 border-sky-500/60 text-white ring-1 ring-sky-500/30'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Clean: ci.yml</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">All 3 Gates Pass</div>
            <div className="text-[11px] text-slate-500 mt-1">Lint $\to$ Test with Secrets $\to$ Docker</div>
          </button>

          <button
            onClick={() => handleScenarioChange('broken_env')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'broken_env'
                ? 'bg-rose-950/40 border-rose-500/60 text-white ring-1 ring-rose-500/30'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ci-broken.yml (Lab Focus)</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Missing CI Secret</div>
            <div className="text-[11px] text-slate-500 mt-1">API_KEY missing in test runner</div>
          </button>

          <button
            onClick={() => handleScenarioChange('broken_node')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'broken_node'
                ? 'bg-amber-950/40 border-amber-500/60 text-white ring-1 ring-amber-500/30'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Variant: Version Drift</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Node 16 vs 20 Mismatch</div>
            <div className="text-[11px] text-slate-500 mt-1">Runner on Node 16 breaks on ES2022</div>
          </button>

          <button
            onClick={() => handleScenarioChange('broken_secret')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
              selectedScenario === 'broken_secret'
                ? 'bg-purple-950/40 border-purple-500/60 text-white ring-1 ring-purple-500/30'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Variant: Secret Leak</span>
            </div>
            <div className="text-xs text-slate-300 font-medium">Git Secret Scanner Catch</div>
            <div className="text-[11px] text-slate-500 mt-1">High-entropy token committed to Git</div>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Graph */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Pipeline Execution DAG (Jobs)</h3>
          <div className="text-xs text-slate-400">
            {isRunning ? (
              <span className="text-sky-400 animate-pulse font-medium">Pipeline running...</span>
            ) : jobs.some((j) => j.status === 'failure') ? (
              <span className="text-rose-400 font-medium">Pipeline Failed (Exit Code 1)</span>
            ) : jobs.every((j) => j.status === 'success') ? (
              <span className="text-emerald-400 font-medium">All Jobs Passed</span>
            ) : (
              <span>Ready for execution</span>
            )}
          </div>
        </div>

        {/* DAG Stages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {jobs.map((job, idx) => {
            const isCurrent = activeJobIndex === idx;
            return (
              <div
                key={job.id}
                onClick={() => setActiveLogTab(job.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer relative ${
                  activeLogTab === job.id ? 'ring-2 ring-sky-500/40' : ''
                } ${
                  job.status === 'success'
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : job.status === 'failure'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : job.status === 'running'
                    ? 'bg-sky-950/20 border-sky-500/40 ring-1 ring-sky-400/50'
                    : job.status === 'skipped'
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job {idx + 1}</span>
                  {job.status === 'success' && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Passed</span>
                    </div>
                  )}
                  {job.status === 'failure' && (
                    <div className="flex items-center gap-1 text-xs text-rose-400 font-medium">
                      <XCircle className="w-4 h-4" />
                      <span>Failed</span>
                    </div>
                  )}
                  {job.status === 'running' && (
                    <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Running</span>
                    </div>
                  )}
                  {job.status === 'skipped' && <span className="text-xs text-slate-500 font-medium">Skipped</span>}
                  {job.status === 'idle' && <span className="text-xs text-slate-500">Queued</span>}
                </div>

                <div className="mt-2 font-semibold text-slate-200 text-sm">{job.name}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>
                    {job.id === 'lint' && 'eslint & tsc'}
                    {job.id === 'test' && 'jest test suite'}
                    {job.id === 'build' && 'docker multi-stage'}
                  </span>
                  {job.duration > 0 && <span className="font-mono text-slate-400">{job.duration.toFixed(1)}s</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Fix Challenge for Student Pairs (Only visible when broken scenario selected) */}
      {selectedScenario !== 'clean' && (
        <div className="p-5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-sky-950/30 border border-amber-500/40 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Wrench className="w-4 h-4" />
                <span>Student Pair Repair Challenge</span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                {selectedScenario === 'broken_env' && (
                  <>
                    The test job fails because <code className="text-sky-300 font-mono">app.ts</code> enforces that <code className="text-sky-300 font-mono">process.env.API_KEY</code> is present. The CI runner checked out a clean repo without <code className="text-sky-300 font-mono">.env</code>. Apply the CI workflow environment fix to inject <code className="text-sky-300 font-mono">API_KEY</code> into the test step!
                  </>
                )}
                {selectedScenario === 'broken_node' && (
                  <>
                    The runner is configured with Node 16 while the Dockerfile and source use Node 20. Update <code className="text-sky-300 font-mono">node-version: 20</code> in the workflow to repair the engine mismatch.
                  </>
                )}
                {selectedScenario === 'broken_secret' && (
                  <>
                    A raw API key was committed to Git. Fix by extracting the token to a GitHub Actions Secret and referencing <code className="text-sky-300 font-mono">{'${{ secrets.API_KEY }}'}</code>.
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setStudentFixApplied(!studentFixApplied);
                  resetPipeline();
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  studentFixApplied
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {studentFixApplied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Fix Applied (Click to Revert)</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Apply Workflow Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Diff Box */}
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <div className="text-slate-400 text-[11px] mb-2 font-sans font-semibold uppercase tracking-wider">
              Workflow Diff (.github/workflows/ci.yml):
            </div>
            {selectedScenario === 'broken_env' && (
              <div>
                <div className="text-slate-400">      - name: Run Test Suite (Jest)</div>
                <div className="text-slate-400">        env:</div>
                <div className="text-slate-400">          NODE_ENV: test</div>
                <div className="text-slate-400">          PORT: 3000</div>
                {studentFixApplied ? (
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                    +         API_KEY: {'${{ secrets.API_KEY || \'ci_verified_pipeline_test_secret_key\' }}'}
                  </div>
                ) : (
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded">
                    -         # BUG: API_KEY is omitted! Runner throws "FATAL ERROR [CONFIG]: Missing API_KEY"
                  </div>
                )}
                <div className="text-slate-400">        run: npm test</div>
              </div>
            )}
            {selectedScenario === 'broken_node' && (
              <div>
                <div className="text-slate-400">      - name: Set up Node.js</div>
                <div className="text-slate-400">        uses: actions/setup-node@v4</div>
                <div className="text-slate-400">        with:</div>
                {studentFixApplied ? (
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                    +         node-version: 20  # Matches Dockerfile node:20-alpine
                  </div>
                ) : (
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded">
                    -         node-version: 16  # BUG: Incompatible with ES2022 code & Dockerfile
                  </div>
                )}
              </div>
            )}
            {selectedScenario === 'broken_secret' && (
              <div>
                {studentFixApplied ? (
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                    +   Secret removed from git history. Injected securely via Repository Secrets.
                  </div>
                ) : (
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded">
                    -   Hardcoded secret token committed in tests/app.test.ts line 14.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terminal Runner Log Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-slate-200">GitHub Actions Runner Terminal</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">ubuntu-latest (x64)</span>
          </div>

          {/* Job Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setActiveLogTab(job.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeLogTab === job.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {job.id}.sh {job.status === 'success' ? '✓' : job.status === 'failure' ? '✗' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 font-mono text-xs text-slate-300 h-80 overflow-y-auto space-y-1 select-text bg-[#070b14]">
          {activeJobData.logs.length === 0 ? (
            <div className="text-slate-600 italic py-12 text-center font-sans">
              No logs yet. Click &ldquo;Trigger CI Run&rdquo; to execute the pipeline.
            </div>
          ) : (
            activeJobData.logs.map((log, i) => {
              const isError = log.includes('FATAL ERROR') || log.includes('##[error]') || log.includes('FAIL') || log.includes('Exit code 1');
              const isSuccess = log.includes('PASS') || log.includes('passed') || log.includes('✓') || log.includes('Clean') || log.includes('completed successfully');
              const isStep = log.startsWith('[Step:') || log.startsWith('#');

              return (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    isError
                      ? 'text-rose-400 bg-rose-950/30 px-1 rounded'
                      : isSuccess
                      ? 'text-emerald-400'
                      : isStep
                      ? 'text-sky-300 font-semibold mt-2'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
