"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import Shirt from "./Shirt";
import { Suspense } from "react";

export default function CanvasModel() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, 3], fov: 35 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Center>
        <group scale={2.5}>
          <Suspense fallback={<mesh />}>
            <Shirt />
          </Suspense>
        </group>
      </Center>

      <Environment preset="city" />
    </Canvas>
  );
}
