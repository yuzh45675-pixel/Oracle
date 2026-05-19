"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 3200;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uDissolve;
  attribute float aSize;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float drift = sin(uTime * 0.2 + aPhase) * 0.035;
    pos.y += drift;
    pos.x += cos(uTime * 0.16 + aPhase * 1.3) * 0.02;

    vec2 toMouse = uMouse - pos.xy;
    float dist = length(toMouse);
    float attract = smoothstep(0.7, 0.0, dist) * 0.32;
    pos.xy += normalize(toMouse + 0.0001) * attract;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (105.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = (0.32 + aSize * 0.45) * uDissolve;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.28, 0.0, d);
    float halo = smoothstep(0.5, 0.08, d) * 0.45;
    float alpha = (core * 0.85 + halo) * vAlpha;
    vec3 color = mix(vec3(0.38, 0.34, 0.92), vec3(0.92, 0.9, 1.0), core);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface CosmicParticlesProps {
  dissolve?: number;
  intensity?: number;
}

export function CosmicParticles({
  dissolve = 1,
  intensity = 1,
}: CosmicParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const targetMouse = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const { positions, sizes, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const phases = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 0.65) * 4.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i3 + 2] = (Math.random() - 0.5) * 2.5 - 0.8;

      sizes[i] = (Math.random() * 0.28 + 0.1) * intensity;
      phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, sizes, phases };
  }, [intensity]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uDissolve: { value: dissolve },
    }),
    [dissolve]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouse.current.set(
        x * (viewport.width / 2),
        y * (viewport.height / 2)
      );
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [viewport.width, viewport.height]);

  useFrame((state) => {
    const material = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!material) return;

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uDissolve.value = THREE.MathUtils.lerp(
      material.uniforms.uDissolve.value,
      dissolve,
      0.12
    );
    material.uniforms.uMouse.value.lerp(targetMouse.current, 0.42);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
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
