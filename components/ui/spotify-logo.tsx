"use client";

interface SpotifyLogoProps {
  className?: string;
  active?: boolean;
}

export function SpotifyLogo({ className = "", active = false }: SpotifyLogoProps) {
  return (
    <svg
      viewBox="0 0 168 168"
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Green circle background */}
      <circle cx="84" cy="84" r="84" fill="#1DB954" />
      
      {/* White curved lines */}
      <g fill="none" stroke="white" strokeWidth="8" strokeLinecap="round">
        {/* Top line */}
        <path d="M 52 64 Q 84 48 116 64" />
        
        {/* Middle line */}
        <path d="M 40 84 Q 84 64 128 84" />
        
        {/* Bottom line */}
        <path d="M 52 104 Q 84 120 116 104" />
      </g>
    </svg>
  );
}
