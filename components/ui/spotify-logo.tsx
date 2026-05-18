"use client";

interface SpotifyLogoProps {
  className?: string;
  active?: boolean;
}

export function SpotifyLogo({ className = "" }: SpotifyLogoProps) {
  return (
    <img
      src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png"
      alt="Spotify"
      className={className}
      style={{
        width: "80%",
        height: "80%",
        objectFit: "contain",
        display: "block",
        margin: "auto",
      }}
    />
  );
}