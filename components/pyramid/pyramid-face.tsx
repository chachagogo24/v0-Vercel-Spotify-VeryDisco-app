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

// Check if a point is inside a triangle using barycentric coordinates
function isPointInTriangle(
  p: THREE.Vector2,
  t0: THREE.Vector2,
  t1: THREE.Vector2,
  t2: THREE.Vector2
): boolean {
  const dX = p.x - t2.x;
  const dY = p.y - t2.y;
  const dX21 = t2.x - t1.x;
  const dY12 = t1.y - t2.y;
  const D = dY12 * (t0.x - t2.x) + dX21 * (t0.y - t2.y);
  const s = dY12 * dX + dX21 * dY;
  const t = (t2.y - t0.y) * dX + (t0.x - t2.x) * dY;
  if (D < 0) return s <= 0 && t <= 0 && s + t >= D;
  return s >= 0 && t >= 0 && s + t <= D;
}

// Line segment intersection
function lineIntersection(
  p1: THREE.Vector2,
  p2: THREE.Vector2,
  p3: THREE.Vector2,
  p4: THREE.Vector2
): THREE.Vector2 | null {
  const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return new THREE.Vector2(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
  }
  return null;
}

// Clip a convex polygon against another convex polygon using Sutherland-Hodgman
function clipConvexPolygon(
  subject: THREE.Vector2[],
  clip: THREE.Vector2[]
): THREE.Vector2[] {
  if (subject.length < 3 || clip.length < 3) return [];

  let output = [...subject];

  for (let i = 0; i < clip.length; i++) {
    if (output.length === 0) return [];

    const edgeStart = clip[i];
    const edgeEnd = clip[(i + 1) % clip.length];
    const input = output;
    output = [];

    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const next = input[(j + 1) % input.length];

      const currentInside = isLeft(edgeStart, edgeEnd, current);
      const nextInside = isLeft(edgeStart, edgeEnd, next);

      if (currentInside) {
        output.push(current);
        if (!nextInside) {
          const inter = computeIntersection(edgeStart, edgeEnd, current, next);
          if (inter) output.push(inter);
        }
      } else if (nextInside) {
        const inter = computeIntersection(edgeStart, edgeEnd, current, next);
        if (inter) output.push(inter);
      }
    }
  }

  return output;
}

function isLeft(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2): boolean {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) >= 0;
}

function computeIntersection(
  a: THREE.Vector2,
  b: THREE.Vector2,
  c: THREE.Vector2,
  d: THREE.Vector2
): THREE.Vector2 | null {
  const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
  const x3 = c.x, y3 = c.y, x4 = d.x, y4 = d.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  return new THREE.Vector2(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}

function getPolygonArea(points: THREE.Vector2[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

// Ensure polygon is counter-clockwise
function ensureCCW(polygon: THREE.Vector2[]): THREE.Vector2[] {
  if (polygon.length < 3) return polygon;
  
  let sum = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    sum += (polygon[j].x - polygon[i].x) * (polygon[j].y + polygon[i].y);
  }
  
  if (sum > 0) {
    return [...polygon].reverse();
  }
  return polygon;
}

export function PyramidFace({ vertices, tileSize, isDarkMode }: PyramidFaceProps) {
  const tiles = useMemo(() => {
    const [v0, v1, v2] = vertices;
    const tileDataArray: TileData[] = [];

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
    const project2D = (point: THREE.Vector3) =>
      new THREE.Vector2(
        point.clone().sub(v0).dot(u),
        point.clone().sub(v0).dot(v)
      );

    const p0 = project2D(v0);
    const p1 = project2D(v1);
    const p2 = project2D(v2);

    // Triangle in 2D for clipping (ensure counter-clockwise)
    const triangle2D = ensureCCW([p0, p1, p2]);

    // Find bounding box in 2D
    const minX = Math.min(p0.x, p1.x, p2.x);
    const maxX = Math.max(p0.x, p1.x, p2.x);
    const minY = Math.min(p0.y, p1.y, p2.y);
    const maxY = Math.max(p0.y, p1.y, p2.y);

    // Gap between tiles
    const gap = tileSize * 0.06;
    const halfGap = gap / 2;

    // Fill with tiles using a proper grid aligned to local coordinates
    for (let gx = minX; gx < maxX; gx += tileSize) {
      for (let gy = minY; gy < maxY; gy += tileSize) {
        // Create square tile polygon in local 2D coordinates (CCW order)
        const square = ensureCCW([
          new THREE.Vector2(gx + halfGap, gy + halfGap),
          new THREE.Vector2(gx + tileSize - halfGap, gy + halfGap),
          new THREE.Vector2(gx + tileSize - halfGap, gy + tileSize - halfGap),
          new THREE.Vector2(gx + halfGap, gy + tileSize - halfGap),
        ]);

        // Clip the square to the triangle boundary
        const clippedPoints = clipConvexPolygon(square, triangle2D);

        // Skip if no intersection or too small
        if (!clippedPoints || clippedPoints.length < 3) continue;

        const area = getPolygonArea(clippedPoints);
        const minArea = tileSize * tileSize * 0.03;
        if (area < minArea) continue;

        // Calculate centroid for positioning
        let centroidX = 0;
        let centroidY = 0;
        for (const pt of clippedPoints) {
          centroidX += pt.x;
          centroidY += pt.y;
        }
        centroidX /= clippedPoints.length;
        centroidY /= clippedPoints.length;

        // Convert centroid to 3D position
        const pos3D = v0
          .clone()
          .add(u.clone().multiplyScalar(centroidX))
          .add(v.clone().multiplyScalar(centroidY))
          .add(normal.clone().multiplyScalar(0.005));

        // Convert clipped polygon points to local tile coordinates (centered on centroid)
        const localPoints = clippedPoints.map(
          (pt) => new THREE.Vector2(pt.x - centroidX, pt.y - centroidY)
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
