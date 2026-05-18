"use client";

import { DiscoSpotifyIcon } from "./disco-spotify-icon";

interface SpotifyToggleProps {
  isActive: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

export function SpotifyToggle({ isActive, onToggle, isDarkMode }: SpotifyToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isActive ? "Hide Spotify player" : "Show Spotify player"}
      aria-pressed={isActive}
      className={`
        relative w-10 h-10 rounded-lg flex items-center justify-center p-2
        transition-all duration-300 ease-out
        ${isDarkMode 
          ? `bg-white/10 hover:bg-white/20 border ${isActive ? "border-white/40" : "border-white/20"}` 
          : `bg-black/5 hover:bg-black/10 border ${isActive ? "border-black/30" : "border-black/10"}`
        }
        ${isActive ? (isDarkMode ? "shadow-[0_0_12px_rgba(255,255,255,0.2)]" : "shadow-[0_0_12px_rgba(0,0,0,0.1)]") : ""}
        backdrop-blur-md
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        active:scale-95
      `}
    >
      <DiscoSpotifyIcon 
        active={isActive} 
        isDarkMode={isDarkMode}
        className={`w-full h-full transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-60"}`}
      />
    </button>
  );
}
