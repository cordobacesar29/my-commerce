import { useRef, useEffect } from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame, useThree } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import state from "../store";

const Shirt = () => {
  const snap = useSnapshot(state);
  const { gl, size } = useThree(); // size.width -> pixels
  const { nodes, materials } = useGLTF("/shirt_baked.glb");
  const shirtRef = useRef();
  const meshRef = useRef();
  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);
  const autoRotateSpeed = 0.8; // radianes por segundo (velocidad media)

  // rotación / inercia
  const isDragging = useRef(false);
  // const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const damping = 0.92;

  // Crear un material nuevo y limpio
  useEffect(() => {
    if (materials.lambert1) {
      // eliminar mapa de textura baked
      materials.lambert1.map = null;
      materials.lambert1.aoMap = null;
      materials.lambert1.lightMap = null;

      // resetear color e iluminación
      materials.lambert1.color.set(snap.color || "#ffffff");
      materials.lambert1.needsUpdate = true;
    }
  }, [materials, snap.color]);

  useFrame((_state, delta) => {
    // proteger contra materiales no cargados todavía
    if (!materials?.lambert1) return;
    if (!meshRef.current) return;

    // Rotación suave por hover
    meshRef.current.rotation.y +=
      (snap.shirtRotation - meshRef?.current.rotation.y) * 0.1;

    // Escala suave por focus
    meshRef?.current.scale.lerp(
      { x: snap.shirtScale, y: snap.shirtScale, z: snap.shirtScale },
      0.1,
    );

    // Spin épico al loguearse
    if (snap.triggerSpin) {
      meshRef.current.rotation.y += 0.2;
    }

    // suavizar color
    easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);

    // aplicar inercia + auto rotación
    if (!shirtRef.current) return;

    if (!isDragging.current) {
      // giro automático constante
      shirtRef.current.rotation.y += autoRotateSpeed * delta;

      // mantener inercia si viene del drag
      rotationSpeed.current *= damping;
      if (Math.abs(rotationSpeed.current) < 1e-5) rotationSpeed.current = 0;
      shirtRef.current.rotation.y += rotationSpeed.current;
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    // evita el scroll en mobile cuando arrastrás el canvas
    canvas.style.touchAction = "none";

    const getClientX = (e) => {
      // soporta pointer events y touch events
      if (e.touches && e.touches[0]) return e.touches[0].clientX;
      if (typeof e.clientX === "number") return e.clientX;
      // fallback: algunos eventos de R3F traen nativeEvent
      if (e.nativeEvent && typeof e.nativeEvent.clientX === "number")
        return e.nativeEvent.clientX;
      return 0;
    };

    const onPointerDown = (e) => {
      e.stopPropagation();
      isDragging.current = true;
      lastX.current = getClientX(e);
    };

    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      e.stopPropagation();
      const clientX = getClientX(e);
      const delta = (clientX - lastX.current) / Math.max(size.width, 1); // normalizo por ancho en px
      const rotationDelta = delta * Math.PI; // factor ajustable
      if (shirtRef.current) shirtRef.current.rotation.y += rotationDelta;
      rotationSpeed.current = rotationDelta;
      lastX.current = clientX;
    };

    const onPointerUp = (e) => {
      e.stopPropagation();
      isDragging.current = false;
    };

    // Registrar listeners en el canvas (más fiable para arrastrar fuera del mesh)
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Touch como fallback
    canvas.addEventListener("touchstart", onPointerDown, { passive: true });
    canvas.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp, { passive: true });

    return () => {
      canvas.style.touchAction = "";
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("touchstart", onPointerDown);
      canvas.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [gl, size.width]); // solo volver a registrar si cambia canvas o tamaño

  const stateString = JSON.stringify(snap);

  return (
    <group key={stateString} ref={shirtRef}>
      <mesh
        ref={meshRef}
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
      >
        {snap.isFullTexture && (
          <Decal
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            map={fullTexture}
          />
        )}

        {snap.isLogoTexture && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTexture}
            depthTest={true}
            depthWrite={false}
            anisotropy={16}
          />
        )}
      </mesh>
    </group>
  );
};

export default Shirt;
