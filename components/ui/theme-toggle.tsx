"use client";

import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative w-10 h-10 rounded-lg flex items-center justify-center
        transition-all duration-300 ease-out
        ${isDarkMode 
          ? "bg-white/10 hover:bg-white/20 border border-white/20" 
          : "bg-black/5 hover:bg-black/10 border border-black/10"
        }
        backdrop-blur-md
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        active:scale-95
      `}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-white/80" />
      ) : (
        <Moon className="w-5 h-5 text-black/70" />
      )}
    </button>
  );
}
