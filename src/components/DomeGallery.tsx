"use client";

import { useEffect, useRef, useState } from "react";
import { useDrag } from "@use-gesture/react";

interface DomeGalleryProps {
  images: (string | { src: string; alt?: string })[];
  overlayBlurColor?: string;
  fov?: number;
  scrollSpeed?: number;
}

function getImageSrc(img: string | { src: string; alt?: string }): string {
  return typeof img === "string" ? img : img.src;
}
function getImageAlt(img: string | { src: string; alt?: string }): string {
  return typeof img === "string" ? "" : (img.alt ?? "");
}

type Point = { x: number; y: number; z: number };

function buildSphere(n: number, radius: number): Point[] {
  const pts: Point[] = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < n; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / n);
    const phi   = (2 * Math.PI * i) / golden;
    pts.push({
      x: radius * Math.sin(theta) * Math.cos(phi),
      y: radius * Math.sin(theta) * Math.sin(phi),
      z: radius * Math.cos(theta),
    });
  }
  return pts;
}

function rotateX(pts: Point[], ang: number): Point[] {
  const c = Math.cos(ang), s = Math.sin(ang);
  return pts.map(({ x, y, z }) => ({ x, y: y * c - z * s, z: y * s + z * c }));
}
function rotateY(pts: Point[], ang: number): Point[] {
  const c = Math.cos(ang), s = Math.sin(ang);
  return pts.map(({ x, y, z }) => ({ x: x * c + z * s, y, z: -x * s + z * c }));
}

const RADIUS = 300;
const IMG_W  = 260;
const IMG_H  = 195;

export default function DomeGallery({
  images,
  overlayBlurColor = "#060010",
  fov = 800,
  scrollSpeed = 2,
}: DomeGalleryProps) {
  const velRef  = useRef({ x: 0, y: 0 });
  const rafRef  = useRef<number>(0);
  const [items, setItems] = useState<Point[]>([]);

  // Re-build sphere whenever number of images changes
  useEffect(() => {
    if (images.length === 0) { setItems([]); return; }
    setItems(buildSphere(images.length, RADIUS));
  }, [images.length]);

  // Animation loop
  useEffect(() => {
    function loop() {
      velRef.current.x *= 0.95;
      velRef.current.y *= 0.95;
      const vx = velRef.current.x + 0.0004;
      const vy = velRef.current.y + 0.0008;
      setItems(prev => prev.length ? rotateX(rotateY(prev, vx), vy) : prev);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const bind = useDrag(({ delta: [dx, dy], active }) => {
    if (active) {
      velRef.current.x = (dx / 180) * scrollSpeed;
      velRef.current.y = (dy / 180) * scrollSpeed;
    }
  }, { filterTaps: true });

  const projected = items.map((pt, i) => {
    const scale = fov / (fov - pt.z);
    return { px: pt.x * scale, py: pt.y * scale, scale, i };
  });
  const sorted = [...projected].sort((a, b) => a.scale - b.scale);

  return (
    <div
      className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ height: 620, touchAction: "none" }}
      {...bind()}
    >
      {/* Edge blur overlay */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, ${overlayBlurColor} 100%)` }} />

      {/* Sphere */}
      <div className="absolute inset-0">
        {sorted.map(({ px, py, scale, i }) => {
          if (!images[i]) return null;
          const img     = images[i];
          const src     = getImageSrc(img);
          const alt     = getImageAlt(img);
          const opacity = Math.max(0, Math.min(1, (scale - 0.5) / 1.1));
          return (
            <div
              key={i}
              className="absolute overflow-hidden rounded-lg shadow-lg"
              style={{
                width: IMG_W,
                height: IMG_H,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${px}px), calc(-50% + ${py}px)) scale(${scale * 0.7})`,
                opacity,
                zIndex: Math.round(scale * 100),
                pointerEvents: "none",
              }}
            >
              <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
