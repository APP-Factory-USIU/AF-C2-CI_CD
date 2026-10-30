import React, { useState } from 'react';
import { Copy, Check, FileCode, Folder, Terminal, Shield, BookOpen, Layers } from 'lucide-react';
import { REPO_FILES, RepoFile } from '../data/repoFiles';

export const FileExplorer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>('src/app.ts');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedFile = REPO_FILES.find((f) => f.path === selectedFilePath) || REPO_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (category: RepoFile['category']) => {
    switch (category) {
      case 'source':
        return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
      case 'docker':
        return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      case 'ci':
        return <Terminal className="w-3.5 h-3.5 text-purple-400" />;
      case 'config':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'tests':
        return <Check className="w-3.5 h-3.5 text-emerald-400" />;
      case 'docs':
        return <BookOpen className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-xl font-bold text-white tracking-tight">Repository File Explorer</h2>
        <p className="text-sm text-slate-400 mt-1">
          Explore all production repository files, configuration templates, Dockerfiles, and CI/CD pipelines created for the course.
        </p>

        {/* File Explorer Layout: Sidebar + Code Window */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-sky-400" />
              <span>Project Structure ({REPO_FILES.length} Files)</span>
            </div>

            <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {REPO_FILES.map((file) => {
                const isSelected = selectedFilePath === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-950/60 text-white font-medium border border-sky-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {getCategoryIcon(file.category)}
                      <span className="font-mono truncate">{file.path}</span>
                    </div>
                    {file.path.includes('broken') && (
                      <span className="text-[10px] text-rose-400 font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-950/50 shrink-0">
                        Broken
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Viewer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{selectedFile.path}</span>
                  <span className="text-[11px] text-slate-500 capitalize">({selectedFile.language})</span>
                </div>
                <div className="text-xs text-slate-400 line-clamp-1">{selectedFile.description}</div>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-md transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[550px] overflow-y-auto bg-[#070b14] leading-relaxed select-text">
              <pre className="table">
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-900/40">
                    <span className="table-cell select-none text-slate-600 pr-4 text-right tabular-nums w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
