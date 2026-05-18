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

  // Define a true triangular pyramid / tetrahedron
  const { faces, tileSize } = useMemo(() => {
    const sideLength = 2 * scale;

    // Regular tetrahedron proportions
    const tetraHeight = Math.sqrt(2 / 3) * sideLength;
    const baseRadius = sideLength / Math.sqrt(3);

    // Apex
    const apex = new THREE.Vector3(0, tetraHeight, 0);

    // Base vertices (equilateral triangle)
    const b1 = new THREE.Vector3(0, 0, baseRadius);
    const b2 = new THREE.Vector3(-sideLength / 2, 0, -baseRadius / 2);
    const b3 = new THREE.Vector3(sideLength / 2, 0, -baseRadius / 2);

    // Three triangular side faces
    const sideFaces: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
      [apex, b1, b2],
      [apex, b2, b3],
      [apex, b3, b1],
    ];

    // Triangular base face
    const baseFace: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
      [b1, b3, b2],
    ];

    return {
      faces: [...sideFaces, ...baseFace],
      tileSize: 0.08 * scale,
    };
  }, [scale]);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow continuous rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;

      // Subtle tilt animation
      groupRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.05 + 0.1;
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