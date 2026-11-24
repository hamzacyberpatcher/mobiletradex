"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import Phone from "./Phone";

export default function PhoneStage() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      data-testid="phone-stage"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[2.5, 3.5, 4]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-4, -1, 2]} intensity={0.8} color="#b7c9d8" />
        {/* offline studio lighting: no HDR download needed */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.4} position={[0, 4, 4]} scale={[9, 3, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[7, 5, 1]} color="#b7c9d8" />
          <Lightformer form="rect" intensity={1.2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[7, 5, 1]} color="#c5c49b" />
          <Lightformer form="rect" intensity={0.8} position={[0, -4, 3]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} color="#7fa2bf" />
        </Environment>
        <Phone />
      </Canvas>
    </div>
  );
}
