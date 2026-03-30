# Ramón Store – AI-Powered T-Shirt Customization Platform

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18%2B-brightgreen)

> **Describí tu idea. Nuestra IA la convierte en diseño único. Visualizalo en 3D y pedí tu remera personalizada.**

Ramón Store es una plataforma full-stack de diseño y comercio de remeras personalizadas que integra generación de imágenes con IA, visualización 3D interactiva, carrito de compra robusto, y procesamiento de pagos con Mercado Pago.

## 🎯 Características Principales

### 1. **Studio de Diseño con IA**
- Generación de imágenes usando **Grok Imagine (XAI)**
- Descripción en lenguaje natural de diseños → imágenes listas para serigrafía
- Validación con Zod para prompts y metadata
- Sistema de cuota de 3 generaciones gratis por usuario
- Almacenamiento de diseños en subcolección Firestore (`users/{uid}/designs`)

### 2. **Visualización 3D Interactiva**
- Renderizado en tiempo real con **Three.js** y **React Three Fiber**
- Modelo de remera 3D con geometría procedural (cuerpo, mangas, cuello)
- Sistema de iluminación realista (key light, rim light, fill light, ambient)
- **Soporte para múltiples posiciones de estampado:**
  - **Front Center**: Centro del pecho (posición predeterminada)
  - **Front Chest**: Pecho izquierdo (lado del corazón) — más elegante
  - **Back Center**: Centro de la espalda
- Rotación interactiva con drag & mouse (inercia realista)
- Personalización de color de prenda en tiempo real
- Auto-rotación en página de inicio

### 3. **Autenticación Segura**
- Integración con **Firebase Authentication** (Google OAuth)
- Tokens JWT almacenados en cookies httpOnly
- Middleware de protección de rutas (`/design-studio`, `/cart`)
- Sincronización bidireccional sesión servidor-cliente
- Validación de sesión en cada request a rutas protegidas

### 4. **Carrito de Compra Robusto**
- **Componentes refactorizado en 5 piezas enfocadas:**
  - `CartInteractive.tsx` — Orquestador de estado y lógica
  - `CartHeader.tsx` — Indicador de progreso multi-step
  - `CartStep.tsx` — Visualización y gestión de items
  - `CheckoutStep.tsx` — Formulario de datos + resumen
  - `SuccessStep.tsx` / `FailureStep.tsx` / `PendingStep.tsx` — Estados finales
- Almacenamiento en localStorage con validación Zod completa
- Esquema tipado (`CartItem`, `OrderItem`)
- Cálculo dinámico de precios (USD $5 base por remera)
- Envío gratis para compras > USD $40 (antes $8.000 ARS)
- Validación exhaustiva antes de checkout

### 5. **Sistema de Órdenes con Mercado Pago**
- Registro en Firestore con timestamps de servidor
- Seguimiento de estado completo:
  - `pending_payment` → `paid` → `processing` → `shipped` → `delivered`
  - Estados alternos: `failed`, `cancelled`, `refunded`
- Incremento de contadores de usuario (`totalOrders`)
- Datos de envío normalizados (provincia, código postal, dirección)
- Webhook de Mercado Pago para actualizar estado en tiempo real
- URLs de retorno (success, failure, pending)

### 6. **Validación Exhaustiva**
- **Zod Schemas** para:
  - `CartItem` — Items en carrito con posición de logo
  - `OrderItem` — Items confirmados en orden
  - `ShippingData` — Dirección y contacto
  - `CreateOrderSchema` — Validación de orden completa antes de pago

---

## 🛠 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Next.js** | 16.1.6 | Framework full-stack React con SSR |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type safety estricto |
| **Tailwind CSS** | 4.x | Utilidad-first styling |
| **Framer Motion** | 12.36.0 | Animaciones fluidas y transiciones |
| **React Three Fiber** | 9.5.0 | Abstracción React de Three.js |
| **Three.js** | 0.182.0 | Renderizado 3D WebGL |
| **Three-Stdlib** | 2.36.1 | Utilidades (Decal, Environment, Shadows) |
| **Valtio** | 2.3.0 | State management reactivo |
| **Zustand** | 5.0.12 | State management para carrito |
| **React Colorful** | 5.6.1 | Color picker minimalista |
| **Heroicons** | 2.2.0 | Iconografía SVG |
| **Sonner** | 2.0.7 | Toast notifications elegantes |

### Backend & Database
| Tecnología | Propósito |
|-----------|----------|
| **Firebase** | Autenticación, Firestore, Storage |
| **Firebase Admin** | SDKs server-side para rutas API |
| **Next.js API Routes** | Endpoints RESTful serverless |
| **Mercado Pago SDK** | Integración de pagos |

### AI & Generación
| Servicio | Propósito |
|----------|----------|
| **XAI (Grok Imagine)** | Generación de imágenes desde prompts naturales |
| **Vercel AI SDK** | Interfaz unificada para llamadas a modelos |

### Validación & Tipado
| Librería | Uso |
|---------|-----|
| **Zod** | Schema validation robusto para datos críticos |

### DevOps & Build
| Herramienta | Versión |
|-----------|---------|
| **Node.js** | 18+ |
| **npm** | 9+ |
| **ESLint** | Config Next.js + TypeScript |
| **PostCSS** | Procesamiento Tailwind |
| **TypeScript Compiler** | Target ES2017 |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── session/route.ts          # JWT session + cookie httpOnly (POST/DELETE)
│   │   ├── generate-logo/route.ts        # Grok Imagine + Firestore designs
│   │   ├── checkout/route.ts             # Crea orden + Mercado Pago preference
│   │   └── mercado-pago/
│   │       └── webhook/route.ts          # Webhook IPN para actualizaciones de pago
│   ├── design-studio/
│   │   ├── components/
│   │   │   ├── DesignStudioClient.tsx   # Client wrapper
│   │   │   └── DesignStudioInteractive.tsx # Studio principal con canvas
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartInteractive.tsx       # Orquestador de estado
│   │   │   ├── CartHeader.tsx            # Indicador multi-step
│   │   │   ├── CartStep.tsx              # Lista de items
│   │   │   ├── CheckoutStep.tsx          # Formulario de datos
│   │   │   ├── SuccessStep.tsx           # Confirmación ✓
│   │   │   ├── FailureStep.tsx           # Error ✗
│   │   │   └── PendingStep.tsx           # Procesando ⏳
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── customize/
│   ├── layout.tsx                        # Root layout + AuthProvider
│   ├── page.tsx                          # Landing page
│   ├── globals.css                       # CSS variables, glassmorphism, Tailwind
│   └── not-found.tsx
│
├── canvas/
│   ├── index.jsx                         # Canvas wrapper + Environment
│   ├── Shirt.jsx                         # T-shirt 3D + Decals + interactividad
│   ├── CameraRig.jsx                     # Camera positioning + pointer tracking
│   ├── Backdrop.jsx                      # AccumulativeShadows + RandomizedLight
│
├── components/
│   ├── Header.tsx                        # Navigation + Logo
│   ├── HeaderNav.tsx                     # Protected nav links
│   ├── UserHeaderSection.tsx             # Auth UI (Login/Dropdown/Logout)
│   ├── HeroSection.tsx                   # Landing hero con canvas 3D
│   ├── HowItWorks.tsx                    # Features showcase (3 pasos)
│   ├── CTABanner.tsx                     # Call-to-action final
│   ├── CTABannerButton.tsx               # Botón protegido hacia studio
│   ├── Footer.tsx
│   ├── Tab.jsx                           # Color/Filter tabs
│   ├── ColorPicker.jsx                   # HexColorPicker wrapper
│   ├── CustomButton.jsx                  # Styled button component
│   ├── LogoutButton.tsx                  # Auth action
│   ├── ui/
│   │   └── AppIcon.tsx                   # Heroicons wrapper dinámico
│   └── index.js                          # Barrel export
│
├── context/
│   └── AuthContext.tsx                   # Firebase auth state + session sync
│
├── hooks/
│   ├── useAuthActions.ts                 # Login/logout con Google OAuth
│   └── useProtectedNavigation.ts         # Auth-gated navigation hook
│
├── lib/
│   ├── firebase.ts                       # Firebase config + client exports
│   ├── firebase-admin.ts                 # Firebase Admin para server
│   ├── user-service.ts                   # Firestore user record sync
│   └── mercado-pago.ts                   # MP client config + tipos
│
├── schema/
│   ├── ICartItemSchema.ts                # Zod: CartItem, LogoPosition, ShirtSize
│   └── IOrderSchema.ts                   # Zod: Order, OrderItem, ShippingData
│
├── config/
│   ├── constants.js                      # Editor/Filter tabs, DecalTypes
│   ├── helpers.js                        # Canvas download, color contrast
│   ├── motion.js                         # Framer Motion presets
│   └── config.js                         # Backend URL (dev/prod)
│
├── store/
│   ├── index.js                          # Valtio proxy (shirt color, scale)
│   └── useCartStore.ts                   # Zustand para carrito (legacy/fallback)
│
├── middleware.ts                         # Route protection (token check)
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.js (implícito)
├── package.json
└── .gitignore
```

---

## 🔐 Autenticación & Seguridad

### Flujo Completo de Autenticación

```
1. Usuario hace clic en "Iniciar sesión"
   ↓
2. UserHeaderSection → signInWithPopup(auth, GoogleAuthProvider)
   ↓
3. Firebase emite idToken (JWT)
   ↓
4. Frontend envía POST /api/auth/session con { idToken }
   ↓
5. Backend crea cookie httpOnly:
   - maxAge: 5 días
   - secure: true (producción)
   - sameSite: lax
   - httpOnly: true (no accesible desde JS)
   ↓
6. Middleware verifica token en rutas protegidas
   ↓
7. AuthProvider mantiene estado sincronizado en real-time
```

### Protección de Rutas
- **Middleware** (`src/middleware.ts`): Valida `token` cookie en `/design-studio` y `/cart`
  - Si no hay sesión → redirige a `/`
- **useProtectedNavigation**: Hook que dispara login automático en navegación protegida
  - Si usuario no autenticado intenta ir a `/design-studio` → popup Google → redirect
- **AuthProvider**: Escucha cambios de Firebase en tiempo real
  - Sincroniza sesión servidor-cliente
  - Invalida cookie al logout

### Seguridad de Datos
- Passwords nunca se almacenan (Google OAuth)
- Tokens con expiración automática
- Session sync evita token hijacking
- Firestore rules (modelo de seguridad configurable)

---

## 🛒 Sistema de Carrito & Checkout

### Arquitectura del Carrito (Refactorizado)

El carrito fue dividido en 5 componentes con responsabilidades claras:

#### **1. CartInteractive.tsx** (Orquestador)
- Gestión de estado centralizada
- Manejo de eventos (agregar, quitar, actualizar cantidad)
- Lógica de validación de formulario
- Transiciones entre pasos (cart → checkout → success/failure/pending)
- Sincronización con localStorage
- Detección de parámetros de URL (para regresar de Mercado Pago)

#### **2. CartHeader.tsx** (Indicador de Progreso)
```
Carrito → Datos → Confirmado
  ✓        ✓        ✓
```
- Visualiza el step actual
- Badges dinámicos según estado
- Responsive (oculta labels en mobile)

#### **3. CartStep.tsx** (Visualización de Items)
- Lista de items con:
  - Thumbnail de diseño
  - Descripción (prompt truncado)
  - Tags (talle, color)
  - Controles de cantidad (±)
  - Precio individual y total
- Empty state con CTA
- Acciones: agregar más diseños, vaciar carrito

#### **4. CheckoutStep.tsx** (Formulario)
- Tres secciones:
  1. **Datos personales**: Nombre, email, teléfono
  2. **Dirección de envío**: Calle, ciudad, provincia, código postal
  3. **Resumen de pedido**: Subtotal, envío, total
- Validación en tiempo real con Zod
- Mensajes de error inline
- Provincias argentinas predefinidas
- Botones: "Volver" y "Confirmar Pago"

#### **5. Success/Failure/Pending Steps**
Pantallas de estados finales post-pago:
- **Success**: Confirmación, número de orden, email de notificación
- **Failure**: Opción para reintentar, carrito intacto
- **Pending**: Qué está pasando (validación → procesamiento → confirmación)

### Flujo de Compra Completo

```
1. LISTA DE ITEMS (CartStep)
   - Ver diseños en carrito
   - Ajustar cantidad/color/talle
   - Ver precios en tiempo real

2. CHECKOUT (CheckoutStep)
   - Completar datos personales
   - Ingresar dirección de envío
   - Validar formulario
   - Mostrar resumen

3. PAGO (CartInteractive → /api/checkout)
   - POST /api/checkout con orden completa
   - Backend crea orden en Firestore
   - Backend genera preference en Mercado Pago
   - Frontend redirige a checkout.mp.com

4. MERCADO PAGO (Externo)
   - Usuario completa pago
   - MP redirige a back_url (success/failure/pending)

5. RESULTADO (Success/Failure/PendingStep)
   - Muestra estado con detalles
   - Opciones de siguiente paso

6. WEBHOOK (MP → /api/mercado-pago/webhook)
   - MP notifica cambios de estado
   - Backend actualiza orden en Firestore
```

### Almacenamiento en localStorage

```javascript
// Clave: "teeforge-cart"
{
  items: [
    {
      id: "timestamp-random",
      prompt: "Lobo geométrico",
      colorHex: "#000000",
      colorName: "Negro",
      size: "M",
      quantity: 1,
      priceUnit: 5,
      designUrl: "https://...",
      position: "front_center"
    }
  ]
}
```

---

## 💳 Integración con Mercado Pago

### Flujo de Pagos

```
1. Usuario completa checkout
   ↓
2. POST /api/checkout con OrderPayload
   ↓
3. Backend:
   a) Valida datos con Zod
   b) Crea transacción Firestore (orden + incrementa usuario)
   c) Prepara items para MP (nombre, precio, cantidad)
   d) Si hay envío, agrega como item
   e) Crea Preference en MP API
   ↓
4. MP retorna: init_point (URL del checkout)
   ↓
5. Frontend redirige a init_point
   ↓
6. Usuario paga en MP
   ↓
7. MP redirige a:
   - /cart?status=success
   - /cart?status=failure
   - /cart?status=pending
   ↓
8. Frontend detecta parámetro y muestra estado
   ↓
9. MP envía webhook a /api/mercado-pago/webhook
   ↓
10. Backend actualiza orden en Firestore (status, mpPaymentId)
```

### Configuración de Mercado Pago

```typescript
// Preference Items
{
  id: string,                    // ID del item
  title: "Remera Ramon Store - Talle M",
  description: "Color: Negro",
  picture_url: "https://...",    // Miniatura del diseño
  unit_price: 5,                 // USD
  quantity: 1,
  currency_id: "ARS"             // Puede ser ARS o USD
}

// Payer Data
{
  name: "Valentina Moreno",
  email: "val@mail.com",
  phone: { area_code: "11", number: "12345678" },
  address: {
    street_name: "Av. Corrientes",
    street_number: 1234,
    zip_code: "1414"
  }
}
```

### Webhook de Mercado Pago

```
POST /api/mercado-pago/webhook?action=payment.updated&data.id=PAY123
```

**Procesa:**
- Obtiene detalles del pago desde MP API
- Mapea status de MP a status de orden:
  - `approved` → `paid`
  - `pending` → `pending`
  - `rejected` → `failed`
- Actualiza orden en Firestore
- Incrementa contador de usuario si es `approved`

---

## 🎨 Sistema de Diseño 3D

### Modelo de Remera

La remera se construye proceduralmente en Three.js usando geometrías primitivas:

```typescript
// Cuerpo (BoxGeometry deformada)
const bodyGeo = new THREE.BoxGeometry(1.5, 1.8, 0.1, 10, 12, 2);
// → Aplicar vertex shader para tapering en cuello

// Mangas (BoxGeometry)
const sleeveGeo = new THREE.BoxGeometry(0.6, 0.5, 0.09, 5, 5, 1);
// → Deformación de caída

// Cuello (TorusGeometry)
const collarGeo = new THREE.TorusGeometry(0.24, 0.045, 8, 28, Math.PI);

// Decal (Texture mapeada)
// Material: MeshBasicMaterial con transparencia
```

### Iluminación Tri-Punto

```typescript
// Ambient light (luz ambiente)
const ambient = new THREE.AmbientLight(0xfff8f0, 0.7);

// Key light (principal)
const key = new THREE.DirectionalLight(0xfff8f0, 1.4);
key.position.set(5, 5, 5);

// Rim light (dorado)
const rim = new THREE.DirectionalLight(0xc8a96e, 1.0);
rim.position.set(-5, 5, -10);

// Fill light (azulado)
const fill = new THREE.DirectionalLight(0x8090ff, 0.4);
fill.position.set(-5, -5, 5);
```

### Sistema de Decals

Usa `@react-three/drei` para mapear imágenes en la remera:

```typescript
// Posiciones predefinidas
const LOGO_LOCATIONS = {
  front_center: {
    position: [0, 0.04, 0.15],
    rotation: [0, 0, 0],
    scale: 0.25
  },
  front_chest: {
    position: [0.1, 0.08, 0.125],
    rotation: [0, 0, 0],
    scale: 0.14
  },
  back_center: {
    position: [0, 0.1, -0.16],
    rotation: [0, Math.PI, 0],
    scale: 0.23
  }
};

// Render
<Decal
  position={config.position}
  rotation={config.rotation}
  scale={config.scale}
  map={logoTexture}
  anisotropy={16}
  depthTest={true}
  depthWrite={false}
/>
```

### Interactividad

- **Drag & Rotate**: Captura `pointerdown/move/up` para rotación suave
- **Inercia**: Momentum decae naturalmente (damping = 0.92)
- **Auto-rotate**: En landing page (parámetro `autoRotate`)
- **Color en tiempo real**: `easing.dampC()` interpola color del estado Valtio

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
  freeGenerationsUsed: number,     // 0-3 (cuota de IA)
  totalOrders: number,              // Contador de órdenes
  lastLogin: Timestamp,
  lastGenerationAt: Timestamp,
  lastOrderAt: Timestamp,
  createdAt: Timestamp
}
```

#### `users/{uid}/designs/{designId}` (Subcolección)
```typescript
{
  prompt: string,                    // "Lobo geométrico con luna"
  imageUrl: string,                  // Base64 o data URL
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
  total: number,                     // USD
  status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "failed" | "cancelled",
  mpPaymentId: string,               // ID del pago en MP
  mpPaymentStatus: string,           // "approved", "rejected", etc.
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🚀 Setup & Desarrollo

### Requisitos
- Node.js 18+
- npm 9+ o yarn/pnpm
- Variables de entorno Firebase + XAI + Mercado Pago

### Instalación

```bash
# Clonar y navegar
git clone https://github.com/cordobacesar29/my-commerce.git
cd my-commerce

# Instalar dependencias
npm install

# Crear .env.local con variables
```

### Variables de Entorno

```env
# Firebase Client (público)
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=***
NEXT_PUBLIC_FIREBASE_PROJECT_ID=***
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=***
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
NEXT_PUBLIC_FIREBASE_APP_ID=***

# Firebase Admin (servidor)
FIREBASE_SERVICE_ACCOUNT_KEY=*** (JSON stringificado)

# XAI (Grok Imagine)
XAI_API_KEY=***

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=***
WEBHOOK_SECRET=*** (opcional, para validación de firma)

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Desarrollo Local

```bash
# Iniciar dev server
npm run dev
# http://localhost:3000

# Lint
npm run lint

# Build
npm run build

# Start production
npm start
```

### Deploy en Vercel

```bash
# Conectar repositorio a Vercel
# Auto-deploy en cada push a main
# Variables de entorno configuradas en Dashboard
```

---

## 📈 Cambios Recientes (v0.2.0)

### ✨ Nuevas Funcionalidades

1. **Carrito Refactorizado** (5 componentes enfocados)
   - CartInteractive, CartHeader, CartStep, CheckoutStep, Success/Failure/Pending Steps
   - Estado centralizado, lógica separada, UI limpia

2. **Sistema Completo de Pagos con Mercado Pago**
   - Integración de Preference API
   - Webhook para actualizar estado de órdenes
   - URLs de retorno (success, failure, pending)

3. **Validación Exhaustiva con Zod**
   - Schemas: CartItem, OrderItem, ShippingData, CreateOrderSchema
   - Validación en frontend y backend
   - Mensajes de error específicos

4. **Múltiples Posiciones de Logo**
   - Front Center (predeterminado)
   - Front Chest (pecho izquierdo, elegante)
   - Back Center (espalda)
   - Selector interactivo en studio

5. **Flujo Multi-Step Mejorado**
   - Indicador de progreso (Carrito → Datos → Confirmado)
   - Transiciones suaves con Framer Motion
   - Estados finales claros (Success/Failure/Pending)

6. **Webhook de Mercado Pago**
   - Actualización automática de estado
   - Sincronización servidor-cliente
   - Manejo de errores robusto

### 🔧 Mejoras Técnicas

- Base de precios uniforme en USD (antes era ARS)
- Envío gratis para compras > USD $40
- Sincronización automática de usuario en Firestore
- Mensajes de toast (Sonner) para feedback de usuario
- Componentes reutilizables y bien tipados

---

## 🎯 Flujos Clave

### Crear un Diseño y Comprar

```
1. Usuario accede a /design-studio
   ↓
2. Middleware verifica token
   ↓
3. DesignStudioInteractive carga
   ↓
4. Usuario describe idea en textarea
   ↓
5. Click "Generar Diseño" → POST /api/generate-logo
   ↓
6. Grok Imagine genera imagen
   ↓
7. Imagen aparece en canvas 3D
   ↓
8. Usuario ajusta: color, talle, cantidad, posición de logo
   ↓
9. Click "Añadir al Carrito"
   ↓
10. Item se guarda en localStorage ("teeforge-cart")
    ↓
11. User navega a /cart
    ↓
12. CartInteractive carga items
    ↓
13. Usuario revisa carrito → Continuar al pago
    ↓
14. Completa CheckoutStep (datos + dirección)
    ↓
15. POST /api/checkout
    ↓
16. Backend crea orden + Mercado Pago preference
    ↓
17. Frontend redirige a init_point (MP checkout)
    ↓
18. Usuario paga en MP
    ↓
19. MP redirige a /cart?status=success (u otro)
    ↓
20. SuccessStep muestra confirmación
    ↓
21. Webhook de MP actualiza estado en Firestore
```

### Protección de Rutas

```
Usuario sin sesión intenta acceder a /design-studio
  ↓
Middleware detecta ausencia de cookie "token"
  ↓
Redirige a "/" (home)
  ↓
User hace click en "Crear Diseño"
  ↓
useProtectedNavigation dispara loginWithGoogle()
  ↓
Popup de Google OAuth
  ↓
Firebase emite idToken
  ↓
POST /api/auth/session crea cookie httpOnly
  ↓
router.push("/design-studio")
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

### Variables CSS (Glassmorphism)
Definidas en `src/app/globals.css`:
```css
:root {
  --bg-primary: #0b0f19;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --accent-gold: #c8a96e;
  --accent-glow: rgba(200,169,110,0.18);
  --border-soft: rgba(255,255,255,0.08);
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  backdrop-filter: blur(14px);
  border: 1px solid var(--border-soft);
}
```

### Next.js Config
```typescript
// next.config.ts
{
  reactStrictMode: false,  // Evitar issues con compilación de shaders
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    remotePatterns: [...]
  }
}
```

---

## 📈 Roadmap & Mejoras Futuras

- [ ] Dashboard de usuario (historial de diseños, órdenes pasadas)
- [ ] Social sharing de diseños (Instagram, WhatsApp)
- [ ] Variantes de prenda (hoodies, bolsas, gorras, calcetines)
- [ ] Editor de diseño avanzado (capas, filtros, texto)
- [ ] Recomendaciones basadas en IA
- [ ] Multi-idioma (EN/ES)
- [ ] Dark mode toggle (actualmente solo dark)
- [ ] Sistema de reseñas y testimonios
- [ ] Programa de afiliados
- [ ] Descuentos por cantidad
- [ ] Integración con otras billeteras digitales

---

## 🔗 Links & Recursos

| Recurso | URL |
|---------|-----|
| Next.js Docs | https://nextjs.org/docs |
| Firebase Docs | https://firebase.google.com/docs |
| Three.js Documentation | https://threejs.org/docs |
| Mercado Pago API | https://www.mercadopago.com.ar/developers |
| Zod | https://zod.dev |
| React Three Fiber | https://docs.pmnd.rs/react-three-fiber |
| Tailwind CSS | https://tailwindcss.com |
| Framer Motion | https://www.framer.com/motion |
| Sonner | https://sonner.emilkowal.ski |

---

## 🏗️ Arquitectura de Componentes

### Patrones Utilizados

- **Container/Presentational**: CartInteractive (container) vs CartStep (presentational)
- **Composition**: Success/Failure/Pending como variantes de estado final
- **Hooks**: useAuth, useProtectedNavigation, useAuthActions para lógica reutilizable
- **Context API**: AuthContext para estado global de sesión
- **Zod Schemas**: Validación tipada de datos críticos

### Performance Optimization

- `dynamic()` con `ssr: false` para Three.js (canvas)
- Componentes lazy-loaded en rutas
- `memo()` para componentes que se renderean frecuentemente
- Debounce en inputs de formulario (Zod valida en tiempo real)
- `easing.damp*()` en lugar de `setInterval()` para animaciones

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

---

## Historial de Cambios

### v0.2.0 (Actual)
- ✅ Carrito refactorizado (5 componentes)
- ✅ Integración Mercado Pago completa
- ✅ Webhook IPN para pagos
- ✅ Multi-step checkout mejorado
- ✅ Validación exhaustiva con Zod
- ✅ Múltiples posiciones de logo
- ✅ Estados de pago (success/failure/pending)

### v0.1.0
- Generación de diseños con IA (Grok)
- Visualización 3D interactiva
- Autenticación Firebase
- Carrito básico
- Estructura del proyecto