import React from 'react';
import { Settings, Cpu, ChevronDown } from 'lucide-react';
import { ModelItem } from '../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedModel: ModelItem;
  onOpenModelPicker: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  selectedModel,
  onOpenModelPicker,
  onOpenSettings,
}) => {
  const navItems = [
    { id: 'models', label: 'Models' },
    { id: 'agent-chat', label: 'Agent Chat' },
    { id: 'single-turn', label: 'Single Turn' },
    { id: 'skills', label: 'Skills' },
    { id: 'mcp', label: 'MCP' },
    { id: 'actions', label: 'Actions' },
    { id: 'benchmarks', label: 'Benchmarks' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (Single text element) */}
        <div className="flex items-center shrink-0">
          <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent select-none">
            AI Edge Gallery
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === item.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Model Selector Chip */}
          <button
            onClick={onOpenModelPicker}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors shadow-sm max-w-[180px] sm:max-w-[220px]"
            title="Switch Active On-Device Model"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{selectedModel.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition-colors"
            title="Settings & API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center gap-1 px-3 py-2 border-t border-slate-900 overflow-x-auto bg-slate-950/95">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
              currentTab === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
