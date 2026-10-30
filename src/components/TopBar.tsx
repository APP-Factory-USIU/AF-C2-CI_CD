import React from 'react';
import { Download } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  isDownloading,
}) => {
  const navItems = [
    { id: 'simulator', label: 'Pipeline Simulator' },
    { id: 'docker', label: 'Multi-Stage Docker' },
    { id: 'files', label: 'Repository Files' },
    { id: 'sandbox', label: 'API Playground' },
    { id: 'guide', label: 'Lab Manual' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element brand wordmark */}
      <button
        onClick={() => setActiveTab('simulator')}
        className="text-lg font-bold tracking-tight text-white hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
      >
        DevOps CI/CD Lab
      </button>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === item.id
                ? 'text-sky-400 underline underline-offset-8 decoration-2 decoration-sky-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-sky-400 hover:bg-sky-300 active:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer shadow-sm shadow-sky-500/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloading ? 'Packaging Zip...' : 'Download Repo (.zip)'}</span>
        </button>
      </div>
    </header>
  );
};
