"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { story, poseAt, repairAt, type Pose } from "@/lib/story";
import { interaction, attachInteraction, pulseAmount } from "./interaction"; // cursor interaction (experimental)
import {
  PHONE,
  SCREEN_W,
  SCREEN_H,
  IMPACT_UV,
  drawScreen,
  makeCrackTexture,
  makeScuffTexture,
} from "./textures";

const { W, H, D, R, INSET } = PHONE;

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** ShapeGeometry UVs are raw coordinates; remap to 0..1 over the screen. */
function normaliseUV(geo: THREE.BufferGeometry, w: number, h: number, flipU = false) {
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + w / 2) / w;
    uv[i * 2] = flipU ? 1 - u : u;
    uv[i * 2 + 1] = (pos.getY(i) + h / 2) / h;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const easeOutBack = (t: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

const CRACK_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Heals outward from the impact point, leaving a thin bright seam at the front.
const CRACK_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHeal;
  uniform vec2 uOrigin;
  uniform vec2 uAspect;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    float d = length((vUv - uOrigin) * uAspect);
    float front = uHeal * 2.6;
    float keep = smoothstep(front - 0.05, front + 0.02, d);
    float live = step(0.003, uHeal) * (1.0 - step(0.997, uHeal));
    float seam = (1.0 - smoothstep(0.0, 0.05, abs(d - front))) * live;
    vec3 col = mix(c.rgb, vec3(0.72, 0.86, 1.0), seam);
    gl_FragColor = vec4(col, max(c.a * keep, seam * 0.55));
    #include <colorspace_fragment>
  }
`;

export default function Phone() {
  const { viewport, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const badge = useRef<THREE.Group>(null);

  const cur = useRef<(Pose & { repair: number }) | null>(null);
  const lastApplied = useRef(-1);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // cursor interaction (experimental): click inside the handset's footprint
  useEffect(() => {
    return attachInteraction((cx, cy) => {
      const c = cur.current;
      if (!c || story.mobile) return false;
      const hp = c.h * size.height;
      const wp = (hp * W) / H;
      const dx = cx - size.width * (0.5 + c.px);
      const dy = cy - size.height * (0.5 - c.py);
      return Math.abs(dx) < wp * 0.6 && Math.abs(dy) < hp * 0.5;
    });
  }, [size.width, size.height]);

  const ptr = useRef({ x: 0, y: 0 });

  const built = useMemo(() => {
    const frameGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 28,
    });
    frameGeo.translate(0, 0, -D / 2);

    const screenGeo = new THREE.ShapeGeometry(
      roundedRect(SCREEN_W, SCREEN_H, R - INSET),
      24,
    );
    normaliseUV(screenGeo, SCREEN_W, SCREEN_H);
    const crackGeo = screenGeo.clone();

    const backGeo = new THREE.ShapeGeometry(roundedRect(W, H, R), 24);
    normaliseUV(backGeo, W, H, true);
    backGeo.rotateY(Math.PI);
    const scuffGeo = backGeo.clone();

    return {
      frame: frameGeo,
      screen: screenGeo,
      crack: crackGeo,
      back: backGeo,
      scuff: scuffGeo,
    };
  }, []);

  const mats = useMemo(() => {
    const crackTex = makeCrackTexture();
    const scuffTex = makeScuffTexture();
    const screenTex = drawScreen("sans-serif", "monospace");

    return {
      screenTex,
      side: new THREE.MeshStandardMaterial({
        color: "#4a6580",
        metalness: 0.92,
        roughness: 0.55,
      }),
      cap: new THREE.MeshStandardMaterial({ color: "#06090d", roughness: 0.3, metalness: 0.2 }),
      screen: new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }),
      back: new THREE.MeshPhysicalMaterial({
        color: "#a9bccb",
        roughness: 0.45,
        metalness: 0.1,
        clearcoat: 0,
      }),
      scuff: new THREE.MeshBasicMaterial({
        map: scuffTex,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
      crack: new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMap: { value: crackTex },
          uHeal: { value: 0 },
          uOrigin: { value: IMPACT_UV },
          uAspect: { value: new THREE.Vector2(SCREEN_W, SCREEN_H) },
        },
        vertexShader: CRACK_VERT,
        fragmentShader: CRACK_FRAG,
      }),
      glass: new THREE.MeshStandardMaterial({ color: "#04070b", roughness: 0.1, metalness: 0.6 }),
      barrel: new THREE.MeshStandardMaterial({ color: "#aab9c6", roughness: 0.22, metalness: 1 }),
      lensRim: new THREE.MeshStandardMaterial({ color: "#d3dde5", roughness: 0.15, metalness: 1 }),
      lensGlass: new THREE.MeshPhysicalMaterial({
        color: "#0b1626",
        roughness: 0.02,
        metalness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0,
        envMapIntensity: 2.2,
      }),
      sensor: new THREE.MeshStandardMaterial({ color: "#2e5e8e", roughness: 0.2, metalness: 0.8, emissive: "#1b3a5a", emissiveIntensity: 0.6 }),
      island: new THREE.MeshStandardMaterial({ color: "#1c2a38", roughness: 0.35, metalness: 0.5 }),
      shield: new THREE.MeshStandardMaterial({
        color: "#2e5e8e",
        roughness: 0.3,
        metalness: 0.35,
        emissive: "#2e5e8e",
        emissiveIntensity: 0.25,
      }),
      tick: new THREE.MeshStandardMaterial({
        color: "#e6ebe8",
        roughness: 0.3,
        emissive: "#c5c49b",
        emissiveIntensity: 0.35,
      }),
    };
  }, []);

  // Draw the screen with the page's real fonts once they've loaded.
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const cs = getComputedStyle(document.body);
      const sans = cs.fontFamily;
      const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono") || "monospace";
      drawScreen(sans, mono, mats.screenTex);
    });
    return () => {
      cancelled = true;
    };
  }, [mats]);

  const shieldGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.5);
    s.lineTo(0.38, 0.36);
    s.lineTo(0.38, 0.02);
    s.quadraticCurveTo(0.38, -0.3, 0, -0.5);
    s.quadraticCurveTo(-0.38, -0.3, -0.38, 0.02);
    s.lineTo(-0.38, 0.36);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
      curveSegments: 16,
    });
    g.translate(0, 0, -0.04);
    return g;
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const mobile = size.width < 1024;
    story.mobile = mobile;

    const target = poseAt(story.s, mobile);
    const targetRepair = repairAt(story.s);

    if (!cur.current) {
      // intro: the handset swings in from the side, smaller
      cur.current = {
        ...target,
        ry: target.ry - 2.6,
        h: target.h * 0.72,
        px: target.px + (mobile ? 0 : 0.12),
        repair: 0,
      };
    }
    const c = cur.current;
    const lam = reduced.current ? 14 : 6;
    c.px = THREE.MathUtils.damp(c.px, target.px, lam, d);
    c.py = THREE.MathUtils.damp(c.py, target.py, lam, d);
    c.h = THREE.MathUtils.damp(c.h, target.h, lam, d);
    c.ry = THREE.MathUtils.damp(c.ry, target.ry, lam, d);
    c.rx = THREE.MathUtils.damp(c.rx, target.rx, lam, d);
    c.rz = THREE.MathUtils.damp(c.rz, target.rz, lam, d);
    c.repair = THREE.MathUtils.damp(c.repair, targetRepair, lam * 0.8, d);
    story.shown = c.repair;

    // The brands section fully covers the canvas: stop drawing.
    g.visible = story.coverTop > 0;
    if (!g.visible) return;

    const t = reduced.current ? 0 : state.clock.elapsedTime;
    g.position.set(
      c.px * viewport.width,
      c.py * viewport.height + Math.sin(t * 0.9) * 0.03,
      0,
    );
    g.scale.setScalar((c.h * viewport.height) / H);
    // cursor tilt (experimental)
    ptr.current.x = THREE.MathUtils.damp(ptr.current.x, reduced.current || mobile ? 0 : interaction.x, 5, d);
    ptr.current.y = THREE.MathUtils.damp(ptr.current.y, reduced.current || mobile ? 0 : interaction.y, 5, d);
    g.rotation.set(
      c.rx + Math.sin(t * 0.6) * 0.015 + ptr.current.y * 0.14,
      c.ry + Math.sin(t * 0.45) * 0.03 + ptr.current.x * 0.3,
      c.rz,
    );

    const r = c.repair;
    if (Math.abs(r - lastApplied.current) > 0.0015) {
      lastApplied.current = r;
      mats.scuff.opacity = 1 - smoothstep(0.1, 0.8, r);
      mats.side.roughness = THREE.MathUtils.lerp(0.55, 0.2, r);
      mats.side.color.set("#4a6580").lerp(new THREE.Color("#7694ae"), r);
      mats.back.roughness = THREE.MathUtils.lerp(0.5, 0.16, r);
      mats.back.clearcoat = r * 0.8;
    }
    // click pulse (experimental): cracks heal outward then re-form
    const re = r + (1 - r) * pulseAmount(performance.now());
    mats.crack.uniforms.uHeal.value = re;
    mats.screen.color.setScalar(THREE.MathUtils.lerp(0.5, 1, smoothstep(0, 0.9, re)));

    const b = badge.current;
    if (b) {
      // only visible while the handset faces the camera
      const facing = smoothstep(0.15, 0.55, Math.cos(c.ry));
      const p = smoothstep(0.84, 0.99, r) * facing;
      const sc = p > 0 ? Math.max(0.0001, easeOutBack(p)) : 0.0001;
      b.visible = p > 0.001;
      b.scale.setScalar(sc * 0.5);
      b.rotation.y = Math.sin(t * 0.9) * 0.35;
      b.position.y = 0.6 + Math.sin(t * 1.3) * 0.02;
    }
  });

  const Z_SCREEN = D / 2 + 0.0135;

  return (
    <group ref={group}>
      {/* body */}
      <mesh geometry={built.frame} material={[mats.cap, mats.side]} />
      {/* front */}
      <mesh geometry={built.screen} material={mats.screen} position={[0, 0, Z_SCREEN]} />
      <mesh
        geometry={built.crack}
        material={mats.crack}
        position={[0, 0, Z_SCREEN + 0.0012]}
        renderOrder={2}
      />
      {/* back */}
      <mesh geometry={built.back} material={mats.back} position={[0, 0, -D / 2 - 0.0135]} />
      <mesh
        geometry={built.scuff}
        material={mats.scuff}
        position={[0, 0, -D / 2 - 0.0147]}
        renderOrder={2}
      />

      {/* camera island (local +x shows on the left when seen from behind) */}
      <group position={[0.2, 0.74, -D / 2 - 0.0135]}>
        <RoundedBox args={[0.46, 0.46, 0.03]} radius={0.09} smoothness={4} position={[0, 0, -0.015]} material={mats.island} />
        {/* local +y of a lens points out of the back, so tip it onto -z */}
        {(
          [
            [-0.07, 0.1, 1],
            [-0.07, -0.1, 1],
            [0.11, -0.1, 0.72],
          ] as const
        ).map(([x, y, sc]) => (
          <group key={`${x},${y}`} position={[x, y, -0.03]} rotation={[-Math.PI / 2, 0, 0]} scale={sc}>
            <mesh material={mats.barrel} position={[0, 0.021, 0]}>
              <cylinderGeometry args={[0.09, 0.094, 0.042, 48]} />
            </mesh>
            <mesh material={mats.lensRim} position={[0, 0.043, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.087, 0.006, 12, 56]} />
            </mesh>
            <mesh material={mats.glass} position={[0, 0.0425, 0]}>
              <cylinderGeometry args={[0.072, 0.072, 0.002, 48]} />
            </mesh>
            {/* coated glass element */}
            <mesh material={mats.lensGlass} position={[0, 0.043, 0]} scale={[1, 0.3, 1]}>
              <sphereGeometry args={[0.063, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            {/* inner aperture ring + sensor glint */}
            <mesh material={mats.lensRim} position={[0, 0.0465, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.002, 32]} />
            </mesh>
            <mesh material={mats.sensor} position={[0, 0.0475, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.002, 32]} />
            </mesh>
            <mesh position={[0.026, 0.0595, 0.026]}>
              <sphereGeometry args={[0.005, 12, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* flash */}
        <mesh position={[0.11, 0.12, -0.032]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.006, 32]} />
          <meshStandardMaterial color="#f3efe0" emissive="#c5c49b" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
      </group>

      {/* verified shield, appears once the report is clean */}
      <group ref={badge} position={[0.56, 0.6, 0.32]} visible={false}>
        <mesh geometry={shieldGeo} material={mats.shield} />
        <group position={[0, 0.02, 0.07]}>
          <mesh material={mats.tick} position={[-0.135, -0.085, 0]} rotation={[0, 0, (5 * Math.PI) / 4]}>
            <capsuleGeometry args={[0.04, 0.114, 6, 12]} />
          </mesh>
          <mesh material={mats.tick} position={[0.065, 0, 0]} rotation={[0, 0, -0.733]}>
            <capsuleGeometry args={[0.04, 0.334, 6, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
