/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive 4D Tesseract Simulation & Vector Picker Canvas
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Vector4D,
  Rotation4D,
  generateTesseractVertices,
  generateTesseractEdges,
  rotateVector4D,
  project4Dto2D,
  classifyEmotionalVector,
  calculateConfusionIndex,
  clampVector4D,
  GOBLIN_ARCHETYPES,
  EmotionalArchetype,
} from '../utils/tesseractMath';
import { playTesseractTumble, playDimensionalWarp } from '../utils/goblinAudio';
import {
  Rotate3d,
  Compass,
  Sparkles,
  Shuffle,
  Sliders,
  Zap,
} from 'lucide-react';

interface TesseractSimulationProps {
  initialVector?: Vector4D;
  onVectorChange: (vector: Vector4D, archetype: EmotionalArchetype, confusionPercent: number) => void;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const TesseractSimulation: React.FC<TesseractSimulationProps> = ({
  initialVector = { x: 0.6, y: 0.8, z: 0.4, w: 0.7 },
  onVectorChange,
  interactive = true,
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 4D Rotation state
  const rotationRef = useRef<Rotation4D>({
    xy: 0.3,
    xz: 0.4,
    xw: 0.2,
    yz: 0.1,
    yw: 0.15,
    zw: 0.05,
  });

  // Current emotional vector coordinates
  const [vector, setVector] = useState<Vector4D>(clampVector4D(initialVector));
  const vectorRef = useRef<Vector4D>(clampVector4D(initialVector));

  // Navigation & interaction tracking for Confusion Index
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [activeRotationPlane, setActiveRotationPlane] = useState<'3D' | 'XW' | 'YW' | 'ZW'>('3D');
  const [distance4D, setDistance4D] = useState<number>(2.5);
  const [showVertexLabels, setShowVertexLabels] = useState<boolean>(true);

  // Interaction telemetry
  const confusionStatsRef = useRef({
    cumulativeTumble: 1.2,
    axisAdjustments: 2,
    startTime: Date.now(),
    lastSoundTime: 0,
  });

  const [confusionInfo, setConfusionInfo] = useState(() =>
    calculateConfusionIndex(1.2, 2, 2000)
  );

  // Mouse drag tracking
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update vector and propagate changes
  const updateVector = useCallback(
    (newVec: Vector4D, isUserAdjustment = true) => {
      const clamped = clampVector4D(newVec);
      setVector(clamped);
      vectorRef.current = clamped;

      if (isUserAdjustment) {
        confusionStatsRef.current.axisAdjustments++;
      }

      const archetype = classifyEmotionalVector(clamped);
      const elapsed = Date.now() - confusionStatsRef.current.startTime;
      const conf = calculateConfusionIndex(
        confusionStatsRef.current.cumulativeTumble,
        confusionStatsRef.current.axisAdjustments,
        elapsed
      );
      setConfusionInfo(conf);
      onVectorChange(clamped, archetype, conf.index);
    },
    [onVectorChange]
  );

  // Handle single axis slider change
  const handleAxisChange = (axis: keyof Vector4D, value: number) => {
    const updated = { ...vectorRef.current, [axis]: value };
    if (axis === 'w') {
      playDimensionalWarp(value);
    }
    updateVector(updated, true);
  };

  // Preset archetype snap
  const handleSnapToArchetype = (arch: EmotionalArchetype) => {
    playDimensionalWarp(arch.vector.w);
    updateVector(arch.vector, true);
  };

  // Randomize vector
  const handleRandomize = () => {
    const rand = () => Number((Math.random() * 2 - 1).toFixed(2));
    const randomVec = { x: rand(), y: rand(), z: rand(), w: rand() };
    playDimensionalWarp(randomVec.w);
    updateVector(randomVec, true);
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const baseVertices = generateTesseractVertices();
    const edges = generateTesseractEdges(baseVertices);

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean((navigator as unknown as { webdriver?: boolean }).webdriver) ||
        /HeadlessChrome/i.test(navigator.userAgent));

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Handle auto rotation
      if (autoRotate) {
        const speed = rotationSpeed * dt * 0.45;
        rotationRef.current.xy += speed * 0.9;
        rotationRef.current.xz += speed * 0.7;
        rotationRef.current.xw += speed * 0.8;
        rotationRef.current.yw += speed * 0.5;
        rotationRef.current.zw += speed * 0.3;

        confusionStatsRef.current.cumulativeTumble += speed * 0.2;
      }

      // Clear with deep cavern bog gradient
      ctx.clearRect(0, 0, width, height);

      // Radial background aura
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width * 0.65
      );
      bgGrad.addColorStop(0, '#10281b');
      bgGrad.addColorStop(0.5, '#0b1912');
      bgGrad.addColorStop(1, '#050a07');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle 4D grid / hyper-plane rings
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.lineWidth = 1;
      for (let r = 50; r <= width * 0.45; r += 60) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Project all 16 vertices of the hypercube
      const rot = rotationRef.current;
      const zoom = Math.min(width, height) * 0.42;

      interface ProjectedVertexInfo {
        v4Rot: Vector4D;
        p2: { x: number; y: number };
        depth: number;
        scale4D: number;
        idx: number;
      }

      const projectedVertices: ProjectedVertexInfo[] = baseVertices.map((v, idx) => {
        const v4Rot = rotateVector4D(v, rot);
        const { point2D, scale4D, depth } = project4Dto2D(
          v4Rot,
          distance4D,
          3.2,
          width,
          height,
          zoom
        );
        return {
          v4Rot,
          p2: point2D,
          depth,
          scale4D,
          idx,
        };
      });

      // Draw 32 Edges with hyper-depth gradient
      ctx.save();
      edges.forEach((edge) => {
        const pA = projectedVertices[edge.from];
        const pB = projectedVertices[edge.to];

        const avgW = (pA.v4Rot.w + pB.v4Rot.w) / 2; // -1 to 1

        let strokeColor = 'rgba(52, 211, 153, 0.4)';
        let lineWidth = 1.6;

        if (avgW > 0.3) {
          // Inner hypercube projection (hyper-shiny gold)
          strokeColor = `rgba(251, 191, 36, ${0.45 + (avgW * 0.4)})`;
          lineWidth = 2.2;
        } else if (avgW < -0.3) {
          // Cavern depth (feral teal / slate)
          strokeColor = `rgba(16, 185, 129, ${0.25 + Math.abs(avgW) * 0.3})`;
          lineWidth = 1.2;
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(pA.p2.x, pA.p2.y);
        ctx.lineTo(pB.p2.x, pB.p2.y);
        ctx.stroke();
      });
      ctx.restore();

      // Project the currently selected emotional vector into the same 4D frame!
      const currentVecRot = rotateVector4D(vectorRef.current, rot);
      const userProj = project4Dto2D(currentVecRot, distance4D, 3.2, width, height, zoom);

      // Draw connection rays from current emotional point to nearest 3 vertices
      const sortedByDist = [...projectedVertices]
        .map((pv) => {
          const dx = pv.v4Rot.x - currentVecRot.x;
          const dy = pv.v4Rot.y - currentVecRot.y;
          const dz = pv.v4Rot.z - currentVecRot.z;
          const dw = pv.v4Rot.w - currentVecRot.w;
          return { pv, dist: dx * dx + dy * dy + dz * dz + dw * dw };
        })
        .sort((a, b) => a.dist - b.dist);

      ctx.save();
      for (let i = 0; i < 3; i++) {
        const target = sortedByDist[i].pv;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.35 - i * 0.08})`;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(userProj.point2D.x, userProj.point2D.y);
        ctx.lineTo(target.p2.x, target.p2.y);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Vertices
      projectedVertices.forEach((pv) => {
        const radius = Math.max(3.5, Math.min(8.5, 5 * pv.scale4D));

        ctx.save();
        ctx.beginPath();
        ctx.arc(pv.p2.x, pv.p2.y, radius, 0, Math.PI * 2);

        if (pv.v4Rot.w > 0.2) {
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#34d399';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 6;
        }
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#050a07';
        ctx.stroke();

        if (showVertexLabels && width > 280) {
          ctx.fillStyle = 'rgba(209, 250, 229, 0.65)';
          ctx.font = '9px var(--font-mono, monospace)';
          ctx.fillText(`V${pv.idx}`, pv.p2.x + radius + 3, pv.p2.y + 3);
        }
        ctx.restore();
      });

      // Draw Selected Emotional Vector Orb with pulsing extradimensional corona
      ctx.save();
      const pulse = Math.sin(time * 0.006) * 3;
      const userRadius = Math.max(7, 10 * userProj.scale4D + pulse);

      const orbGrad = ctx.createRadialGradient(
        userProj.point2D.x,
        userProj.point2D.y,
        2,
        userProj.point2D.x,
        userProj.point2D.y,
        userRadius * 2.5
      );
      orbGrad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
      orbGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
      orbGrad.addColorStop(0.8, 'rgba(52, 211, 153, 0.25)');
      orbGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(userProj.point2D.x, userProj.point2D.y, userRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core sphere
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(userProj.point2D.x, userProj.point2D.y, userRadius * 0.55, 0, Math.PI * 2);
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14;
      ctx.fill();

      // Target reticle
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(userProj.point2D.x, userProj.point2D.y, userRadius * 1.3, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      if (isHeadless) {
        animId = window.setTimeout(() => render(performance.now()), 66);
      } else {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (isHeadless) clearTimeout(animId);
      else cancelAnimationFrame(animId);
    };
  }, [autoRotate, rotationSpeed, distance4D, showVertexLabels]);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setAutoRotate(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !interactive) return;

    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.012;
    const tumbleMag = Math.sqrt(dx * dx + dy * dy) * sensitivity;
    confusionStatsRef.current.cumulativeTumble += tumbleMag;

    const isShift = e.shiftKey || activeRotationPlane !== '3D';

    if (!isShift) {
      rotationRef.current.xy += dx * sensitivity;
      rotationRef.current.xz += dy * sensitivity;
    } else {
      if (activeRotationPlane === 'XW') {
        rotationRef.current.xw += dx * sensitivity;
        rotationRef.current.yw += dy * sensitivity;
      } else if (activeRotationPlane === 'YW') {
        rotationRef.current.yw += dy * sensitivity;
        rotationRef.current.zw += dx * sensitivity;
      } else if (activeRotationPlane === 'ZW') {
        rotationRef.current.zw += dx * sensitivity;
        rotationRef.current.xw += dy * sensitivity;
      } else {
        rotationRef.current.xw += dx * sensitivity * 0.8;
        rotationRef.current.yw += dy * sensitivity * 0.8;
      }
    }

    const now = Date.now();
    if (now - confusionStatsRef.current.lastSoundTime > 180) {
      playTesseractTumble(1.0 + rotationRef.current.xw * 0.5);
      confusionStatsRef.current.lastSoundTime = now;
    }

    const elapsed = now - confusionStatsRef.current.startTime;
    const conf = calculateConfusionIndex(
      confusionStatsRef.current.cumulativeTumble,
      confusionStatsRef.current.axisAdjustments,
      elapsed
    );
    setConfusionInfo(conf);
    onVectorChange(vectorRef.current, classifyEmotionalVector(vectorRef.current), conf.index);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * 0.002;
    setDistance4D((prev) => Math.max(1.8, Math.min(4.5, prev + delta)));
  };

  const currentArchetype = classifyEmotionalVector(vector);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 select-none ${className}`}>
      {/* LEFT COLUMN: 4D Canvas Container with HUD Overlays */}
      <div className="lg:col-span-7 flex flex-col space-y-3">
        <div className="relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden border border-[#1e3d2c] bg-[#070d0a] shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={480}
            height={480}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            title="Drag to rotate in 4-space! Hold Shift or select a 4D plane below for non-Euclidean hyper-rotation."
          />

          {/* Top-Left: Active Vector Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-2 bg-[#09140e]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#225039] text-xs">
            <span className="text-base">{currentArchetype.glyph}</span>
            <div className="flex flex-col">
              <span className="font-semibold text-[#facc15] leading-tight text-[11px]">
                {currentArchetype.name}
              </span>
              <span className="text-[9px] text-[#86efac]/80 font-mono">
                [{vector.x.toFixed(2)}, {vector.y.toFixed(2)}, {vector.z.toFixed(2)}, {vector.w.toFixed(2)}]
              </span>
            </div>
          </div>

          {/* Top-Right: Confusion Severity Indicator */}
          <div className="absolute top-2.5 right-2.5 bg-[#09140e]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#225039] text-right">
            <div className="flex items-center gap-1 justify-end">
              <Zap
                className={`w-3 h-3 ${
                  confusionInfo.severity === 'critical'
                    ? 'text-red-400 animate-pulse'
                    : confusionInfo.severity === 'high'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
              <span className="text-[11px] font-bold font-mono text-[#d1fae5]">
                {confusionInfo.index}% Confused
              </span>
            </div>
            <span className="text-[9px] text-[#a7f3d0]/70 font-sans block max-w-[120px] truncate">
              {confusionInfo.label}
            </span>
          </div>

          {/* Bottom Floating Controls: 4D Plane Toggles & Auto-Tumble */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-[#07130c]/90 backdrop-blur-md rounded-xl border border-[#1e3d2c]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2 py-0.5 text-[11px] rounded-lg font-medium transition flex items-center gap-1 ${
                  autoRotate
                    ? 'bg-[#10b981]/25 text-[#34d399] border border-[#10b981]/40'
                    : 'bg-[#14281e] text-[#9ca3af] hover:text-white'
                }`}
                title="Toggle automatic 4D hypercube tumbling"
              >
                <Rotate3d className="w-3 h-3" />
                <span>{autoRotate ? 'Tumbling' : 'Paused'}</span>
              </button>

              <button
                type="button"
                onClick={handleRandomize}
                className="p-1 bg-[#14281e] hover:bg-[#1e3d2c] text-[#a7f3d0] rounded-lg transition"
                title="Scramble to random 4D emotional coordinates"
                aria-label="Randomize 4D Coordinates"
              >
                <Shuffle className="w-3 h-3" />
              </button>
            </div>

            {/* Plane Selector */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="text-neutral-400 hidden sm:inline">Plane:</span>
              {(['3D', 'XW', 'YW', 'ZW'] as const).map((plane) => (
                <button
                  key={plane}
                  type="button"
                  onClick={() => setActiveRotationPlane(plane)}
                  className={`px-1.5 py-0.5 rounded-md font-bold transition ${
                    activeRotationPlane === plane
                      ? 'bg-[#fbbf24] text-neutral-950 shadow-sm'
                      : 'bg-[#14281e] text-[#a7f3d0]/80 hover:text-white hover:bg-[#1e3d2c]'
                  }`}
                  title={`Rotate in ${plane} plane during drag`}
                >
                  {plane}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goblin Commentary */}
        <div className="p-2.5 rounded-xl bg-[#09150e] border border-[#1a3826] flex items-center gap-2.5">
          <span className="text-xl select-none">🧌</span>
          <p className="text-[11px] text-[#a7f3d0]/90 italic leading-snug">
            "{confusionInfo.goblinComment}"
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Axis Sliders & Form Embed */}
      <div className="lg:col-span-5 flex flex-col space-y-3">
        <div className="p-3.5 rounded-2xl bg-[#0c1812] border border-[#1e3d2c] space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1b3527]">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#34d399]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#a7f3d0]">
                4D Coordinate Axes
              </span>
            </div>
            <span className="text-[10px] text-[#f59e0b] font-mono font-medium">
              [-1.00, +1.00]
            </span>
          </div>

          {/* Axis X: Greed vs Spite */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-rose-400 font-medium">Spite</span>
              <span className="font-mono font-bold text-[#d1fae5]">X ({vector.x.toFixed(2)})</span>
              <span className="text-amber-400 font-medium">Greed</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={vector.x}
              onChange={(e) => handleAxisChange('x', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#162e21] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
              aria-label="Axis X: Greed vs Spite"
            />
          </div>

          {/* Axis Y: Bog Euphoria vs Mold Dread */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-purple-400 font-medium">Mold Dread</span>
              <span className="font-mono font-bold text-[#d1fae5]">Y ({vector.y.toFixed(2)})</span>
              <span className="text-emerald-400 font-medium">Bog Bliss</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={vector.y}
              onChange={(e) => handleAxisChange('y', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#162e21] rounded-lg appearance-none cursor-pointer accent-[#10b981]"
              aria-label="Axis Y: Bog Euphoria vs Mold Dread"
            />
          </div>

          {/* Axis Z: Prankster Mischief vs Burrow Recluse */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-blue-400 font-medium">Hermit</span>
              <span className="font-mono font-bold text-[#d1fae5]">Z ({vector.z.toFixed(2)})</span>
              <span className="text-teal-400 font-medium">Mischief</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={vector.z}
              onChange={(e) => handleAxisChange('z', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#162e21] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              aria-label="Axis Z: Mischief vs Recluse"
            />
          </div>

          {/* Axis W: 4th Dimension Shiny Hypnosis vs Feral Hiss */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-orange-400 font-medium">Feral Hiss</span>
              <span className="font-mono font-bold text-[#facc15] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                W ({vector.w.toFixed(2)})
              </span>
              <span className="text-yellow-300 font-medium">Shiny Hypnosis</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={vector.w}
              onChange={(e) => handleAxisChange('w', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#162e21] rounded-lg appearance-none cursor-pointer accent-[#fbbf24]"
              aria-label="Axis W: Extradimensional Shiny Hypnosis vs Feral Hiss"
            />
          </div>
        </div>

        {/* Embedded Children (e.g. Lock-In Form) */}
        {children}
      </div>
    </div>
  );
};
