"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import dynamic from "next/dynamic";
import state from "@/store";

// ── Types ──────────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  title: string;
  prompt: string;
  color: string;
  colorName: string;
  size: string;
  quantity: number;
  price: number;
  designDataUrl: string;
}

const SHIRT_COLORS = [
  { hex: "#000000", name: "Negro" },
  { hex: "#2d2d2d", name: "Gris" },
  { hex: "#F5F0E8", name: "Blanco" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const AI_PROMPTS = ["Lobo geométrico low-poly con luna llena dorada"];

const BASE_PRICE = 4500;

// ── Main Component ──────────────────────────────────────────────────────────
export default function DesignStudioInteractive() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const threeRef = useRef<{
    renderer: import("three").WebGLRenderer;
    scene: import("three").Scene;
    camera: import("three").PerspectiveCamera;
    tshirtGroup: import("three").Group;
    designMesh: import("three").Mesh;
    bodyMat: import("three").MeshStandardMaterial;
  } | null>(null);

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(SHIRT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [designTitle, setDesignTitle] = useState("Mi Diseño");
  const [threeReady, setThreeReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0.3 });
  const [activeLogoPosition, setActiveLogoPosition] = useState("front_center");
  const totalPrice = BASE_PRICE * quantity;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(p);

  // ── Three.js init ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: (() => void) | null = null;

    const init = async () => {
      try {
        const THREE = await import("three");

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          40,
          canvas.clientWidth / canvas.clientHeight,
          0.1,
          100,
        );
        camera.position.set(0, 0, 4.5);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;

        // Lighting
        const ambient = new THREE.AmbientLight(0xfff8f0, 0.7);
        scene.add(ambient);

        const key = new THREE.DirectionalLight(0xfff8f0, 1.4);
        key.position.set(3, 4, 5);
        scene.add(key);

        const rim = new THREE.DirectionalLight(0xc8a96e, 1.0);
        rim.position.set(-4, 1, -3);
        scene.add(rim);

        const fill = new THREE.DirectionalLight(0x8090ff, 0.4);
        fill.position.set(0, -3, 2);
        scene.add(fill);

        // T-shirt group
        const tshirtGroup = new THREE.Group();
        scene.add(tshirtGroup);

        const fabricColor = new THREE.Color(selectedColor.hex);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: fabricColor,
          roughness: 0.88,
          metalness: 0.02,
        });

        // Body
        const bodyGeo = new THREE.BoxGeometry(1.5, 1.8, 0.1, 10, 12, 2);
        const bp = bodyGeo.attributes.position;
        for (let i = 0; i < bp.count; i++) {
          const x = bp.getX(i);
          const y = bp.getY(i);
          if (y > 0.5) bp.setX(i, x * (1 - (y - 0.5) * 0.25));
          if (y < -0.6) {
            const t = (-0.6 - y) / 0.3;
            bp.setY(i, y + t * t * 0.04);
          }
        }
        bodyGeo.computeVertexNormals();
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        tshirtGroup.add(body);

        // Sleeves
        const makeSleeveGeo = () => {
          const g = new THREE.BoxGeometry(0.6, 0.5, 0.09, 5, 5, 1);
          const p = g.attributes.position;
          for (let i = 0; i < p.count; i++) {
            const x = p.getX(i);
            const y = p.getY(i);
            p.setY(i, y - Math.abs(x) * 0.18);
          }
          g.computeVertexNormals();
          return g;
        };

        const sleeveL = new THREE.Mesh(makeSleeveGeo(), bodyMat);
        sleeveL.position.set(-1.05, 0.72, 0);
        sleeveL.rotation.z = 0.3;
        tshirtGroup.add(sleeveL);

        const sleeveR = new THREE.Mesh(makeSleeveGeo(), bodyMat);
        sleeveR.position.set(1.05, 0.72, 0);
        sleeveR.rotation.z = -0.3;
        tshirtGroup.add(sleeveR);

        // Collar
        const collarMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(selectedColor.hex).multiplyScalar(0.7),
          roughness: 0.95,
        });
        const collarGeo = new THREE.TorusGeometry(0.24, 0.045, 8, 28, Math.PI);
        const collar = new THREE.Mesh(collarGeo, collarMat);
        collar.position.set(0, 0.9, 0.01);
        collar.rotation.z = Math.PI;
        tshirtGroup.add(collar);

        // Design plane
        const designGeo = new THREE.PlaneGeometry(0.9, 0.9);
        const designCanvas = document.createElement("canvas");
        designCanvas.width = 512;
        designCanvas.height = 512;
        drawDefaultDesign(designCanvas);
        const designTex = new THREE.CanvasTexture(designCanvas);
        const designMat = new THREE.MeshBasicMaterial({
          map: designTex,
          transparent: true,
          depthWrite: false,
        });
        const designMesh = new THREE.Mesh(designGeo, designMat);
        designMesh.position.set(0, 0.2, 0.052);
        tshirtGroup.add(designMesh);

        threeRef.current = {
          renderer,
          scene,
          camera,
          tshirtGroup,
          designMesh,
          bodyMat,
        };

        setThreeReady(true);

        // Animate loop
        const animate = () => {
          animFrameRef.current = requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();

        // Resize
        const onResize = () => {
          if (!canvas || !threeRef.current) return;
          threeRef.current.camera.aspect =
            canvas.clientWidth / canvas.clientHeight;
          threeRef.current.camera.updateProjectionMatrix();
          threeRef.current.renderer.setSize(
            canvas.clientWidth,
            canvas.clientHeight,
          );
        };
        window.addEventListener("resize", onResize);

        cleanup = () => {
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        };
      } catch (err) {
        console.error("Three.js studio init error:", err);
      }
    };

    init();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cleanup && cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update shirt color ──────────────────────────────────────────────────
  useEffect(() => {
    if (!threeRef.current) return;
    import("three").then((THREE) => {
      if (!threeRef.current) return;
      threeRef.current.bodyMat.color = new THREE.Color(selectedColor.hex);
    });
  }, [selectedColor]);

  // ── Update rotation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!threeRef.current) return;
    threeRef.current.tshirtGroup.rotation.y = rotation.y;
    threeRef.current.tshirtGroup.rotation.x = rotation.x;
  }, [rotation]);

  // ── Draw default design ──────────────────────────────────────────────
  const drawDefaultDesign = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 512);

    const grad = ctx.createRadialGradient(256, 220, 0, 256, 220, 200);
    grad.addColorStop(0, "rgba(200,169,110,0.8)");
    grad.addColorStop(0.6, "rgba(160,120,64,0.4)");
    grad.addColorStop(1, "rgba(200,169,110,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Star
    ctx.strokeStyle = "rgba(226,201,138,0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 130 : 60;
      const x = 256 + r * Math.cos(angle);
      const y = 220 + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.font = "bold 48px sans-serif";
    ctx.fillStyle = "rgba(226,201,138,0.9)";
    ctx.textAlign = "center";
    ctx.fillText("TeeForge", 256, 390);

    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(200,169,110,0.5)";
    ctx.fillText("Describí tu diseño →", 256, 440);
  };

  // ── Update design texture ──────────────────────────────────────────────
  const updateDesignTexture = useCallback(async (imageUrl: string) => {
    if (!threeRef.current) return;
    const THREE = await import("three");
    const designCanvas = document.createElement("canvas");
    designCanvas.width = 512;
    designCanvas.height = 512;
    const ctx = designCanvas.getContext("2d")!;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, 512, 512);
      ctx.drawImage(img, 56, 56, 400, 400);
      const tex = new THREE.CanvasTexture(designCanvas);
      const mat = threeRef.current!.designMesh
        .material as import("three").MeshBasicMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    };
    img.onerror = () => {
      // Fallback: draw gradient design
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "rgba(200,169,110,0.9)");
      grad.addColorStop(1, "rgba(139,158,255,0.9)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(256, 256, 200, 0, Math.PI * 2);
      ctx.fill();
      const tex = new THREE.CanvasTexture(designCanvas);
      const mat = threeRef.current!.designMesh
        .material as import("three").MeshBasicMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    };
    img.src = imageUrl;
  }, []);

  // ── AI Generate ──────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setDesignTitle(prompt.slice(0, 30) + (prompt.length > 30 ? "…" : ""));

    // ⚠️ TODO: Connect to DALL-E API (OpenAI)
    // const response = await fetch('/api/generate-design', {
    //   method: 'POST',
    //   body: JSON.stringify({ prompt }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const { imageUrl } = await response.json();

    // Mock: simulate AI generation delay
    await new Promise((r) => setTimeout(r, 2800));

    // Mock design — use a themed Unsplash image as placeholder
    const mockImages = [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=512&h=512&fit=crop&q=90",
      "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=512&h=512&fit=crop&q=90",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop&q=90",
      "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=512&h=512&fit=crop&q=90",
    ];
    const mockUrl = mockImages[Math.floor(Math.random() * mockImages.length)];

    setGeneratedDesign(mockUrl);
    await updateDesignTexture(mockUrl);
    setIsGenerating(false);
  };

  // ── Drag to rotate ──────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotation((r) => ({
      y: r.y + dx * 0.01,
      x: Math.max(-0.5, Math.min(0.5, r.x + dy * 0.005)),
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  // ── Add to cart ──────────────────────────────────────────────────────
  const handleAddToCart = () => {
    const item: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: designTitle || "Mi Diseño TeeForge",
      prompt: prompt || "Diseño personalizado",
      color: selectedColor.hex,
      colorName: selectedColor.name,
      size: selectedSize,
      quantity,
      price: BASE_PRICE,
      designDataUrl: generatedDesign || "",
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("teeforge-cart") || "[]",
      ) as CartItem[];
      existing.push(item);
      localStorage.setItem("teeforge-cart", JSON.stringify(existing));
      window.dispatchEvent(new Event("teeforge-cart-update"));
    } catch {
      /* ignore */
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };
  console.log("IMAG", generatedDesign);
  return (
    <div className="min-h-screen pt-10">
      {/* Page header - Más minimalista y elegante */}
      <header className="py-16 px-6 text-center relative overflow-hidden border-b border-[#C8A96E]">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(200,169,110,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1  bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-[10px] uppercase tracking-[0.2em] font-bold mb-6 animate-fade-in">
            <Icon name="SparklesIcon" size={12} variant="solid" />
            IA Creative Studio
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Diseñá tu remera <br />
            <span className="text-gradient-gold">
              con Inteligencia Artificial
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto leading-relaxed">
            Transformá tus ideas en prendas únicas. Nuestra IA genera diseños
            exclusivos listos para estampar en calidad premium.
          </p>
        </div>
      </header>

      {/* Main studio layout */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left panel — Controls (Scrollable en desktop si es necesario) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* AI Generator Panel */}
            <section className="studio-panel overflow-hidden border border-[#C8A96E]  shadow-2xl">
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]">
                      <Icon name="SparklesIcon" size={18} variant="solid" />
                    </div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">
                      Concepto Visual
                    </h2>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    STEP 01
                  </span>
                </div>

                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describí tu idea artística..."
                    className="resize-none w-full bg-[var(--bg-elevated)] border border-[#C8A96E] p-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none min-h-[120px]  placeholder:text-[var(--text-muted)]/50 shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <kbd className="text-[10px] bg-[var(--bg-primary)] px-2 py-1  border border-[#C8A96E] text-[var(--text-muted)]">
                      Enter para generar
                    </kbd>
                  </div>
                </div>

                {/* Sugerencias Estilizadas */}
                <div className="space-y-2">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    Sugerencias rápidas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AI_PROMPTS.slice(0, 3).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrompt(p)}
                        className="text-[10px] px-3 py-1.5 bg-[var(--bg-elevated)] border border-[#C8A96E] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-all active:scale-95"
                      >
                        {p.length > 25 ? `${p.slice(0, 25)}...` : p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="group relative w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-primary)] font-bold uppercase text-xs tracking-[0.2em] overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(200,169,110,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? "Procesando Arte..." : "Generar Diseño"}
                    {!isGenerating && (
                      <Icon name="SparklesIcon" size={14} variant="solid" />
                    )}
                  </div>
                  {/* Animación de brillo al pasar el mouse */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                </button>
              </div>
            </section>

            {/* Customization Panel (Color & Talles) */}
            <section className="studio-panel p-6 border border-[#C8A96E] bg-[var(--bg-card)]  space-y-8">
              {/* Color Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">
                    Color Base
                  </h2>
                  <span className="text-[10px] font-bold">
                    {selectedColor.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {SHIRT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => {
                        setSelectedColor(c);
                        state.color = c.hex;
                      }}
                      className={`relative w-8 h-8  transition-all hover:scale-110 ${
                        selectedColor.hex === c.hex
                          ? "ring-2 ring-[var(--accent-gold)] ring-offset-4 ring-offset-[var(--bg-card)] scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector - Más minimalista */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">
                  Talle
                </h2>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`py-3 text-[10px] font-bold border transition-all ${
                        selectedSize === s
                          ? "bg-[var(--accent-gold)] border-[var(--accent-gold)] text-[var(--bg-primary)]"
                          : "bg-transparent border-[#C8A96E] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Checkout Panel */}
            <section className="studio-panel p-6 border border-[#C8A96E] bg-linear-to-b from-(--bg-card) to-[var(--bg-elevated)] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">
                    Inversión Total
                  </p>
                  <p className="text-3xl font-heading font-bold text-[var(--text-primary)]">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">
                    Cantidad
                  </p>
                  <div className="flex items-center gap-3 bg-[var(--bg-primary)] px-2 py-1 border border-[var(--border-subtle)] mt-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-[var(--text-muted)] hover:text-[var(--accent-gold)]"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold min-w-[20px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      className="text-[var(--text-muted)] hover:text-[var(--accent-gold)]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-white text-black font-bold uppercase text-[10px] tracking-widest hover:bg-[var(--accent-gold)] transition-colors flex items-center justify-center gap-2">
                Confirmar Pedido
                <Icon name="ArrowRightIcon" size={14} />
              </button>
            </section>
          </aside>

          {/* Right panel — 3D Viewport - El corazón del estudio */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="studio-panel relative aspect-[4/3] lg:aspect-auto lg:h-[700px] overflow-hidden group">
              {/* Fondo decorativo del Canvas */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-center" />

              {/* 3D Canvas Mock/Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CanvasModel
                  logoPosition={activeLogoPosition}
                  //@ts-ignore
                  customLogo={generatedDesign ?? null}
                />
              </div>

              {/* HUD del Viewer (Heads-up Display) */}

              {/* Controles flotantes de Cámara */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5  bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[
                  { label: "Frente", id: "front_center" },
                  { label: "Pecho (Izq)", id: "front_chest" }, // NUEVO: La opción de pecho chico
                  { label: "Espalda", id: "back_center" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setActiveLogoPosition(pos.id)}
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-tighter transition-all ${
                      activeLogoPosition === pos.id
                        ? "text-[var(--accent-gold)] bg-white/10" // ESTILO: Activo (usando la variable de oro)
                        : "text-white/60 hover:text-white hover:bg-white/5" // ESTILO: Normal
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              {/* IA Generating Overlay - Más dramático */}
              {isGenerating && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-2 border-[var(--accent-gold)]/20  animate-ping" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        name="SparklesIcon"
                        size={32}
                        className="text-[var(--accent-gold)] animate-pulse"
                        variant="solid"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white uppercase tracking-[0.3em]">
                    IA Creativa
                  </h3>
                  <p className="text-[var(--text-muted)] text-xs mt-2 font-mono italic">
                    Tejiendo hilos de datos en arte...
                  </p>
                </div>
              )}
            </div>

            {/* Info del diseño generado (si existe) */}
            {generatedDesign && (
              <div className="p-6 border border-[#C8A96E] bg-gradient-to-r from-[var(--bg-card)] to-transparent flex items-center gap-6 animate-slide-up">
                <div className="w-20 h-20 overflow-hidden border border-[#C8A96E] shadow-lg bg-black">
                  <img
                    src={generatedDesign}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-heading font-bold text-[var(--text-primary)]">
                      {designTitle}
                    </h4>
                    <div className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-bold uppercase">
                      Diseño Exclusivo
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
                    Este patrón ha sido generado específicamente para tu cuenta.
                    La resolución es apta para impresión DTG de alta definición.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
const CanvasModel = dynamic(() => import("@/canvas"), {
  ssr: false,
});
