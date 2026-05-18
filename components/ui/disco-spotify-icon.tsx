"use client";

interface DiscoSpotifyIconProps {
  className?: string;
  active?: boolean;
  isDarkMode: boolean;
}

export function DiscoSpotifyIcon({ className = "", active = false, isDarkMode }: DiscoSpotifyIconProps) {
  // Create a tiled/mosaic effect for the Spotify logo shape
  const tileSize = 2;
  const tiles: { x: number; y: number; opacity: number }[] = [];

  // Simplified Spotify logo shape approximation using a grid
  // We'll create tiles that form the characteristic three curved lines
  const spotifyShape = [
    // Outer arc
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1],
    [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  ];

  spotifyShape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) {
        tiles.push({
          x: x * tileSize,
          y: y * tileSize,
          opacity: 0.5 + Math.random() * 0.5,
        });
      }
    });
  });

  const width = 15 * tileSize;
  const height = 18 * tileSize;

  const baseColor = isDarkMode 
    ? (active ? "#e0e0e0" : "#808080")
    : (active ? "#404040" : "#a0a0a0");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="tileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDarkMode ? "#ffffff" : "#303030"} />
          <stop offset="50%" stopColor={baseColor} />
          <stop offset="100%" stopColor={isDarkMode ? "#c0c0c0" : "#505050"} />
        </linearGradient>
      </defs>
      {tiles.map((tile, index) => (
        <rect
          key={index}
          x={tile.x + 0.2}
          y={tile.y + 0.2}
          width={tileSize - 0.4}
          height={tileSize - 0.4}
          fill="url(#tileGradient)"
          opacity={tile.opacity}
          rx={0.1}
        />
      ))}
    </svg>
  );
}
