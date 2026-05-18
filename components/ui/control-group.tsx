"use client";

import { ThemeToggle } from "./theme-toggle";
import { SpotifyToggle } from "./spotify-toggle";

interface ControlGroupProps {
  isDarkMode: boolean;
  spotifyOpen: boolean;
  onThemeToggle: () => void;
  onSpotifyToggle: () => void;
}

export function ControlGroup({
  isDarkMode,
  spotifyOpen,
  onThemeToggle,
  onSpotifyToggle,
}: ControlGroupProps) {
  return (
    <div
      className={`
        fixed top-6 right-6 z-40
        flex items-center gap-2
        p-1.5 rounded-xl
        ${isDarkMode 
          ? "bg-white/5 border border-white/10" 
          : "bg-black/5 border border-black/5"
        }
        backdrop-blur-xl
      `}
    >
      <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
      <SpotifyToggle
        isActive={spotifyOpen}
        onToggle={onSpotifyToggle}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
