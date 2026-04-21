## Skill 3: Three.js & Visualizer Guru (`three-visualizer.md`)

Como Senior, sabes que el 3D en la web puede matar el rendimiento si no se cuida. Esta skill obliga a la IA a seguir patrones de optimización para tus modelos GLB.

**Ruta:** `/.codex/skills/three-visualizer.md`

```markdown
# 🧊 Skill: Three.js & React Three Fiber (R3F)

**Uso:** Desarrollo de componentes dentro de `/src/components/canvas/` y manejo de modelos 3D.

## 1. Optimización de Assets
- **Carga:** Usar `useGLTF` de `@react-three/drei`.
- **Preload:** Todos los modelos deben tener una llamada a `useGLTF.preload('/path/to/model.glb')` fuera del componente.
- **Instancias:** Si hay muchos elementos iguales, usar `Merged` o `Instances`.

## 2. Mapeo Dinámico (Logos)
Para el posicionamiento de logos en la remera de Ramón Store, usar estas coordenadas de referencia:
- `front_chest`: position [0, 0.4, 0.15], rotation [0, 0, 0]
- `back_center`: position [0, 0.4, -0.15], rotation [0, Math.PI, 0]

## 3. Estado de la Escena
- Usar **Zustand** para sincronizar el color de la remera y la textura del logo entre la UI de React y el Canvas de Three.js.
- Evitar pasar props pesadas; leer directamente del store dentro del componente 3D.

## 4. Gold Standard: Componente de Textura
```typescript
const DecalLogo = () => {
  const logo = useTexture(state.logoUrl);
  return (
    <Decal 
      position={[0, 0.04, 0.15]} 
      rotation={[0, 0, 0]} 
      scale={0.15} 
      map={logo} 
    />
  );
};