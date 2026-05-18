"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PyramidShape } from "./pyramid-shape";
import { StarburstEffect } from "./starburst-effect";

interface SceneProps {
  isDarkMode: boolean;
  spotifyOpen: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
}

export function Scene({ isDarkMode, spotifyOpen, onPointerDown, onPointerUp }: SceneProps) {
  const bgColor = isDarkMode ? "#000000" : "#f5f5f5";
  const pyramidScale = spotifyOpen ? 0.85 : 1;

  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ background: bgColor }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={[bgColor]} />

      {/* Ambient light */}
      <ambientLight intensity={isDarkMode ? 0.3 : 0.5} />

      {/* Main directional light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={isDarkMode ? 1.5 : 1}
        color={isDarkMode ? "#ffffff" : "#fafafa"}
      />

      {/* Fill light */}
      <directionalLight
        position={[-3, 2, -3]}
        intensity={isDarkMode ? 0.3 : 0.4}
        color={isDarkMode ? "#aaaaff" : "#ffffff"}
      />

      {/* Rim light for dark mode */}
      {isDarkMode && (
        <pointLight position={[0, 4, -2]} intensity={0.5} color="#ffffff" />
      )}

      {/* Environment for reflections */}
      <Environment preset={isDarkMode ? "night" : "studio"} />

      {/* Main pyramid */}
      <PyramidShape isDarkMode={isDarkMode} scale={pyramidScale} />

      {/* Starburst effect */}
      <StarburstEffect isDarkMode={isDarkMode} />

      {/* Orbit controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        rotateSpeed={0.5}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={isDarkMode ? 0.5 : 0.15}
          luminanceThreshold={isDarkMode ? 0.6 : 0.9}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
