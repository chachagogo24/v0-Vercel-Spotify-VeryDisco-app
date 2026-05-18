"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MirrorTile } from "./mirror-tile";

interface PyramidFaceProps {
  vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  tileSize: number;
  isDarkMode: boolean;
}

export function PyramidFace({ vertices, tileSize, isDarkMode }: PyramidFaceProps) {
  const tiles = useMemo(() => {
    const [v0, v1, v2] = vertices;
    const tilePositions: {
      position: [number, number, number];
      rotation: [number, number, number];
    }[] = [];

    // Calculate face normal
    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

    // Calculate rotation to align tile with face
    const up = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    const rotation: [number, number, number] = [euler.x, euler.y, euler.z];

    // Create a local 2D coordinate system on the face
    const u = edge1.clone().normalize();
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();

    // Project vertices to 2D
    const project2D = (point: THREE.Vector3) => ({
      x: point.clone().sub(v0).dot(u),
      y: point.clone().sub(v0).dot(v),
    });

    const p0 = project2D(v0);
    const p1 = project2D(v1);
    const p2 = project2D(v2);

    // Find bounding box in 2D
    const minX = Math.min(p0.x, p1.x, p2.x);
    const maxX = Math.max(p0.x, p1.x, p2.x);
    const minY = Math.min(p0.y, p1.y, p2.y);
    const maxY = Math.max(p0.y, p1.y, p2.y);

    // Helper to check if point is inside triangle
    const sign = (px: number, py: number, ax: number, ay: number, bx: number, by: number) =>
      (px - bx) * (ay - by) - (ax - bx) * (py - by);

    const isInsideTriangle = (px: number, py: number) => {
      const d1 = sign(px, py, p0.x, p0.y, p1.x, p1.y);
      const d2 = sign(px, py, p1.x, p1.y, p2.x, p2.y);
      const d3 = sign(px, py, p2.x, p2.y, p0.x, p0.y);

      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

      return !(hasNeg && hasPos);
    };

    // Fill with tiles
    const padding = tileSize * 0.3;
    for (let x = minX + padding; x < maxX - padding; x += tileSize) {
      for (let y = minY + padding; y < maxY - padding; y += tileSize) {
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        if (isInsideTriangle(centerX, centerY)) {
          // Convert back to 3D
          const pos3D = v0
            .clone()
            .add(u.clone().multiplyScalar(centerX))
            .add(v.clone().multiplyScalar(centerY))
            .add(normal.clone().multiplyScalar(0.02)); // Slight offset from face

          tilePositions.push({
            position: [pos3D.x, pos3D.y, pos3D.z],
            rotation,
          });
        }
      }
    }

    return tilePositions;
  }, [vertices, tileSize]);

  return (
    <group>
      {tiles.map((tile, index) => (
        <MirrorTile
          key={index}
          position={tile.position}
          rotation={tile.rotation}
          size={tileSize}
          isDarkMode={isDarkMode}
        />
      ))}
    </group>
  );
}
