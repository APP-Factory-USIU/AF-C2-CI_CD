import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, Copy, Check, Users, ShieldAlert, Award } from 'lucide-react';

export const LabGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copySnippet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Clone Repository & Verify Structure',
      desc: 'Clone the repository and inspect the root directory. Notice that only .env.example is tracked in version control, while .env is gitignored.',
      command: 'git clone <repo-url>\ncd devops-reproducible-ci\nls -la',
    },
    {
      title: '2. Bootstrap Local Environment Configuration',
      desc: 'Copy the template to create your local .env file. Open it and set your own secure API_KEY string.',
      command: 'cp .env.example .env\n# Verify .env contents:\ncat .env',
    },
    {
      title: '3. Build Multi-Stage Docker Container',
      desc: 'Execute Docker build. Watch Stage 1 compile TypeScript into dist/ using devDependencies, then watch Stage 2 assemble the lean Alpine production runner (~118MB).',
      command: 'docker build -t devops-course-api:latest .',
    },
    {
      title: '4. Run Isolated Container with Environment Injection',
      desc: 'Launch the container mapping port 3000 and passing your local .env file into the container runtime.',
      command: 'docker run --rm -it \\\n  --name course-api \\\n  -p 3000:3000 \\\n  --env-file .env \\\n  devops-course-api:latest',
    },
    {
      title: '5. Verify Service & Authenticated Calculation',
      desc: 'Send curl requests in another terminal to test the health check and calculation endpoint using the x-api-key header.',
      command: 'curl -i http://localhost:3000/health\ncurl -i -H "x-api-key: course_demo_secret_key_change_me" \\\n  "http://localhost:3000/calculate?a=12&b=4&op=multiply"',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Course Syllabus &amp; Lab Manual</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Lesson: Reproducible Environments &amp; Continuous Integration (CI)
        </h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-3xl">
          This hands-on module teaches students how to eliminate the infamous &ldquo;works on my machine&rdquo; problem. You will containerize a Node.js + TypeScript Express service with a multi-stage Docker build, configure 12-factor secrets management, and diagnose failing GitHub Actions pipelines.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span>Level: Undergraduate / Graduate Software Engineering</span>
          <span aria-hidden="true">·</span>
          <span>Time: 90 Minutes</span>
          <span aria-hidden="true">·</span>
          <span>Format: Pair Programming</span>
        </div>
      </div>

      {/* Clean Run Steps */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Student Clean-Run Instructions
        </h3>

        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{step.title}</span>
                <button
                  onClick={() => copySnippet(step.command, idx)}
                  className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              <pre className="p-3 bg-[#070b14] border border-slate-800 rounded font-mono text-xs text-emerald-400 overflow-x-auto select-all">
                {step.command}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Student Pair Debugging Challenge */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Student Pair Challenge: The &ldquo;Broken Pipeline&rdquo; Repair</span>
        </div>
        <h3 className="text-base font-bold text-white">
          Mission: Diagnose and Repair `.github/workflows/ci-broken.yml`
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          In pair-programming teams, one student acts as the <strong className="text-white">Driver</strong> (typing commands, submitting commits) and one as the <strong className="text-white">Navigator</strong> (analyzing CI logs, verifying YAML syntax).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="text-xs font-bold text-rose-400">Step 1: Observe the Failure</span>
            <p className="text-xs text-slate-400">
              Trigger the workflow or push a branch. Notice that the <code className="text-white font-mono">lint</code> job passes, but <code className="text-white font-mono">test</code> crashes with <code className="text-white font-mono">Missing required environment variable &ldquo;API_KEY&rdquo;</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="text-xs font-bold text-amber-400">Step 2: Root-Cause Analysis</span>
            <p className="text-xs text-slate-400">
              Discuss why the tests passed on the developer&rsquo;s laptop but failed in CI. Why does a CI runner not have access to your local machine&rsquo;s <code className="text-white font-mono">.env</code>?
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="text-xs font-bold text-emerald-400">Step 3: Fix and Verify</span>
            <p className="text-xs text-slate-400">
              Edit the workflow to supply the missing secret to the test runner step: <code className="text-sky-300 font-mono">API_KEY: {'${{ secrets.API_KEY || \'ci_test_key\' }}'}</code>. Push and verify green!
            </p>
          </div>
        </div>
      </div>

      {/* Grading Rubric */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <Award className="w-4 h-4" />
          <span>Teaching Assistant (TA) &amp; Instructor Grading Rubric</span>
        </div>
        <h3 className="text-base font-bold text-white">Evaluation Criteria &amp; Point Distribution</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Evaluation Criteria</th>
                <th className="py-2.5 px-4 font-semibold">Weight</th>
                <th className="py-2.5 px-4 font-semibold">Verification Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
              <tr>
                <td className="py-3 px-4 font-medium text-white">Environment Reproducibility</td>
                <td className="py-3 px-4 font-mono text-sky-400">25%</td>
                <td className="py-3 px-4 text-slate-400">App builds and serves requests exclusively using docker build and docker run.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Multi-Stage Dockerfile Hygiene</td>
                <td className="py-3 px-4 font-mono text-sky-400">20%</td>
                <td className="py-3 px-4 text-slate-400">Stage 1 compiles TS; Stage 2 prunes devDependencies, runs as USER node, image &lt; 150MB.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Configuration &amp; Secrets Discipline</td>
                <td className="py-3 px-4 font-mono text-sky-400">20%</td>
                <td className="py-3 px-4 text-slate-400">.env is gitignored; .env.example documented; server fails fast if API_KEY is absent.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">CI Pipeline Architecture</td>
                <td className="py-3 px-4 font-mono text-sky-400">15%</td>
                <td className="py-3 px-4 text-slate-400">GitHub Actions workflow has 3 distinct jobs: lint, test, and build.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-white">Pair Debugging Challenge</td>
                <td className="py-3 px-4 font-mono text-sky-400">20%</td>
                <td className="py-3 px-4 text-slate-400">Successful diagnosis and fix of ci-broken.yml with explanation of runner isolation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
