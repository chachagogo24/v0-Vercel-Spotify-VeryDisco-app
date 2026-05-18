"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface StarburstEffectProps {
  isDarkMode: boolean;
}

export function StarburstEffect({ isDarkMode }: StarburstEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
      // Position starburst at the specular highlight point
      const time = state.clock.elapsedTime;
      const x = Math.sin(time * 0.15) * 0.3;
      const y = 1.2 + Math.sin(time * 0.2) * 0.1;
      const z = Math.cos(time * 0.15) * 0.3 + 0.5;

      groupRef.current.position.set(x, y, z);
      groupRef.current.lookAt(camera.position);

      // Pulse the intensity
      const pulse = 0.8 + Math.sin(time * 2) * 0.2;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  if (!isDarkMode) return null;

  const rayCount = 8;
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = (i / rayCount) * Math.PI * 2;
    return { angle, length: 0.3 + Math.random() * 0.2 };
  });

  return (
    <group ref={groupRef}>
      {/* Central glow */}
      <mesh>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Light rays */}
      {rays.map((ray, index) => (
        <mesh key={index} rotation={[0, 0, ray.angle]}>
          <planeGeometry args={[0.01, ray.length]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
