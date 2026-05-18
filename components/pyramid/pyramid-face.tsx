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

// Sutherland-Hodgman: is point c on the left (inside) of edge a→b?
function isLeft(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2): boolean {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) >= 0;
}

// Intersection of infinite line a→b with segment c→d
function computeIntersection(
  a: THREE.Vector2,
  b: THREE.Vector2,
  c: THREE.Vector2,
  d: THREE.Vector2
): THREE.Vector2 | null {
  const denom = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / denom;
  return new THREE.Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
}

// Clip subject polygon against a CCW convex clip polygon
function clipConvexPolygon(
  subject: THREE.Vector2[],
  clip: THREE.Vector2[]
): THREE.Vector2[] {
  if (subject.length < 3 || clip.length < 3) return [];
  let output = [...subject];
  for (let i = 0; i < clip.length; i++) {
    if (output.length === 0) return [];
    const edgeA = clip[i];
    const edgeB = clip[(i + 1) % clip.length];
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j++) {
      const cur = input[j];
      const nxt = input[(j + 1) % input.length];
      const curIn = isLeft(edgeA, edgeB, cur);
      const nxtIn = isLeft(edgeA, edgeB, nxt);
      if (curIn) {
        output.push(cur);
        if (!nxtIn) {
          const pt = computeIntersection(edgeA, edgeB, cur, nxt);
          if (pt) output.push(pt);
        }
      } else if (nxtIn) {
        const pt = computeIntersection(edgeA, edgeB, cur, nxt);
        if (pt) output.push(pt);
      }
    }
  }
  return output;
}

function getPolygonArea(pts: THREE.Vector2[]): number {
  if (pts.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

// Ensure CCW winding (required by Sutherland-Hodgman)
function ensureCCW(polygon: THREE.Vector2[]): THREE.Vector2[] {
  if (polygon.length < 3) return polygon;
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    sum += (polygon[j].x - polygon[i].x) * (polygon[j].y + polygon[i].y);
  }
  return sum > 0 ? [...polygon].reverse() : polygon;
}

export function PyramidFace({ vertices, tileSize, isDarkMode }: PyramidFaceProps) {
  const tiles = useMemo(() => {
    const [v0, v1, v2] = vertices;
    const tileDataArray: TileData[] = [];

    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

    // ── World-aligned tile axes ──────────────────────────────────────────────
    // u = world X projected onto the face plane → tiles have horizontal edges
    const worldX = new THREE.Vector3(1, 0, 0);
    const u = worldX.clone().sub(normal.clone().multiplyScalar(worldX.dot(normal)));
    if (u.lengthSq() < 1e-8) {
      // Face is nearly parallel to world X (e.g. bottom face) – fallback to world Z
      u.set(0, 0, 1).sub(normal.clone().multiplyScalar(normal.z));
    }
    u.normalize();

    // v = cross(normal, u) → points "up" along world Y on the face
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();

    // Build rotation so the mesh's local X=u, Y=v, Z=normal
    const rotMatrix = new THREE.Matrix4().makeBasis(u, v, normal);
    const euler = new THREE.Euler().setFromRotationMatrix(rotMatrix);
    const rotation: [number, number, number] = [euler.x, euler.y, euler.z];

    // Project triangle vertices into the face's local 2D system
    const project2D = (pt: THREE.Vector3) =>
      new THREE.Vector2(pt.clone().sub(v0).dot(u), pt.clone().sub(v0).dot(v));

    const p0 = project2D(v0);
    const p1 = project2D(v1);
    const p2 = project2D(v2);

    // CCW triangle for clipping
    const triangle2D = ensureCCW([p0, p1, p2]);

    const minX = Math.min(p0.x, p1.x, p2.x);
    const maxX = Math.max(p0.x, p1.x, p2.x);
    const minY = Math.min(p0.y, p1.y, p2.y);
    const maxY = Math.max(p0.y, p1.y, p2.y);

    const gap = tileSize * 0.065;
    const halfGap = gap / 2;

    // Snap grid origin to tile-size multiples so tiles align across faces
    const startX = Math.floor(minX / tileSize) * tileSize;
    const startY = Math.floor(minY / tileSize) * tileSize;

    for (let gx = startX; gx < maxX; gx += tileSize) {
      for (let gy = startY; gy < maxY; gy += tileSize) {
        // Square tile with gap inset (CCW)
        const square = ensureCCW([
          new THREE.Vector2(gx + halfGap,            gy + halfGap),
          new THREE.Vector2(gx + tileSize - halfGap, gy + halfGap),
          new THREE.Vector2(gx + tileSize - halfGap, gy + tileSize - halfGap),
          new THREE.Vector2(gx + halfGap,            gy + tileSize - halfGap),
        ]);

        const clipped = clipConvexPolygon(square, triangle2D);
        if (!clipped || clipped.length < 3) continue;

        const area = getPolygonArea(clipped);
        if (area < tileSize * tileSize * 0.03) continue;

        // Centroid
        let cx = 0, cy = 0;
        for (const pt of clipped) { cx += pt.x; cy += pt.y; }
        cx /= clipped.length;
        cy /= clipped.length;

        // 3D centroid position on face (offset slightly along normal)
        const pos3D = v0.clone()
          .add(u.clone().multiplyScalar(cx))
          .add(v.clone().multiplyScalar(cy))
          .add(normal.clone().multiplyScalar(0.005));

        // Polygon points in local tile coords (centered at centroid)
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
