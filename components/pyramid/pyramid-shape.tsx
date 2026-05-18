"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PyramidFace } from "./pyramid-face";

interface PyramidShapeProps {
  isDarkMode: boolean;
  scale?: number;
}

export function PyramidShape({ isDarkMode, scale = 1 }: PyramidShapeProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Define pyramid vertices (square base pyramid with equilateral triangle faces)
  const { faces, tileSize } = useMemo(() => {
    const baseSize = 2 * scale;
    const half = baseSize / 2;
    // For equilateral triangle faces: height = baseSize / √2
    const height = baseSize / Math.sqrt(2);

    // Apex at top
    const apex = new THREE.Vector3(0, height, 0);

    // Base vertices (square)
    const b1 = new THREE.Vector3(-half, 0, -half);
    const b2 = new THREE.Vector3(half, 0, -half);
    const b3 = new THREE.Vector3(half, 0, half);
    const b4 = new THREE.Vector3(-half, 0, half);

    // Four triangular faces
    const pyramidFaces: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
      [apex, b1, b2], // Front
      [apex, b2, b3], // Right
      [apex, b3, b4], // Back
      [apex, b4, b1], // Left
    ];

    // Base face (two triangles to form square)
    const baseFaces: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
      [b1, b3, b2],
      [b1, b4, b3],
    ];

    return {
      faces: [...pyramidFaces, ...baseFaces],
      tileSize: 0.08 * scale,
    };
  }, [scale]);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow continuous rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      // Subtle tilt animation
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05 + 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {faces.map((faceVertices, index) => (
        <PyramidFace
          key={index}
          vertices={faceVertices}
          tileSize={tileSize}
          isDarkMode={isDarkMode}
        />
      ))}
    </group>
  );
}
