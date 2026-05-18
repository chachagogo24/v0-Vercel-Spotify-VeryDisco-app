"use client";

interface SpotifyEmbedProps {
  isVisible: boolean;
  isDarkMode: boolean;
}

export function SpotifyEmbed({ isVisible, isDarkMode }: SpotifyEmbedProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-6 z-30
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <div
        className={`
          rounded-xl overflow-hidden
          ${isDarkMode 
            ? "shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10" 
            : "shadow-[0_8px_32px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
          }
        `}
      >
        <iframe
          src="https://open.spotify.com/embed/album/2noRn2Aes5aoNVsU6iWThc?utm_source=generator&theme=0"
          width="320"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="block"
          title="Spotify: Daft Punk - Discovery"
        />
      </div>
    </div>
  );
}
