"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import Shirt from "./Shirt";
import { Suspense } from "react";

export default function CanvasModel({
  customLogo = null,
  autoRotate = false,
  logoPosition = "front_center",
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, 3], fov: 35 }}
      style={{ pointerEvents: "auto" }} // Asegura que el canvas reciba clicks
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <Center>
        <group scale={2.5}>
          <Suspense fallback={null}>
            {/* Pasamos las props recibidas hacia el componente Shirt */}
            <Shirt
              customLogo={customLogo}
              autoRotate={autoRotate}
              logoPosition={logoPosition}
            />
          </Suspense>
        </group>
      </Center>

      <Environment preset="city" />
    </Canvas>
  );
}
