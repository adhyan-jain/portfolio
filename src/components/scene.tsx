"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { signal } from "@/lib/signal";

const vert = /* glsl */ `
uniform float uTime, uMix, uScroll, uSize, uBurst;
uniform vec2 uPointer;
attribute vec3 aTarget;
attribute float aSeed;
varying float vSeed;
void main() {
  vSeed = aSeed;
  vec3 p = position;
  p.x += sin(uTime * .2 + p.y * .6 + aSeed * 6.28) * .35;
  p.y += cos(uTime * .15 + p.x * .5 + aSeed * 6.28) * .35;
  p.y = mod(p.y + uScroll * 12. * (.3 + aSeed) + 4., 8.) - 4.;
  vec3 t = aTarget;
  t.xy += vec2(sin(uTime + aSeed * 20.), cos(uTime * .8 + aSeed * 30.)) * .08;
  p = mix(p, t, uMix);
  p.xy *= 1. + uBurst * (aSeed + .3) * 2.;
  vec2 d = p.xy - uPointer * vec2(5.2, 2.9);
  float r = length(d);
  p.xy += normalize(d + 1e-4) * smoothstep(1.5, 0., r) * 1.1;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = uSize * (.4 + aSeed) * (6. / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const frag = /* glsl */ `
varying float vSeed;
void main() {
  float d = length(gl_PointCoord - .5);
  if (d > .5) discard;
  float a = smoothstep(.5, 0., d) * (.12 + .42 * vSeed);
  vec3 col = mix(vec3(1., .29, .11), vec3(.35, .84, 1.), step(.94, vSeed));
  col = mix(col, vec3(1.), step(.985, vSeed));
  gl_FragColor = vec4(col, a);
}`;

function buildGeometry(count: number) {
  const pos = new Float32Array(count * 3);
  const tgt = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos.set([(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6], i * 3);
    const a = Math.random() * Math.PI * 2;
    const r = 1.8 + Math.pow(Math.random(), 2) * 1.6;
    tgt.set([Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.8, (Math.random() - 0.5) * 1.5], i * 3);
    seed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aTarget", new THREE.BufferAttribute(tgt, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  return g;
}

function Field({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const [geo] = useState(() => buildGeometry(count));
  const [uniforms] = useState(() => ({
    uTime: { value: 0 },
    uMix: { value: 0 },
    uScroll: { value: 0 },
    uBurst: { value: 0 },
    uSize: { value: 5 },
    uPointer: { value: new THREE.Vector2() },
  }));

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    const k = (rate: number) => Math.min(1, dt * rate);
    u.uTime.value += dt;
    u.uScroll.value += (signal.scroll - u.uScroll.value) * k(3);
    u.uMix.value += (signal.mix - u.uMix.value) * k(1.6);
    u.uBurst.value += (signal.burst - u.uBurst.value) * k(2.5);
    u.uPointer.value.x += (signal.px - u.uPointer.value.x) * k(6);
    u.uPointer.value.y += (signal.py - u.uPointer.value.y) * k(6);
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Scene() {
  const count = typeof window !== "undefined" && window.innerWidth < 768 ? 6000 : 15000;
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <Field count={count} />
    </Canvas>
  );
}
