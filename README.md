# Ramón Store – AI-Powered T-Shirt Customization Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18%2B-brightgreen)

> **Describí tu idea. Nuestra IA la convierte en diseño único. Visualizalo en 3D y pedí tu remera personalizada.**

Ramón Store es una plataforma full-stack de diseño y comercio de remeras personalizadas que integra generación de imágenes con IA, visualización 3D interactiva y un flujo de compra completo.

## 🎯 Características Principales

### 1. **Studio de Diseño con IA**
- Generación de imágenes usando **Grok Imagine (XAI)**
- Descripción en lenguaje natural de diseños → imágenes listas para serigrafía
- Validación con Zod para prompts y metadata
- Sistema de cuota de 3 generaciones gratis por usuario

### 2. **Visualización 3D Interactiva**
- Renderizado en tiempo real con **Three.js** y **React Three Fiber**
- Modelo de remera 3D con geometría procedural (cuerpo, mangas, cuello)
- Sistema de iluminación realista (key light, rim light, fill light, ambient)
- Soporte para múltiples posiciones de estampado:
  - **Front Center**: Centro del pecho
  - **Front Chest**: Pecho izquierdo (lado del corazón)
  - **Back Center**: Centro de la espalda
- Rotación interactiva con drag & mouse
- Personalización de color de prenda en tiempo real

### 3. **Autenticación Segura**
- Integración con **Firebase Authentication** (Google OAuth)
- Tokens JWT almacenados en cookies httpOnly
- Middleware de protección de rutas (`/design-studio`)
- Sincronización de sesión servidor-cliente

### 4. **Gestión de Carrito**
- Almacenamiento en localStorage con validación Zod
- Esquema tipado (`CartItem`, `OrderItem`)
- Cálculo dinámico de precios ($ 4.500 ARS base)
- Validación exhaustiva antes de checkout

### 5. **Sistema de Órdenes**
- Registro en Firestore con timestamps
- Seguimiento de estado (`pending_payment`, `paid`, `processing`, etc.)
- Incremento de contadores de usuario (totalOrders)
- Datos de envío normalizados

---

## 🛠 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Next.js** | 16.1.6 | Framework full-stack React |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utilidad-first styling |
| **Framer Motion** | 12.36.0 | Animaciones fluidas |
| **React Three Fiber** | 9.5.0 | Abstracción de Three.js |
| **Three.js** | 0.182.0 | Renderizado 3D WebGL |
| **Three-Stdlib** | 2.36.1 | Utilidades (Decal, Environment, etc.) |
| **Valtio** | 2.3.0 | State management reactivo |
| **React Colorful** | 5.6.1 | Color picker |
| **Heroicons** | 2.2.0 | Iconografía |
| **Sonner** | 2.0.7 | Toast notifications |

### Backend & Database
| Tecnología | Propósito |
|-----------|----------|
| **Firebase** | Autenticación, Firestore, Storage |
| **Firebase Admin** | SDKs server-side (rutas API) |
| **Next.js API Routes** | Endpoints RESTful |

### AI & Generación
| Servicio | Propósito |
|----------|----------|
| **XAI (Grok Imagine)** | Generación de imágenes desde prompts |
| **Vercel AI SDK** | Interfaz unificada para modelos IA |

### Validación & Tipado
| Librería | Uso |
|---------|-----|
| **Zod** | Schema validation (CartItem, Order, etc.) |

### DevOps & Build
| Herramienta | Versión |
|-----------|---------|
| **Node.js** | 18+ |
| **npm** | 9+ |
| **ESLint** | Config Next.js + TypeScript |
| **PostCSS** | Procesamiento Tailwind |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── session/route.ts          # JWT session management
│   │   ├── generate-logo/route.ts        # Grok Imagine integration
│   │   └── checkout/route.ts             # Order creation & Firestore
│   ├── design-studio/
│   │   ├── components/
│   │   │   ├── DesignStudioClient.tsx   # Client wrapper
│   │   │   └── DesignStudioInteractive.tsx # Main studio UI
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── customize/
│   ├── layout.tsx                        # Root layout + AuthProvider
│   ├── page.tsx                          # Landing page
│   ├── globals.css                       # CSS variables, Tailwind overrides
│   └── not-found.tsx
│
├── canvas/
│   ├── index.jsx                         # Canvas wrapper
│   ├── Shirt.jsx                         # T-shirt 3D model + Decals
│   ├── CameraRig.jsx                     # Camera positioning logic
│   └── Backdrop.jsx                      # AccumulativeShadows
│
├── components/
│   ├── Header.tsx                        # Navigation + Logo
│   ├── HeaderNav.tsx                     # Protected nav links
│   ├── UserHeaderSection.tsx             # Auth UI (Login/Logout)
│   ├── HeroSection.tsx                   # Landing hero
│   ├── HowItWorks.tsx                    # Features showcase
│   ├── CTABanner.tsx                     # Call-to-action
│   ├── Footer.tsx
│   ├── Tab.jsx                           # Color/Filter tabs
│   ├── ColorPicker.jsx                   # HexColorPicker wrapper
│   ├── CustomButton.jsx                  # Styled button component
│   ├── LogoutButton.tsx                  # Auth action
│   ├── ui/
│   │   └── AppIcon.tsx                   # Heroicons wrapper
│   └── index.js                          # Barrel export
│
├── context/
│   └── AuthContext.tsx                   # Firebase auth state + session sync
│
├── hooks/
│   ├── useAuthActions.ts                 # Login/logout logic
│   └── useProtectedNavigation.ts         # Auth-gated navigation
│
├── lib/
│   ├── firebase.ts                       # Firebase config & exports
│   └── user-service.ts                   # Firestore user record sync
│
├── schema/
│   ├── ICartItemSchema.ts                # Zod: CartItem
│   └── IOrderSchema.ts                   # Zod: Order, OrderItem, Shipping
│
├── config/
│   ├── constants.js                      # Editor/Filter tabs, DecalTypes
│   ├── helpers.js                        # Canvas download, color contrast
│   ├── motion.js                         # Framer Motion presets
│   └── config.js                         # Backend URL (dev/prod)
│
├── store/
│   └── index.js                          # Valtio proxy state (shirt color, scale, etc.)
│
├── middleware.ts                         # Route protection (token check)
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.js (implicit)
└── package.json
```

---

## 🔐 Autenticación & Seguridad

### Flujo de Autenticación
1. Usuario hace clic en "Iniciar sesión" → `signInWithPopup(auth, GoogleAuthProvider)`
2. Firebase emite `idToken`
3. Frontend envía token a `/api/auth/session` (POST)
4. Backend valida y almacena en cookie httpOnly:
   ```typescript
   cookieStore.set({
     name: "token",
     value: idToken,
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     maxAge: 5 * 24 * 60 * 60 * 1000 // 5 días
   });
   ```
5. Middleware verifica cookie en rutas protegidas
6. Si no hay sesión en `/design-studio` → redirige a `/`

### Protección de Rutas
- **Middleware** (`src/middleware.ts`): Valida `token` cookie en rutas `/design-studio`
- **useProtectedNavigation**: Hook que dispara login automático si usuario no autenticado intenta navegar a ruta protegida
- **AuthProvider**: Sincroniza estado de Firebase en real-time

---

## 🎨 Sistema de Diseño 3D

### Modelo de Remera
La remera se construye proceduralmente en Three.js:

```typescript
// Geometría del cuerpo (BoxGeometry con deformaciones)
const bodyGeo = new THREE.BoxGeometry(1.5, 1.8, 0.1, 10, 12, 2);
// → Deformación procedural del cuello (tapering)

// Mangas (geometría con deformación de caída)
const sleeveGeo = new THREE.BoxGeometry(0.6, 0.5, 0.09, 5, 5, 1);
// → Y deformación según eje X

// Cuello (TorusGeometry)
const collarGeo = new THREE.TorusGeometry(0.24, 0.045, 8, 28, Math.PI);

// Plano de diseño (Decal)
// Posición dinámica según logoPosition
```

### Iluminación Tri-Punto
```typescript
const ambient = new THREE.AmbientLight(0xfff8f0, 0.7);  // Luz ambiental cálida
const key = new THREE.DirectionalLight(0xfff8f0, 1.4); // Key light principal
const rim = new THREE.DirectionalLight(0xc8a96e, 1.0); // Rim light dorado
const fill = new THREE.DirectionalLight(0x8090ff, 0.4); // Fill light azulado
```

### Sistema de Decals
Usa `@react-three/drei` para mapear imágenes en la remera:
- **Material**: `MeshBasicMaterial` con transparencia
- **Posiciones**: `LOGO_LOCATIONS` predefinidas
- **Anisotropía**: 16x para detalles nítidos
- **depthTest/Write**: Control de renderizado

---

## 🛒 Flujo de Compra

### 1. Generación de Diseño
```
Usuario → Escribe prompt → handleGenerate() 
→ /api/generate-logo (XAI) 
→ Imagen → updateDesignTexture() 
→ Canvas actualizado
```

**Validación:**
- Prompt mínimo 3 caracteres (en Zod)
- Cuota de 3 generaciones gratis
- Modelo: `grok-imagine-image`

### 2. Carrito Local
```typescript
const cartItem = {
  id: string,
  prompt: string,           // Descripción del diseño
  color: string,            // Hex del color (#000000)
  colorName: string,        // "Negro"
  size: "M" | "L" | "XL"   // Talle seleccionado
  quantity: number,         // Cantidad
  price: number,            // Base: 4.500 ARS
  designDataUrl: string     // URL de imagen generada
};

// Validación con Zod antes de guardar
cartItemSchema.safeParse(item);
// Almacenamiento en localStorage["teeforge-cart"]
```

### 3. Checkout
**Endpoint:** `POST /api/checkout`

**Input (Zod):**
```typescript
{
  userId: string,
  items: CartItem[],
  shipping: {
    fullName: string,
    address: string,
    city: string,
    zipCode: string,
    phone: string
  },
  total: number
}
```

**Output:**
```json
{
  "success": true,
  "orderId": "abc123",
  "message": "Orden creada exitosamente"
}
```

**Firestore:**
- Colección `orders` (documento raíz)
- Incremento de `users/{uid}/totalOrders`
- Timestamp de `lastOrderAt`

---

## 🚀 Setup & Desarrollo

### Requisitos
- Node.js 18+
- npm 9+ o yarn/pnpm
- Variables de entorno Firebase + XAI

### Instalación
```bash
# Clonar y navegar
git clone <repo>
cd my-eccomerce

# Instalar dependencias
npm install

# Variables de entorno (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=***
NEXT_PUBLIC_FIREBASE_PROJECT_ID=***
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=***
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
NEXT_PUBLIC_FIREBASE_APP_ID=***
XAI_API_KEY=***
```

### Desarrollo
```bash
npm run dev
# http://localhost:3000
```

### Build & Deploy
```bash
npm run build
npm start

# O en Vercel:
# Conectar repo → Auto-deploy en cada push
```

---

## 📊 Almacenamiento de Datos

### Firestore Schema

#### `users/{uid}`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  freeGenerationsUsed: number,     // 0-3
  totalOrders: number,              // Contador
  lastLogin: Timestamp,
  lastGenerationAt: Timestamp,
  lastOrderAt: Timestamp,
  createdAt: Timestamp
}
```

#### `users/{uid}/designs/{designId}` (Subcolección)
```typescript
{
  prompt: string,
  imageUrl: string,                // Base64 o data URL
  model: "grok-imagine-image",
  isFavorite: boolean,
  createdAt: Timestamp
}
```

#### `orders/{orderId}`
```typescript
{
  userId: string,
  items: OrderItem[],
  shipping: ShippingData,
  total: number,
  status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered",
  createdAt: Timestamp
}
```

---

## 🎯 Flujos Clave

### Protección de Rutas
```
Usuario sin sesión intenta acceder a /design-studio
  ↓
Middleware.ts detecta ausencia de cookie "token"
  ↓
Redirige a "/" (home)
  ↓
useProtectedNavigation dispara loginWithGoogle()
  ↓
Token se guarda en cookie httpOnly
  ↓
router.push("/design-studio")
```

### Actualización de Diseño 3D
```
updateDesignTexture(imageUrl)
  ↓
Crear canvas invisible (512x512)
  ↓
Cargar imagen con CORS
  ↓
Dibujar en canvas
  ↓
THREE.CanvasTexture
  ↓
Asignar a designMesh.material.map
  ↓
material.needsUpdate = true
  ↓
Render update automático
```

---

## ⚙️ Configuración Importante

### Tailwind + PostCSS
```javascript
// postcss.config.mjs
{
  plugins: {
    "@tailwindcss/postcss": {}
  }
}
```

### Variables CSS
Definidas en `src/app/globals.css`:
```css
:root {
  --bg-primary: #0b0f19;
  --text-primary: #f9fafb;
  --accent-gold: #c8a96e;
  --border-soft: rgba(255,255,255,0.08);
  /* ... más */
}
```

### Next.js Config
```typescript
// next.config.ts
{
  reactStrictMode: false,  // Shader compilation issues
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    remotePatterns: [/* ... */]
  }
}
```

---

## 📈 Roadmap & Mejoras Futuras

- [ ] Integración con Mercado Pago para pagos
- [ ] Dashboard de usuario (historial de diseños)
- [ ] Social sharing de diseños (Instagram, WhatsApp)
- [ ] Variantes de prenda (hoodies, bolsas, gorras)
- [ ] Editor de diseño avanzado (capas, filtros)
- [ ] Recomendaciones basadas en IA
- [ ] Multi-idioma (EN/ES)
- [ ] Dark mode toggle

---

## 🔗 Links & Recursos

| Recurso | URL |
|---------|-----|
| Next.js Docs | https://nextjs.org/docs |
| Firebase Docs | https://firebase.google.com/docs |
| Three.js Documentation | https://threejs.org/docs |
| Zod | https://zod.dev |
| React Three Fiber | https://docs.pmnd.rs/react-three-fiber |
| Tailwind CSS | https://tailwindcss.com |
| Framer Motion | https://www.framer.com/motion |

---

## 📝 Licencia

MIT © Ramón Store 2024

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repo
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Hecho con ❤️ para creadores que aman el diseño y la tecnología.**
