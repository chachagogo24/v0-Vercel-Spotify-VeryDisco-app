"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { ControlGroup } from "@/components/ui/control-group";
import { SpotifyEmbed } from "@/components/ui/spotify-embed";
import { InteractiveCursorRing } from "@/components/ui/interactive-cursor-ring";

// Dynamic import for the 3D scene to avoid SSR issues
const Scene = dynamic(
  () => import("@/components/pyramid/scene").then((mod) => mod.Scene),
  { ssr: false }
);

function LoadingFallback({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${
        isDarkMode ? "bg-black" : "bg-neutral-100"
      }`}
    >
      <div
        className={`w-16 h-16 border-2 rounded-full animate-spin ${
          isDarkMode ? "border-white/20 border-t-white/80" : "border-black/10 border-t-black/60"
        }`}
      />
    </div>
  );
}

export default function PyramidViewer() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Handle system theme preference
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Track cursor position
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  const handlePointerDown = useCallback(() => {
    setCursorActive(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setCursorActive(false);
  }, []);

  // Global pointer up handler
  useEffect(() => {
    const handleGlobalUp = () => setCursorActive(false);
    window.addEventListener("pointerup", handleGlobalUp);
    window.addEventListener("pointercancel", handleGlobalUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalUp);
      window.removeEventListener("pointercancel", handleGlobalUp);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const toggleSpotify = useCallback(() => {
    setSpotifyOpen((prev) => !prev);
  }, []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-black">
        <LoadingFallback isDarkMode={true} />
      </div>
    );
  }

  return (
    <div
      className={`w-screen h-screen overflow-hidden relative ${
        isDarkMode ? "bg-black" : "bg-neutral-100"
      }`}
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<LoadingFallback isDarkMode={isDarkMode} />}>
          <Scene
            isDarkMode={isDarkMode}
            spotifyOpen={spotifyOpen}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          />
        </Suspense>
      </div>

      {/* Controls */}
      <ControlGroup
        isDarkMode={isDarkMode}
        spotifyOpen={spotifyOpen}
        onThemeToggle={toggleTheme}
        onSpotifyToggle={toggleSpotify}
      />

      {/* Spotify Embed */}
      <SpotifyEmbed isVisible={spotifyOpen} isDarkMode={isDarkMode} />

      {/* Interactive Cursor Ring */}
      <InteractiveCursorRing isActive={cursorActive} position={cursorPosition} />
    </div>
  );
}
