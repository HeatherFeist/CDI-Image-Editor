import React from 'react';
import { AppMode } from '../types';
import { APP_MODES } from '../constants';
import { Home, ShoppingBag, Wand2, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home size={20} />;
      case 'ShoppingBag': return <ShoppingBag size={20} />;
      case 'Wand': return <Wand2 size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800 flex items-center gap-2">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Sparkles className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Visionary
        </h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {APP_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentMode === mode.id
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {getIcon(mode.icon)}
            <div className="text-left">
              <div className="font-medium">{mode.label}</div>
            </div>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500">
          Powered by <span className="text-indigo-400 font-semibold">Gemini 2.5 Flash Image</span>
        </div>
      </div>
    </aside>
  );
};
