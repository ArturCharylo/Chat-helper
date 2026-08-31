import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, X, Move } from 'lucide-react';

const appWindow = getCurrentWindow();

export const Header: React.FC = () => {
  return (
    <header
      onMouseDown={() => appWindow.startDragging()}
      className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 rounded-t-xl select-none cursor-default"
    >
      <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium pointer-events-none">
        <Move size={14}/>
        <span>AI Invisible Overlay</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => appWindow.minimize()}
          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <Minus size={14}/>
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => appWindow.close()}
          className="p-1 rounded hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <X size={14}/>
        </button>
      </div>
    </header>
  );
};
