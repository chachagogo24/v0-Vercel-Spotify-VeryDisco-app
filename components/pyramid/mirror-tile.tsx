"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MirrorTileProps {
  position: [number, number, number];
  rotation: [number, number, number];
  points: THREE.Vector2[];
  isDarkMode: boolean;
  baseColor?: THREE.Color;
}

export function MirrorTile({
  position,
  rotation,
  points,
  isDarkMode,
  baseColor,
}: MirrorTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { color, metalness, roughness } = useMemo(() => {
    const variance = Math.random();

    if (isDarkMode) {
      // Silver/white tones for dark mode
      const lightness = 0.7 + variance * 0.3;
      const grayVariance = Math.random() * 0.15;
      return {
        color: baseColor || new THREE.Color().setHSL(0, 0, lightness - grayVariance),
        metalness: 0.9 + Math.random() * 0.1,
        roughness: 0.15 + Math.random() * 0.2,
      };
    } else {
      // Black/dark gray tones for light mode
      const darkness = 0.05 + variance * 0.2;
      return {
        color: baseColor || new THREE.Color().setHSL(0, 0, darkness),
        metalness: 0.85 + Math.random() * 0.15,
        roughness: 0.2 + Math.random() * 0.15,
      };
    }
  }, [isDarkMode, baseColor]);

  const geometry = useMemo(() => {
    if (points.length < 3) return null;

    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.008,
      bevelEnabled: false,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [points]);

  const timeOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const shimmer = Math.sin(state.clock.elapsedTime * 0.5 + timeOffset) * 0.05;
      material.roughness = roughness + shimmer;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        envMapIntensity={isDarkMode ? 1.5 : 1}
      />
    </mesh>
  );
}
