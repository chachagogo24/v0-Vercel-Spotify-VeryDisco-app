"use client";

import { useEffect, useState } from "react";

interface InteractiveCursorRingProps {
  isActive: boolean;
  position: { x: number; y: number };
}

export function InteractiveCursorRing({ isActive, position }: InteractiveCursorRingProps) {
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      setScale(1);
    } else {
      setScale(0.8);
      const timer = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!visible && !isActive) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className={`
          w-10 h-10 rounded-full
          border-2 border-blue-400
          transition-all duration-150 ease-out
          ${isActive ? "opacity-80" : "opacity-0"}
        `}
        style={{
          transform: `scale(${scale})`,
          boxShadow: isActive ? "0 0 12px rgba(96, 165, 250, 0.4)" : "none",
        }}
      />
    </div>
  );
}
