import React from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Minus, X, Move } from 'lucide-react';

const appWindow = getCurrentWebviewWindow();

export const Header: React.FC = () => {
  return (
    <header
      data-tauri-drag-region
      className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 rounded-t-xl select-none cursor-move"
    >
      <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
        <Move size={14}/>
        <span>AI Invisible Overlay</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => appWindow.minimize()}
          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <Minus size={14}/>
        </button>
        <button
          onClick={() => appWindow.close()}
          className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
        >
          <X size={14}/>
        </button>
      </div>
    </header>
  );
};
