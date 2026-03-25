"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";

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
  { hex: "#0A0A0A", name: "Negro Profundo" },
  { hex: "#1a1a2e", name: "Azul Noche" },
  { hex: "#1a0a0a", name: "Vino Oscuro" },
  { hex: "#0d1a0d", name: "Verde Bosque" },
  { hex: "#F5F0E8", name: "Crema Natural" },
  { hex: "#2d2d2d", name: "Gris Carbón" },
  { hex: "#8B0000", name: "Rojo Oscuro" },
  { hex: "#1C1C3C", name: "Navy Premium" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const AI_PROMPTS = [
  "Galaxia neon con astronauta flotando entre planetas",
  "Lobo geométrico low-poly con luna llena dorada",
  "Ciudad cyberpunk bajo la lluvia con neones rojos",
  "Dragón japonés con flores de cerezo y montañas",
  "Tigre abstracto con líneas neon y fondo oscuro",
  "Selva tropical con tucán y colores vibrantes",
];

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
          100
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
            canvas.clientHeight
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
  const updateDesignTexture = useCallback(
    async (imageUrl: string) => {
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
        const mat = threeRef.current!.designMesh.material as import("three").MeshBasicMaterial;
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
        const mat = threeRef.current!.designMesh.material as import("three").MeshBasicMaterial;
        mat.map = tex;
        mat.needsUpdate = true;
      };
      img.src = imageUrl;
    },
    []
  );

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

  const handleMouseUp = () => setIsDragging(false);

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
        localStorage.getItem("teeforge-cart") || "[]"
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

  return (
    <div
      className="min-h-screen pt-24"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Page header */}
      <div
        className="py-12 px-6 text-center relative overflow-hidden"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,169,110,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <div className="tag mx-auto mb-4" style={{ display: "inline-flex" }}>
            <Icon name="SparklesIcon" size={10} variant="solid" />
            Estudio de Diseño IA
          </div>
          <h1
            className="text-section"
            style={{ color: "var(--text-primary)" }}
          >
            Diseñá tu remera
            <br />
            <span className="text-gradient-gold">con inteligencia artificial.</span>
          </h1>
        </div>
      </div>

      {/* Main studio */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left panel — controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* AI Prompt */}
            <div className="studio-panel p-6">
              <div className="flex items-center gap-2 mb-5">
                <Icon
                  name="SparklesIcon"
                  size={16}
                  variant="solid"
                  style={{ color: "var(--accent-gold)" } as React.CSSProperties}
                />
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-primary)" }}
                >
                  Describí tu diseño
                </h2>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Un dragón cósmico rodeado de estrellas y nebulosas en colores azul y dorado..."
                className="input-field resize-none mb-4"
                rows={4}
                style={{ borderRadius: "0" }}
              />

              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {AI_PROMPTS.slice(0, 3).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-xs px-2 py-1 transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.65rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-gold)";
                      e.currentTarget.style.color = "var(--accent-gold)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {p.slice(0, 28)}…
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="btn-primary w-full justify-center"
                style={{
                  opacity: !prompt.trim() || isGenerating ? 0.6 : 1,
                  cursor:
                    !prompt.trim() || isGenerating ? "not-allowed" : "pointer",
                }}
              >
                {isGenerating ? (
                  <>
                    <span>Generando con IA</span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{
                            background: "var(--bg-primary)",
                            animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <span>Generar diseño</span>
                    <Icon name="SparklesIcon" size={16} variant="solid" />
                  </>
                )}
              </button>

              {isGenerating && (
                <div className="mt-4">
                  <div className="flex flex-col gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`ai-bar`} style={{ width: `${50 + i * 15}%` }} />
                    ))}
                  </div>
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {/* ⚠️ Mock: real DALL-E API would generate here */}
                    Procesando con IA… (demo: imagen de muestra)
                  </p>
                </div>
              )}
            </div>

            {/* Color picker */}
            <div className="studio-panel p-6">
              <h2
                className="text-sm font-heading font-bold uppercase tracking-widest mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Color de la remera
              </h2>
              <div className="flex flex-wrap gap-3">
                {SHIRT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setSelectedColor(c)}
                    className={`color-swatch ${
                      selectedColor.hex === c.hex ? "active" : ""
                    }`}
                    style={{ background: c.hex }}
                    title={c.name}
                    aria-label={`Color ${c.name}`}
                  />
                ))}
              </div>
              <p
                className="text-xs mt-3 font-heading uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Seleccionado:{" "}
                <span style={{ color: "var(--accent-gold)" }}>
                  {selectedColor.name}
                </span>
              </p>
            </div>

            {/* Size & quantity */}
            <div className="studio-panel p-6">
              <h2
                className="text-sm font-heading font-bold uppercase tracking-widest mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Talle y cantidad
              </h2>

              {/* Sizes */}
              <div className="flex flex-wrap gap-2 mb-6">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className="w-10 h-10 text-xs font-heading font-bold uppercase transition-all"
                    style={{
                      background:
                        selectedSize === s
                          ? "var(--accent-gold)"
                          : "var(--bg-elevated)",
                      color:
                        selectedSize === s
                          ? "var(--bg-primary)"
                          : "var(--text-muted)",
                      border:
                        selectedSize === s
                          ? "1px solid var(--accent-gold)"
                          : "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-heading uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cantidad:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <span
                    className="w-8 text-center font-heading font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {quantity}
                  </span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price & add to cart */}
            <div className="studio-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-sm font-heading uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Total
                </span>
                <span
                  className="text-2xl font-heading font-bold"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full justify-center"
                style={{
                  background: addedToCart ? "#4ade80" : undefined,
                }}
              >
                {addedToCart ? (
                  <>
                    <span>¡Agregado al carrito!</span>
                    <Icon name="CheckIcon" size={16} />
                  </>
                ) : (
                  <>
                    <span>Agregar al carrito</span>
                    <Icon name="ShoppingCartIcon" size={16} />
                  </>
                )}
              </button>

              {addedToCart && (
                <button
                  onClick={() => router.push("/cart")}
                  className="btn-secondary w-full justify-center mt-3"
                >
                  <span>Ver carrito</span>
                  <Icon name="ArrowRightIcon" size={16} />
                </button>
              )}

              <p
                className="text-xs text-center mt-3"
                style={{ color: "var(--text-muted)" }}
              >
                Precio por unidad: {formatPrice(BASE_PRICE)} · Envío en 48hs
              </p>
            </div>
          </div>

          {/* Right panel — 3D viewer */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Canvas */}
            <div
              className="studio-panel relative overflow-hidden"
              style={{
                height: "520px",
                background:
                  "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(200,169,110,0.06) 0%, var(--bg-card) 70%)",
              }}
            >
              {/* Canvas */}
              <canvas
                ref={canvasRef}
                className="tshirt-canvas"
                style={{ width: "100%", height: "100%" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {/* Overlay info */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: threeReady ? "#4ade80" : "#f97316" }}
                />
                <span
                  className="text-xs font-heading uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  {threeReady ? "Vista 3D activa" : "Cargando 3D…"}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <span
                  className="text-xs font-heading uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Arrastrá para rotar
                </span>
              </div>

              {/* Color indicator */}
              <div
                className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2"
                style={{
                  background: "rgba(10,10,10,0.8)",
                  border: "1px solid var(--border-subtle)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{
                    background: selectedColor.hex,
                    borderColor: "var(--border-medium)",
                  }}
                />
                <span
                  className="text-xs font-heading uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selectedColor.name}
                </span>
              </div>

              {/* Generating overlay */}
              {isGenerating && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center z-20"
                  style={{ background: "rgba(10,10,10,0.7)", backdropFilter: "blur(4px)" }}
                >
                  <div
                    className="w-16 h-16 flex items-center justify-center mb-4"
                    style={{
                      border: "2px solid var(--accent-gold)",
                      borderRadius: "50%",
                      animation: "spin-slow 2s linear infinite",
                    }}
                  >
                    <Icon
                      name="SparklesIcon"
                      size={28}
                      variant="solid"
                      style={{ color: "var(--accent-gold)" } as React.CSSProperties}
                    />
                  </div>
                  <p
                    className="text-sm font-heading font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Generando diseño…
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    La IA está procesando tu prompt
                  </p>
                </div>
              )}
            </div>

            {/* Rotation preset buttons */}
            <div className="flex gap-3">
              {[
                { label: "Frente", y: 0 },
                { label: "¾ Izq.", y: -0.6 },
                { label: "¾ Der.", y: 0.6 },
                { label: "Perfil", y: Math.PI / 2 },
              ].map((view) => (
                <button
                  key={view.label}
                  onClick={() => setRotation({ x: 0, y: view.y })}
                  className="btn-secondary flex-1 justify-center py-2 text-xs"
                >
                  {view.label}
                </button>
              ))}
            </div>

            {/* Design info */}
            {generatedDesign && (
              <div
                className="p-4 flex items-center gap-4"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <div
                  className="w-12 h-12 overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid var(--border-subtle)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedDesign}
                    alt="Diseño generado por IA"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div
                    className="text-sm font-heading font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {designTitle}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Generado con IA · {selectedColor.name} · Talle {selectedSize}
                  </div>
                </div>
                <div className="ml-auto">
                  <Icon
                    name="CheckBadgeIcon"
                    size={20}
                    variant="solid"
                    style={{ color: "#4ade80" } as React.CSSProperties}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}