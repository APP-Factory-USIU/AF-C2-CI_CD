import React, { useState } from 'react';
import { Play, Copy, Check, ShieldAlert, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import { calculate, MathOperation } from '../math';

export const ApiSandbox: React.FC = () => {
  const [a, setA] = useState<number>(12);
  const [b, setB] = useState<number>(4);
  const [operation, setOperation] = useState<MathOperation>('multiply');
  const [apiKey, setApiKey] = useState<string>('course_demo_secret_key_change_me');
  const [curlCopied, setCurlCopied] = useState<boolean>(false);

  // Expected API key from .env.example
  const EXPECTED_KEY = 'course_demo_secret_key_change_me';

  // Compute simulated response
  const isKeyValid = apiKey === EXPECTED_KEY;
  let statusCode = 200;
  let statusText = 'OK';
  let responseBody: Record<string, unknown> = {};

  if (!apiKey || apiKey.trim() === '') {
    statusCode = 401;
    statusText = 'Unauthorized';
    responseBody = {
      error: 'Unauthorized',
      message: 'Invalid or missing API key. Provide the x-api-key header or apiKey query parameter.',
    };
  } else if (!isKeyValid) {
    statusCode = 401;
    statusText = 'Unauthorized';
    responseBody = {
      error: 'Unauthorized',
      message: 'Invalid API key provided.',
    };
  } else {
    try {
      const result = calculate(a, b, operation);
      statusCode = 200;
      statusText = 'OK';
      responseBody = {
        a,
        b,
        operation,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      statusCode = 400;
      statusText = 'Bad Request';
      responseBody = {
        error: 'Calculation Error',
        message: err instanceof Error ? err.message : 'Unknown calculation error',
      };
    }
  }

  const generatedCurl = `curl -i -X POST http://localhost:3000/calculate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || 'YOUR_KEY'}" \\
  -d '{"a": ${a}, "b": ${b}, "operation": "${operation}"}'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-xl font-bold text-white tracking-tight">Interactive Express API Playground</h2>
        <p className="text-sm text-slate-400 mt-1">
          Test the Express API calculation routes and verify the fail-fast authentication middleware requiring the <code className="text-sky-300 font-mono">x-api-key</code> header.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Form */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">HTTP Request Parameters</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                POST /calculate
              </span>
            </div>

            {/* Inputs: a and b */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Parameter &ldquo;a&rdquo;</label>
                <input
                  type="number"
                  value={a}
                  onChange={(e) => setA(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Parameter &ldquo;b&rdquo;</label>
                <input
                  type="number"
                  value={b}
                  onChange={(e) => setB(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Operation Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Operation</label>
              <div className="grid grid-cols-5 gap-2">
                {(['add', 'subtract', 'multiply', 'divide', 'power'] as MathOperation[]).map((op) => (
                  <button
                    key={op}
                    onClick={() => setOperation(op)}
                    className={`py-2 text-xs font-medium rounded-lg border capitalize transition-colors cursor-pointer ${
                      operation === op
                        ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Header Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">Request Header &ldquo;x-api-key&rdquo;</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setApiKey(EXPECTED_KEY)}
                    className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                  >
                    Set Valid Key
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    onClick={() => setApiKey('')}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear Key (401)
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Generated Curl Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Terminal Equivalent (cURL)</span>
                </span>
                <button
                  onClick={copyCurl}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                >
                  {curlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{curlCopied ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#070b14] border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto select-all">
                {generatedCurl}
              </div>
            </div>
          </div>

          {/* Response Inspector */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Response Preview</span>
              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  statusCode === 200
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
                    : statusCode === 401
                    ? 'text-rose-400 bg-rose-950/60 border-rose-800'
                    : 'text-amber-400 bg-amber-950/60 border-amber-800'
                }`}
              >
                {statusCode === 200 ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                <span>{statusCode} {statusText}</span>
              </div>
            </div>

            {/* Response Headers */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Response Headers
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-400 space-y-1">
                <div>Content-Type: application/json; charset=utf-8</div>
                <div>X-Powered-By: Express</div>
                <div>Connection: keep-alive</div>
              </div>
            </div>

            {/* Response Body */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                JSON Payload
              </div>
              <pre className="p-4 bg-[#070b14] border border-slate-800 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto max-h-60">
                {JSON.stringify(responseBody, null, 2)}
              </pre>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                {statusCode === 200 && 'Request authenticated successfully via environment variable matching.'}
                {statusCode === 401 && 'Request rejected: Demonstrates why environment secrets must be protected and never hardcoded in client code.'}
                {statusCode === 400 && 'Request failed validation: Handled gracefully by the math calculation boundary checks.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
