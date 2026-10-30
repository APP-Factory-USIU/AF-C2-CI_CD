import React, { useState } from 'react';
import { Layers, ShieldCheck, Box, HardDrive, Cpu, Check, AlertCircle, ArrowRight, Terminal } from 'lucide-react';

export const DockerVisualizer: React.FC = () => {
  const [includeEnvFlag, setIncludeEnvFlag] = useState<boolean>(true);
  const [selectedStage, setSelectedStage] = useState<'stage1' | 'stage2'>('stage2');

  return (
    <div className="space-y-6">
      {/* Overview & Purpose */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-white tracking-tight">Multi-Stage Docker Architecture</h2>
          <p className="text-sm text-slate-400 mt-1">
            Learn why modern DevOps uses multi-stage builds to decouple heavy TypeScript compilation from the lean, secure production runtime container.
          </p>
        </div>

        {/* Visual Stage Comparison Cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage 1: Builder */}
          <div
            onClick={() => setSelectedStage('stage1')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              selectedStage === 'stage1'
                ? 'bg-sky-950/30 border-sky-500/60 ring-1 ring-sky-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-white">Stage 1: Builder (`builder`)</span>
              </div>
              <span className="text-xs font-mono text-slate-400">~890 MB</span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">FROM</span>
                <span className="text-sky-300 font-mono">node:20-alpine AS builder</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">COPY</span>
                <span>package*.json tsconfig.json ./</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">RUN</span>
                <span>npm ci (installs TypeScript compiler, type defs, devDependencies)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">RUN</span>
                <span>npm run build (emits compiled JavaScript into dist/)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Status: <span className="text-amber-400 font-medium">Ephemeral</span> (Discarded after compilation; never deployed to production).
            </div>
          </div>

          {/* Stage 2: Runner */}
          <div
            onClick={() => setSelectedStage('stage2')}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              selectedStage === 'stage2'
                ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Stage 2: Runner (`runner`)</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">~118 MB (86% smaller)</span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">FROM</span>
                <span className="text-emerald-300 font-mono">node:20-alpine AS runner</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">RUN</span>
                <span>npm ci --omit=dev (production-only modules, prunes dev tools)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">COPY</span>
                <span className="text-emerald-300 font-mono">--from=builder /usr/src/app/dist ./dist</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-mono">USER</span>
                <span className="text-emerald-300 font-mono">node (unprivileged non-root security)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Status: <span className="text-emerald-400 font-medium">Production Image</span> (Shipped to registry & cloud servers).
            </div>
          </div>
        </div>
      </div>

      {/* Metric Breakdown & Layer Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric 1: Image Size Comparison */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <span>Image Footprint Comparison</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Single-Stage (Naive)</span>
                <span className="font-mono text-slate-300">890 MB</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Multi-Stage (Hardened)</span>
                <span className="font-mono text-emerald-400 font-bold">118 MB (-86.7%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '13.3%' }}></div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
            Eliminating compilers (<code className="text-slate-300 font-mono">tsc</code>) and devDependencies speeds up CI pull times, reduces bandwidth costs, and radically shrinks the attack surface.
          </p>
        </div>

        {/* Metric 2: Security & Isolation Audit */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Container Security Posture</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Non-Root User:</strong> Runs as unprivileged <code className="text-sky-300 font-mono">USER node</code> (UID 1000) to prevent container escape exploits.
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Zero Source Code:</strong> Only pre-compiled JS is copied to runner; raw <code className="text-sky-300 font-mono">.ts</code> files are omitted.
              </span>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Dockerignore Shield:</strong> Blocks <code className="text-sky-300 font-mono">.env</code>, <code className="text-sky-300 font-mono">.git/</code>, and host <code className="text-sky-300 font-mono">node_modules/</code>.
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Reproducibility Guarantee */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Reproducibility Matrix</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Base OS</span>
              <span className="font-mono text-white">Alpine Linux 3.19</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Node Engine</span>
              <span className="font-mono text-white">v20.x LTS</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Lockfile Pinning</span>
              <span className="font-mono text-emerald-400 font-medium">npm ci (Strict)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Host Independence</span>
              <span className="text-white">macOS / Windows / Linux</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Runtime Simulator */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
          Interactive Container Launch Simulator
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Test what happens when a student launches the container with or without the required environment configuration.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <div className="font-mono text-xs text-slate-300 flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-emerald-400">$</span>
            <span>docker run --rm -it -p 3000:3000</span>
            {includeEnvFlag ? (
              <span className="text-sky-300 font-semibold bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800">
                --env-file .env
              </span>
            ) : (
              <span className="text-rose-400 font-semibold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800">
                [NO ENV PASSED]
              </span>
            )}
            <span>devops-course-api:latest</span>
          </div>

          <button
            onClick={() => setIncludeEnvFlag(!includeEnvFlag)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 ${
              includeEnvFlag
                ? 'bg-sky-400 text-slate-950 hover:bg-sky-300'
                : 'bg-rose-500 text-white hover:bg-rose-400'
            }`}
          >
            {includeEnvFlag ? 'Toggle Missing --env-file' : 'Restore --env-file .env'}
          </button>
        </div>

        {/* Output Box */}
        <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs">
          {includeEnvFlag ? (
            <div className="space-y-1 text-slate-300">
              <div className="text-emerald-400 font-semibold">[CONTAINER STARTED SUCCESSFULLY]</div>
              <div className="text-slate-400">[INFO] Loaded environment variables from passed runtime config.</div>
              <div className="text-slate-300">[INFO] DevOps Course Service listening on port 3000</div>
              <div className="text-slate-300">[INFO] Health check available at http://localhost:3000/health</div>
              <div className="text-slate-300">[INFO] Calculation endpoint at http://localhost:3000/calculate</div>
              <div className="text-emerald-400/80 mt-2">✓ Container is healthy and ready to accept requests.</div>
            </div>
          ) : (
            <div className="space-y-1 text-rose-400 bg-rose-950/20 p-2 rounded">
              <div className="font-bold">[CONTAINER FAILED TO START - EXIT CODE 1]</div>
              <div className="text-slate-300">
                FATAL ERROR [CONFIG]: Missing required environment variable &ldquo;API_KEY&rdquo;.
              </div>
              <div className="text-slate-400">
                The application cannot start without an authenticated API_KEY.
              </div>
              <div className="text-amber-400 mt-1">
                Fix: Ensure .env is populated and passed via <code className="text-white">--env-file .env</code> or <code className="text-white">-e API_KEY=...</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
