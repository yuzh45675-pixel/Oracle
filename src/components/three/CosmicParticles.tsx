"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useParticleInteraction } from "@/context/ParticleInteractionContext";
import { useTheme } from "@/context/ThemeContext";
import {
  buildFormationTargets,
  pickFormation,
} from "@/lib/particle-formations";
import { shouldIgnoreParticleGesture } from "@/lib/particle-gesture";

function useAdaptiveParticleCount() {
  const [count] = useState(() => {
    if (typeof window === "undefined") return 1800;
    const mobile =
      window.matchMedia("(max-width: 768px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return 500;
    if (mobile) return 1400;
    return 2400;
  });
  return count;
}

function clientToWorld(
  clientX: number,
  clientY: number,
  viewport: { width: number; height: number },
) {
  const x = (clientX / window.innerWidth) * 2 - 1;
  const y = -(clientY / window.innerHeight) * 2 + 1;
  return new THREE.Vector2(x * (viewport.width / 2), y * (viewport.height / 2));
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uFocus;
  uniform float uFocusStrength;
  uniform float uDissolve;
  uniform float uBreath;
  uniform float uBreathMode;
  uniform float uTremble;
  uniform float uFormation;
  uniform float uBurst;
  uniform float uRitualExpand;
  uniform float uAttract;
  uniform float uSizeScale;
  attribute float aSize;
  attribute float aPhase;
  attribute float aBreathGather;
  attribute vec2 aTarget;
  varying float vAlpha;
  varying float vSparkle;

  void main() {
    vec3 pos = position;

    float breathPull = uBreath * uBreath * (3.0 - 2.0 * uBreath);

    if (uBreathMode > 0.5) {
      float spread = 1.0 - breathPull;
      vec3 dir = normalize(position + vec3(0.0001));
      float ballR = 0.44;
      float g = breathPull * aBreathGather;

      float h1 = fract(sin(aPhase * 127.1) * 43758.5453);
      float h2 = fract(sin(aPhase * 269.5) * 43758.5453);
      float h3 = fract(sin(aPhase * 419.2) * 43758.5453);
      vec3 jitterDir = normalize(dir + (vec3(h1, h2, h3) - 0.5) * 0.12);
      float rNorm = 0.42 + 0.58 * pow(h1, 0.333);
      vec3 ballPos = jitterDir * ballR * rNorm;

      vec3 loosePos = position;
      loosePos.xy *= mix(1.04, 1.0, aBreathGather * 0.5);
      loosePos.xy += dir.xy * spread * mix(0.038, 0.018, 1.0 - aBreathGather);
      loosePos.z *= mix(1.03, 1.0, aBreathGather * 0.4);

      pos = mix(loosePos, ballPos, g);

      vec3 floatDrift = vec3(
        sin(uTime * 0.16 + aPhase * 1.8),
        cos(uTime * 0.13 + aPhase * 2.4),
        sin(uTime * 0.11 + aPhase * 1.3)
      ) * (0.06 + (1.0 - aBreathGather) * 0.14);

      pos += floatDrift;

      pos.xy += vec2(
        sin(uTime * 8.5 + aPhase * 2.5),
        cos(uTime * 7.2 + aPhase * 1.8)
      ) * uTremble * 0.045;
    }

    float drift = sin(uTime * 0.2 + aPhase) * (0.032 + uBreath * 0.014);
    pos.y += drift;
    pos.x += cos(uTime * 0.16 + aPhase * 1.3) * 0.022;

    if (uBreathMode < 0.5) {
      vec2 toPointer = uPointer - pos.xy;
      float distP = length(toPointer);
      float attract = smoothstep(0.72, 0.0, distP) * uAttract * (0.85 + uBreath * 0.15);
      pos.xy += normalize(toPointer + 0.0001) * attract;

      vec2 toFocus = uFocus - pos.xy;
      float distF = length(toFocus);
      float focusPull = smoothstep(0.52, 0.0, distF) * uFocusStrength * 0.62;
      pos.xy += normalize(toFocus + 0.0001) * focusPull;
      pos.z -= focusPull * 0.08;
    }

    vec3 formPos = vec3(aTarget, pos.z * 0.35);
    pos = mix(pos, formPos, uFormation * 0.92 * (1.0 - uBreathMode));

    vec2 radial = pos.xy;
    float rLen = length(radial);
    pos.xy += normalize(radial + 0.001) * uRitualExpand * (2.4 + rLen * 0.75);
    pos.z += uRitualExpand * 0.55;

    pos.xy *= 1.0 + uBurst * 0.32 * sin(aPhase * 3.0);
    pos.z += uBurst * 0.14;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float sizeBoost = 1.0 + uFocusStrength * 0.18 + uRitualExpand * 0.65;
    gl_PointSize = aSize * (105.0 / -mvPosition.z) * sizeBoost * (1.0 + uBurst * 0.35) * uSizeScale;
    if (uBreathMode > 0.5) {
      gl_PointSize *= mix(1.0, mix(0.86, 0.92, 1.0 - aBreathGather), breathPull);
    }
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = (0.28 + aSize * 0.42) * uDissolve;
    if (uBreathMode > 0.5) {
      float gatherFade = mix(0.62, 0.5, aBreathGather);
      vAlpha *= mix(0.88, gatherFade, breathPull * aBreathGather + breathPull * (1.0 - aBreathGather) * 0.35);
    } else {
      vAlpha *= 0.88 + uBreath * 0.12;
    }
    vAlpha *= 1.0 + uFocusStrength * 0.35 + uRitualExpand * 0.4;
    vSparkle = 0.5 + 0.5 * sin(uTime * 2.0 + aPhase * 4.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTrail;
  uniform float uHaloScale;
  varying float vAlpha;
  varying float vSparkle;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.28, 0.0, d);
    float halo = smoothstep(0.5, 0.08, d) * (0.4 + uTrail * 0.25) * uHaloScale;
    float alpha = (core * 0.88 + halo) * vAlpha * (0.9 + vSparkle * 0.1);
    vec3 color = mix(uColorA, uColorB, core + vSparkle * 0.08);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface CosmicParticlesProps {
  dissolve?: number;
  intensity?: number;
  breathAmount?: number;
  breathMode?: boolean;
  tremble?: number;
  interactive?: boolean;
}

export function CosmicParticles({
  dissolve = 1,
  intensity = 1,
  breathAmount,
  breathMode = false,
  tremble = 0,
  interactive = true,
}: CosmicParticlesProps) {
  const { theme } = useTheme();
  const count = useAdaptiveParticleCount();
  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches ||
      "ontouchstart" in window ||
      (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
    );
  });
  const meshRef = useRef<THREE.Points>(null);
  const targetPointer = useRef(new THREE.Vector2(0, 0));
  const targetFocus = useRef(new THREE.Vector2(0, 0));
  const focusStrengthRef = useRef(0);
  const ritualExpandRef = useRef(0);
  const formationStrength = useRef(0);
  const burstStrength = useRef(0);
  const longPressTimer = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const { viewport } = useThree();
  const {
    burstStrength: burstSignal,
    formation,
    formationStrength: formationSignal,
    focusAnchor,
    focusStrength,
    ritualExpand,
    ritualActive,
    triggerBurst,
    triggerFormation,
    releaseFormation,
  } = useParticleInteraction();

  const colorA = useMemo(() => new THREE.Color(theme.colors.particleA), [theme]);
  const colorB = useMemo(() => new THREE.Color(theme.colors.particleB), [theme]);

  const { positions, sizes, phases, targets, breathGathers } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const targets = new Float32Array(count * 2);
    const breathGathers = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let radius: number;
      let gather = 1;

      if (breathMode) {
        const isAmbient = Math.random() < 0.4;
        if (isAmbient) {
          gather = 0;
          radius = Math.pow(Math.random(), 0.62) * 3.4;
        } else {
          gather = 0.78 + Math.random() * 0.22;
          radius = Math.pow(Math.random(), 0.82) * 1.55;
        }
      } else {
        radius = Math.pow(Math.random(), 0.65) * 4.2;
      }

      breathGathers[i] = gather;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] =
        radius * Math.sin(phi) * Math.sin(theta) * (breathMode ? 0.72 : 0.55);
      positions[i3 + 2] =
        (Math.random() - 0.5) * (breathMode && gather < 0.1 ? 2.2 : breathMode ? 1.2 : 2.5) -
        0.8;

      if (breathMode && gather < 0.1) {
        sizes[i] = (Math.random() * 0.16 + 0.06) * intensity * theme.particles.intensity;
      } else {
        sizes[i] = (Math.random() * 0.28 + 0.1) * intensity * theme.particles.intensity;
      }
      phases[i] = Math.random() * Math.PI * 2;
      targets[i * 2] = positions[i3];
      targets[i * 2 + 1] = positions[i3 + 1];
    }

    return { positions, sizes, phases, targets, breathGathers };
  }, [count, intensity, theme.particles.intensity, breathMode]);

  const targetAttrRef = useRef<Float32Array>(targets);

  useEffect(() => {
    if (!formation || formation === "none") return;
    const next = buildFormationTargets(formation, count);
    targetAttrRef.current = next;
    const geom = meshRef.current?.geometry as THREE.BufferGeometry | undefined;
    const attr = geom?.getAttribute("aTarget") as
      | THREE.BufferAttribute
      | undefined;
    if (attr) {
      (attr as THREE.BufferAttribute).array = next;
      attr.needsUpdate = true;
    }
  }, [formation, count]);

  useEffect(() => {
    // 手机端关闭爆发反馈
    if (isMobile) return;
    burstStrength.current = Math.max(burstStrength.current, burstSignal);
  }, [burstSignal, isMobile]);

  useEffect(() => {
    formationStrength.current = formationSignal;
  }, [formationSignal]);

  useEffect(() => {
    if (focusAnchor) {
      const world = clientToWorld(focusAnchor.x, focusAnchor.y, viewport);
      targetFocus.current.copy(world);
    }
  }, [focusAnchor, viewport.width, viewport.height]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uFocus: { value: new THREE.Vector2(0, 0) },
      uFocusStrength: { value: 0 },
      uDissolve: { value: dissolve },
      uBreath: { value: 0 },
      uBreathMode: { value: breathMode ? 1 : 0 },
      uTremble: { value: 0 },
      uFormation: { value: 0 },
      uBurst: { value: 0 },
      uRitualExpand: { value: 0 },
      uColorA: { value: colorA.clone() },
      uColorB: { value: colorB.clone() },
      uTrail: { value: theme.particles.trail },
      uAttract: { value: theme.particles.attract },
      // 手机端：更小的粒子尺寸与更收敛的光晕
      uSizeScale: { value: isMobile ? 0.62 : 1 },
      uHaloScale: { value: isMobile ? 0.6 : 1 },
    }),
    [dissolve, colorA, colorB, theme.particles.trail, theme.particles.attract, breathMode, isMobile],
  );

  useEffect(() => {
    if (!interactive || breathMode) return;
    const toPointer = (clientX: number, clientY: number) => {
      targetPointer.current.copy(clientToWorld(clientX, clientY, viewport));
    };

    const onMove = (e: MouseEvent) => {
      if (!ritualActive) toPointer(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t && !ritualActive) toPointer(t.clientX, t.clientY);
    };

    const clearLongPress = () => {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const startLongPress = (x: number, y: number) => {
      if (ritualActive) return;
      clearLongPress();
      toPointer(x, y);
      longPressTimer.current = window.setTimeout(() => {
        const id = pickFormation(theme.formations);
        if (id !== "none") {
          triggerFormation(id);
          window.setTimeout(() => releaseFormation(), 2600);
        }
        if (navigator.vibrate) navigator.vibrate(10);
      }, 650);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || shouldIgnoreParticleGesture(e.target)) return;
      touchStartRef.current = {
        x: t.clientX,
        y: t.clientY,
        t: Date.now(),
      };
      startLongPress(t.clientX, t.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      clearLongPress();
      const start = touchStartRef.current;
      if (!start || shouldIgnoreParticleGesture(e.target)) {
        touchStartRef.current = null;
        return;
      }
      const elapsed = Date.now() - start.t;
      toPointer(start.x, start.y);
      if (elapsed < 520) triggerBurst();
      touchStartRef.current = null;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (shouldIgnoreParticleGesture(e.target)) return;
      startLongPress(e.clientX, e.clientY);
    };
    const onEnd = () => clearLongPress();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onEnd);

    return () => {
      clearLongPress();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [
    viewport.width,
    viewport.height,
    theme.formations,
    triggerFormation,
    releaseFormation,
    ritualActive,
    triggerBurst,
    interactive,
    breathMode,
  ]);

  useFrame((state) => {
    const material = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!material) return;

    const breath =
      breathAmount ??
      0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.55);
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uBreath.value = breath;
    material.uniforms.uTremble.value = tremble;
    material.uniforms.uBreathMode.value = breathMode ? 1 : 0;
    material.uniforms.uDissolve.value = THREE.MathUtils.lerp(
      material.uniforms.uDissolve.value,
      dissolve,
      0.12,
    );
    material.uniforms.uPointer.value.lerp(targetPointer.current, 0.4);
    material.uniforms.uFocus.value.lerp(targetFocus.current, 0.18);
    focusStrengthRef.current = THREE.MathUtils.lerp(
      focusStrengthRef.current,
      focusStrength,
      focusStrength > focusStrengthRef.current ? 0.14 : 0.06,
    );
    material.uniforms.uFocusStrength.value = focusStrengthRef.current;

    ritualExpandRef.current = THREE.MathUtils.lerp(
      ritualExpandRef.current,
      ritualExpand,
      ritualExpand > ritualExpandRef.current ? 0.09 : 0.05,
    );
    material.uniforms.uRitualExpand.value = ritualExpandRef.current;

    formationStrength.current = THREE.MathUtils.lerp(
      formationStrength.current,
      formationSignal,
      formationSignal > formationStrength.current ? 0.07 : 0.035,
    );
    material.uniforms.uFormation.value = formationStrength.current;

    burstStrength.current = THREE.MathUtils.lerp(burstStrength.current, 0, 0.12);
    material.uniforms.uBurst.value = burstStrength.current;

    material.uniforms.uColorA.value.lerp(colorA, 0.08);
    material.uniforms.uColorB.value.lerp(colorB, 0.08);
  });

  return (
    <points ref={meshRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aBreathGather" args={[breathGathers, 1]} />
        <bufferAttribute
          attach="attributes-aTarget"
          args={[targetAttrRef.current, 2]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
