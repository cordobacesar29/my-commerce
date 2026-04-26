import { useRef, useEffect } from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame, useThree } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import state from "../store";
import * as THREE from "three";

// NUEVO: Configuraciones predefinidas para las ubicaciones del logo
const LOGO_LOCATIONS = {
  // Frente centrado (Valor por defecto)
  front_center: {
    position: [0, 0.04, 0.15],
    rotation: [0, 0, 0],
    scale: 0.25,
  },
  // Espalda centrada
  back_center: {
    position: [0, 0.1, -0.16], // Un poco más arriba y hacia atrás
    rotation: [0, Math.PI, 0], // Rotación de 180° para que mire hacia atrás
    scale: 0.23, // Un poquito más pequeño
  },
  // Pecho izquierdo (Lado del corazón)
  front_chest: {
    position: [0.100, 0.08, 0.125], // hacia la derecha 
    rotation: [0, 0, 0],
    scale: 0.14, // Lo achicamos un poco más para que sea más elegante
  },
};

useGLTF.preload("/shirt_baked.glb");

const Shirt = ({ customLogo = null, autoRotate = false, logoPosition = 'front_center' }) => {
  const snap = useSnapshot(state);
  const { gl, size } = useThree();
  const { nodes, materials } = useGLTF("/shirt_baked.glb");
  
  const shirtRef = useRef();
  const meshRef = useRef();
  
  const logoTexture = useTexture(customLogo || snap.logoDecal);

  useEffect(() => {
    if (logoTexture) {
      logoTexture.colorSpace = THREE.SRGBColorSpace; // Para que los colores se vean bien
      logoTexture.needsUpdate = true;
      logoTexture.anisotropy = 16;
    }
  }, [logoTexture, customLogo]);
  
  const autoRotateSpeed = 0.8; 
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const damping = 0.92;
const material = materials.lambert1;
  // Sincronización de color
  useEffect(() => {
    if (material) {
      material.map = null;
      material.aoMap = null;
      material.lightMap = null;
      //materials.lambert1.color.set(snap.color || "#ffffff");
      material.needsUpdate = true;
    }
  }, [material]);

  useFrame((_state, delta) => {
    if (!materials?.lambert1 || !meshRef.current || !shirtRef.current) return;

    easing.dampC(material.color, snap.color, 0.25, delta);
    
    meshRef.current.rotation.y += (snap.shirtRotation - meshRef.current.rotation.y) * 0.1;
    meshRef.current.scale.lerp({ x: snap.shirtScale, y: snap.shirtScale, z: snap.shirtScale }, 0.1);
    easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);

    if (!isDragging.current) {
      if (autoRotate) {
        shirtRef.current.rotation.y += autoRotateSpeed * delta;
      }
      rotationSpeed.current *= damping;
      if (Math.abs(rotationSpeed.current) < 1e-5) rotationSpeed.current = 0;
      shirtRef.current.rotation.y += rotationSpeed.current;
    }
  });

  // Lógica de Mouse Events (se mantiene igual)
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;
    canvas.style.touchAction = "none";
    const getClientX = (e) => {
      if (e.touches && e.touches[0]) return e.touches[0].clientX;
      return e.clientX ?? e.nativeEvent?.clientX ?? 0;
    };
    const onPointerDown = (e) => {
      isDragging.current = true;
      lastX.current = getClientX(e);
    };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const clientX = getClientX(e);
      const deltaRotation = ((clientX - lastX.current) / size.width) * Math.PI;
      if (shirtRef.current) shirtRef.current.rotation.y += deltaRotation;
      rotationSpeed.current = deltaRotation;
      lastX.current = clientX;
    };
    const onPointerUp = () => { isDragging.current = false; };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl, size.width]);

  // NUEVO: Obtener la configuración actual. Si no existe la key, fallback al frente centrado.
  const currentDecalConfig = LOGO_LOCATIONS[logoPosition] || LOGO_LOCATIONS['front_center'];

  return (
    <group ref={shirtRef}>
      <mesh
        ref={meshRef}
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
        key={customLogo || 'default'}
      >
        <Decal
          {...currentDecalConfig} // NUEVO: Aplicamos position, rotation y scale dinámicamente
          map={logoTexture}
          anisotropy={16}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default Shirt;