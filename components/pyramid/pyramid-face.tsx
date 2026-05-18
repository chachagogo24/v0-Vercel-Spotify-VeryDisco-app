"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { MirrorTile } from "./mirror-tile";

interface PyramidFaceProps {
  vertices: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
  tileSize: number;
  isDarkMode: boolean;
}

type TileData = {
  position: [number, number, number];
  rotation: [number, number, number];
  points: THREE.Vector2[];
};

export function PyramidFace({ vertices, tileSize, isDarkMode }: PyramidFaceProps) {
  const tiles = useMemo(() => {
    const [v0, v1, v2] = vertices;
    const tileDataArray: TileData[] = [];

    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

    // World-aligned tile axes
    const worldX = new THREE.Vector3(1, 0, 0);
    const u = worldX.clone().sub(normal.clone().multiplyScalar(worldX.dot(normal)));
    if (u.lengthSq() < 1e-8) {
      u.set(0, 0, 1).sub(normal.clone().multiplyScalar(normal.z));
    }
    u.normalize();

    const v = new THREE.Vector3().crossVectors(normal, u).normalize();

    // Build rotation matrix
    const rotMatrix = new THREE.Matrix4().makeBasis(u, v, normal);
    const euler = new THREE.Euler().setFromRotationMatrix(rotMatrix);
    const rotation: [number, number, number] = [euler.x, euler.y, euler.z];

    // Project triangle vertices into 2D
    const project2D = (pt: THREE.Vector3) =>
      new THREE.Vector2(pt.clone().sub(v0).dot(u), pt.clone().sub(v0).dot(v));

    const p0 = project2D(v0);
    const p1 = project2D(v1);
    const p2 = project2D(v2);

    const minX = Math.min(p0.x, p1.x, p2.x);
    const maxX = Math.max(p0.x, p1.x, p2.x);
    const minY = Math.min(p0.y, p1.y, p2.y);
    const maxY = Math.max(p0.y, p1.y, p2.y);

    const gap = tileSize * 0.065;
    const halfGap = gap / 2;

    // Start grid at tile-size multiples
    const startX = Math.floor(minX / tileSize) * tileSize;
    const startY = Math.floor(minY / tileSize) * tileSize;

    // Helper: check if point is inside triangle
    const pointInTriangle = (pt: THREE.Vector2, a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2): boolean => {
      const sign = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) => {
        return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
      };

      const d1 = sign(pt.x, pt.y, a.x, a.y, b.x, b.y);
      const d2 = sign(pt.x, pt.y, b.x, b.y, c.x, c.y);
      const d3 = sign(pt.x, pt.y, c.x, c.y, a.x, a.y);

      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

      return !(hasNeg && hasPos);
    };

    // Helper: clip square tile to triangle by keeping in-triangle corners
    const clipSquareToTriangle = (square: THREE.Vector2[]): THREE.Vector2[] => {
      if (square.length !== 4) return [];

      const inside = square.filter(pt => pointInTriangle(pt, p0, p1, p2));
      if (inside.length === 0) return [];
      if (inside.length === 4) return [...square];

      // For simplicity, just use the inside points + edge intersections
      // This is a simplified clip that works for most cases
      const result = [...inside];
      
      // If some corners are in, may need edge clipping, but for MVP just use corners
      return result;
    };

    for (let gx = startX; gx < maxX; gx += tileSize) {
      for (let gy = startY; gy < maxY; gy += tileSize) {
        const square = [
          new THREE.Vector2(gx + halfGap, gy + halfGap),
          new THREE.Vector2(gx + tileSize - halfGap, gy + halfGap),
          new THREE.Vector2(gx + tileSize - halfGap, gy + tileSize - halfGap),
          new THREE.Vector2(gx + halfGap, gy + tileSize - halfGap),
        ];

        const clipped = clipSquareToTriangle(square);
        if (!clipped || clipped.length < 3) continue;

        // Centroid
        let cx = 0, cy = 0;
        for (const pt of clipped) { cx += pt.x; cy += pt.y; }
        cx /= clipped.length;
        cy /= clipped.length;

        // 3D position
        const pos3D = v0.clone()
          .add(u.clone().multiplyScalar(cx))
          .add(v.clone().multiplyScalar(cy))
          .add(normal.clone().multiplyScalar(0.005));

        // Polygon points relative to centroid
        const localPoints = clipped.map(
          (pt) => new THREE.Vector2(pt.x - cx, pt.y - cy)
        );

        tileDataArray.push({
          position: [pos3D.x, pos3D.y, pos3D.z],
          rotation,
          points: localPoints,
        });
      }
    }

    return tileDataArray;
  }, [vertices, tileSize]);

  return (
    <group>
      {tiles.map((tile, index) => (
        <MirrorTile
          key={index}
          position={tile.position}
          rotation={tile.rotation}
          points={tile.points}
          isDarkMode={isDarkMode}
        />
      ))}
    </group>
  );
}
