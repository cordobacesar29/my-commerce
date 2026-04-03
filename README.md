# Ramón Store – AI-Powered T-Shirt Customization Platform

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-19.2.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
[![Invitame un café en cafecito.app](https://cdn.cafecito.app/imgs/buttons/button_1.svg)](https://cafecito.app/ramon-store)

> **Describí tu idea. Nuestra IA la convierte en diseño único. Visualizalo en 3D y pedí tu remera personalizada.**

Ramón Store es una plataforma full-stack de diseño y comercio de remeras personalizadas que integra generación de imágenes con IA, visualización 3D interactiva en tiempo real, carrito de compra robusto, y procesamiento de pagos con Mercado Pago.

---

## 🎯 Características Principales

### 1. **Studio de Diseño con IA**
- 🤖 Generación de imágenes usando **Grok Imagine (XAI)**
- 💬 Descripción en lenguaje natural → imágenes listas para serigrafía
- ✅ Validación exhaustiva con Zod para prompts y metadata
- 📊 Sistema de cuota de 3 generaciones gratis por usuario
- 💾 Almacenamiento de diseños en subcolección Firestore (`users/{uid}/designs`)
- 🎨 Vistas previas en tiempo real con canvas 3D interactivo

### 2. **Visualización 3D Interactiva (Three.js + React Three Fiber)**
- 🎬 Renderizado en tiempo real con iluminación tri-punto realista
- 👕 Modelo de remera 3D procedural con cuerpo, mangas y cuello
- 🔄 Rotación interactiva con drag & mouse (inercia realista)
- 🎨 Personalización de color de prenda en tiempo real con `easing.dampC()`
- 🖼️ **Sistema multi-posición de logo:**
  - **Front Center** (predeterminado) — Centro del pecho
  - **Front Chest** — Pecho izquierdo (lado del corazón, elegante)
  - **Back Center** — Centro de la espalda
- 🔃 Auto-rotación en página de inicio
- 📱 Responsive y optimizado para mobile

### 3. **Autenticación Segura con Firebase**
- 🔐 Integración con Firebase Authentication (Google OAuth)
- 🍪 Tokens JWT en cookies httpOnly (5 días)
- 🛡️ Middleware de protección de rutas (`/design-studio`, `/cart`)
- 🔄 Sincronización bidireccional sesión servidor-cliente
- ✔️ Validación de sesión en cada request

### 4. **Carrito de Compra Robusto & Refactorizado**

#### Arquitectura de 5 Componentes Enfocados:

**CartInteractive.tsx** — Orquestador central
- Gestión de estado global con Zustand
- Lógica de validación con Zod
- Detección de parámetros de URL (retorno de Mercado Pago)
- Sincronización con localStorage persistente

**CartHeader.tsx** — Indicador multi-step
```
Carrito (paso 1) → Datos (paso 2) → Confirmado (paso 3)
```
- Badges dinámicos según estado actual
- Responsive (oculta labels en mobile)
- Visual feedback claro del progreso

**CartStep.tsx** — Visualización de items
- Thumbnails de diseños con color swatch
- Descripción (prompt truncado)
- Tags de talle y color
- Controles de cantidad (±)
- Precios individuales y total
- Empty state con CTA
- Acciones: agregar más diseños, vaciar carrito

**CheckoutStep.tsx** — Formulario de datos
- **Sección 1**: Datos personales (nombre, email, teléfono)
- **Sección 2**: Dirección de envío (calle, ciudad, provincia, código postal)
- **Sección 3**: Resumen de pedido (subtotal, envío, total)
- ✅ Validación en tiempo real con Zod
- 📍 Provincias argentinas predefinidas
- 🔴 Mensajes de error inline
- Botones: "Volver al carrito" y "Confirmar pago"

**Success/Failure/Pending Steps**
- **Success** ✓ — Confirmación de compra, número de orden, email de notificación
- **Failure** ✗ — Opción para reintentar, carrito intacto
- **Pending** ⏳ — Timeline de qué está pasando (validación → procesamiento → confirmación)

#### Flujo Completo de Compra:
```
1. Ver items en carrito → Ajustar cantidad/color/talle
                ↓
2. Completar datos personales → Validar dirección
                ↓
3. Confirmar pago → POST /api/checkout
                ↓
4. Backend crea orden + genera Mercado Pago preference
                ↓
5. Redirige a checkout.mercadopago.com
                ↓
6. Usuario paga en MP
                ↓
7. MP redirige a /cart?status=success|failure|pending
                ↓
8. SuccessStep / FailureStep / PendingStep muestra resultado
                ↓
9. Webhook de MP actualiza estado en Firestore (en background)
```

### 5. **Sistema Completo de Pagos con Mercado Pago**
- 💳 Integración de Preference API (checkout hosted)
- 🔔 Webhook IPN para actualizaciones automáticas de pago
- 🔄 URLs de retorno configurables (success, failure, pending)
- 📦 Mapeo automático de items a formato MP
- 📊 Tracking de estado (pending_payment → paid → processing → delivered)
- 🛡️ Validación de datos en servidor (previene manipulación de precios)

### 6. **Validación Exhaustiva con Zod**

Schemas tipados para datos críticos:

```typescript
// CartItem — Items en carrito
interface CartItem {
  id: string
  prompt: string
  colorHex: string
  colorName: string
  size: ShirtSize
  quantity: number
  priceUnit: number
  designUrl: string
  position: LogoPosition
}

// OrderItem — Items confirmados en orden
// ShippingData — Dirección de envío
// CreateOrderSchema — Validación de orden completa

```

---

## 🛠 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Next.js** | 16.1.6 | Framework full-stack React con SSR/SSG |
| **React** | 19.2.3 | UI library moderno |
| **TypeScript** | 5.x | Type safety estricto |
| **Tailwind CSS** | 4.x | Utilidad-first styling con v4 |
| **Framer Motion** | 12.36.0 | Animaciones fluidas y transiciones |
| **React Three Fiber** | 9.5.0 | Abstracción React de Three.js |
| **Three.js** | 0.182.0 | Renderizado 3D WebGL |
| **Zustand** | 5.0.12 | State management para carrito (persistencia) |
| **Valtio** | 2.3.0 | State management reactivo (shirt color/scale) |
| **React Colorful** | 5.6.1 | Color picker minimalista |
| **Heroicons** | 2.2.0 | Iconografía SVG |
| **Sonner** | 2.0.7 | Toast notifications elegantes |
| **Zod** | 4.3.6 | Schema validation robusto |

### Backend & Database
| Tecnología | Propósito |
|-----------|----------|
| **Firebase Auth** | Autenticación OAuth |
| **Firestore** | Base de datos NoSQL escalable |
| **Firebase Admin SDK** | SDKs server-side para API routes |
| **Next.js API Routes** | Endpoints RESTful serverless |
| **Mercado Pago SDK** | Integración de pagos |

### AI & Generación
| Servicio | Propósito |
|----------|----------|
| **XAI Grok Imagine** | Generación de imágenes desde prompts naturales |
| **Vercel AI SDK** | Interfaz unificada para modelos |

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── session/route.ts          # JWT session + httpOnly cookie (POST/DELETE)
│   │   ├── generate-logo/route.ts        # Grok Imagine + Firestore designs
│   │   ├── checkout/route.ts             # Crea orden + Mercado Pago preference
│   │   └── mercado-pago/
│   │       └── webhook/route.ts          # Webhook IPN para actualizar estado de pago
│   │
│   ├── design-studio/
│   │   ├── components/
│   │   │   ├── DesignStudioClient.tsx   # Client wrapper
│   │   │   └── DesignStudioInteractive.tsx # Studio principal (3D + controles)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartInteractive.tsx       # Orquestador de estado (Zustand + Zod)
│   │   │   ├── CartHeader.tsx            # Indicador multi-step (Carrito → Datos → Confirmado)
│   │   │   ├── CartStep.tsx              # Lista de items con controles
│   │   │   ├── CheckoutStep.tsx          # Formulario de datos + resumen
│   │   │   ├── SuccessStep.tsx           # Confirmación exitosa ✓
│   │   │   ├── FailureStep.tsx           # Error de pago ✗
│   │   │   ├── PendingStep.tsx           # Pago pendiente ⏳
│   │   │   └── CartButton.tsx            # Botón flotante con contador
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── layout.tsx                        # Root layout + AuthProvider
│   ├── page.tsx                          # Landing page con Hero
│   ├── globals.css                       # CSS variables, glassmorphism, Tailwind v4
│   └── not-found.tsx
│
├── canvas/
│   ├── index.jsx                         # Canvas wrapper + Three.js setup
│   ├── Shirt.jsx                         # T-shirt 3D + Decals + interactividad
│   ├── CameraRig.jsx                     # Camera positioning + pointer tracking
│   ├── Backdrop.jsx                      # AccumulativeShadows + RandomizedLight
│
├── components/
│   ├── Header.tsx                        # Navigation bar + Logo
│   ├── HeaderNav.tsx                     # Nav links con protección de rutas
│   ├── UserHeaderSection.tsx             # Auth UI (Login button / Dropdown / Logout)
│   ├── HeroSection.tsx                   # Landing hero con canvas 3D auto-rotante
│   ├── HowItWorks.tsx                    # Showcase de 3 pasos (UI premium)
│   ├── CTABanner.tsx                     # Call-to-action final con trust badges
│   ├── CTABannerButton.tsx               # Botón CTA protegido hacia studio
│   ├── Footer.tsx                        # Footer con links legales
│   ├── Tab.jsx                           # Color/Filter tabs (legacy)
│   ├── ColorPicker.jsx                   # HexColorPicker wrapper
│   ├── CustomButton.jsx                  # Styled button con color dinámico
│   ├── LogoutButton.tsx                  # Botón de logout
│   ├── ui/
│   │   ├── AppIcon.tsx                   # Heroicons wrapper dinámico
│   │   └── MobileDrawer.tsx              # Drawer mobile con nav
│   └── index.js                          # Barrel exports
│
├── context/
│   └── AuthContext.tsx                   # Firebase auth state provider + session sync
│
├── hooks/
│   ├── useAuthActions.ts                 # Login/logout con Google OAuth
│   └── useProtectedNavigation.ts         # Auth-gated navigation hook
│
├── lib/
│   ├── firebase.ts                       # Firebase client config
│   ├── firebase-admin.ts                 # Firebase Admin SDK
│   ├── user-service.ts                   # Firestore user record sync
│   └── mercado-pago.ts                   # MP client config + tipos
│
├── schema/
│   ├── ICartItemSchema.ts                # Zod: CartItem, LogoPosition, ShirtSize
│   └── IOrderSchema.ts                   # Zod: Order, OrderItem, ContactData
│
├── config/
│   ├── constants.js                      # Editor/Filter tabs, DecalTypes
│   ├── helpers.js                        # Canvas download, color contrast
│   ├── motion.js                         # Framer Motion presets
│   └── config.js                         # Backend URL (dev/prod)
│
├── store/
│   ├── index.js                          # Valtio proxy (shirt color, scale, rotation)
│   └── useCartStore.ts                   # Zustand para carrito (persistencia localStorage)
│
├── middleware.ts                         # Route protection (token cookie check)
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── package.json
└── .gitignore
```

---

## 🔐 Autenticación & Seguridad

### Flujo de Autenticación Completo

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
   - maxAge: 432.000.000 ms (5 días)
   - secure: true (producción)
   - sameSite: lax
   - httpOnly: true (NO accesible desde JS)
   ↓
6. Middleware verifica token en rutas protegidas
   - Si falta token → redirige a /
   - Si existe → permite acceso
   ↓
7. AuthProvider mantiene estado sincronizado en real-time
   - onAuthStateChanged escucha cambios de Firebase
   - Sincroniza sesión servidor-cliente
```

### Protección de Rutas

- **Middleware** (`src/middleware.ts`): Valida cookie `token` en `/design-studio` y `/cart`
- **useProtectedNavigation**: Hook que dispara login automático
  - Si usuario intenta ir a `/design-studio` sin sesión → popup Google → redirect
- **AuthProvider**: Mantiene sync de sesión y valida en tiempo real

### Seguridad de Datos

- ✅ Passwords nunca se almacenan (Google OAuth)
- ✅ Tokens con expiración automática (5 días)
- ✅ Session sync previene token hijacking
- ✅ Validación de datos en servidor (previene manipulación de precios)
- ✅ Firestore security rules (configurable)

---

## 🛒 Sistema de Carrito & Checkout

### Gestión de Estado con Zustand

```typescript
// src/store/useCartStore.ts
const useCartStore = create<CartState>()(
  persist((set, get) => ({
    items: [],
    addItem: (item) => { /* ... */ },
    removeItem: (id) => { /* ... */ },
    clearCart: () => { /* ... */ },
    updateQuantity: (id, delta) => { /* ... */ },
  }), {
    name: "teeforge-cart",
    storage: createJSONStorage(() => localStorage)
  })
);
```

**Características:**
- Persistencia automática en localStorage
- Merge inteligente si existe item con mismo diseño/talle/color
- Tipo seguro con TypeScript
- Sincronización entre tabs

### Validación con Zod

```typescript
// CartItem debe cumplir:
✓ Tener un ID único
✓ Prompt mínimo de 3 caracteres
✓ Color hexadecimal válido
✓ Talle en [XS, S, M, L, XL, XXL]
✓ Cantidad ≥ 1
✓ Precio > 0
✓ URL de diseño válida
✓ Posición en [front_center, front_chest, back_center]
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
      quantity: 2,
      priceUnit: 500,           // ARS
      designUrl: "https://...",
      position: "front_center"
    }
  ]
}
```

### Cálculo de Precios

```typescript
// En CartInteractive.tsx
const subtotal = items.reduce((s, i) => s + (i.priceUnit * i.quantity), 0);

// Regla de negocio: Envío gratis > ARS $8000
const shipping = subtotal > 8000 ? 0 : 500;

// Total final
const total = subtotal + shipping;
```

---

## 💳 Integración con Mercado Pago

### Flujo Completo de Pago

```
1. Usuario completa CheckoutStep
   ↓
2. POST /api/checkout con OrderPayload
   ↓
3. Backend Valida datos con Zod
   ↓
4. Crea transacción Firestore (orden + incrementa usuario)
   ↓
5. Prepara items para MP (nombre, precio, cantidad)
   ↓
6. Si hay envío, agrega como item separado
   ↓
7. Crea Preference en MP API
   ↓
8. MP retorna: init_point (URL del checkout)
   ↓
9. Frontend redirige a init_point
   ↓
10. Usuario paga en MP (tarjeta, billetera, etc.)
   ↓
11. MP redirige a:
    - /cart?status=success
    - /cart?status=failure
    - /cart?status=pending
   ↓
12. Frontend detecta parámetro y muestra estado
   ↓
13. MP envía webhook a /api/mercado-pago/webhook
   ↓
14. Backend actualiza orden en Firestore
    - Cambia status: paid / failed / pending
    - Incrementa contador de usuario
```

### Configuración de Mercado Pago

```typescript
// Preference Items
{
  id: string,                          // ID del item
  title: "Remera Ramon Store - Talle M",
  description: "Color: Negro",
  picture_url: "https://...",          // Miniatura del diseño
  unit_price: 500,                     // ARS
  quantity: 1,
  currency_id: "ARS"
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

**POST** `/api/mercado-pago/webhook?action=payment.updated&data.id=PAY123`

**Procesa:**
- Obtiene detalles del pago desde MP API
- Mapea status de MP a status de orden:
  - `approved` → `paid` ✓
  - `pending` → `pending_payment` ⏳
  - `rejected` → `failed` ✗
- Actualiza orden en Firestore
- Incrementa contador `totalOrders` si es `approved`

---

## 🎨 Sistema de Diseño 3D

### Visualización 3D con Three.js

**Componentes:**
- `Shirt.jsx` — Modelo 3D de remera con decals
- `CameraRig.jsx` — Control de cámara y rotación
- `Backdrop.jsx` — Iluminación y sombras
- `Canvas` — Configuración de escena

### Iluminación Tri-Punto

```typescript
// Ambient light (luz ambiente suave)
<ambientLight intensity={0.7} />

// Directional light (principal)
<directionalLight position={[5, 5, 5]} intensity={1} />

// Environment preset (ciudad realista)
<Environment preset="city" />
```

### Sistema de Decals (Logo en Remera)

Usa `@react-three/drei` para mapear imágenes en la remera:

```typescript
const LOGO_LOCATIONS = {
  front_center: {
    position: [0, 0.04, 0.15],      // Centro pecho
    rotation: [0, 0, 0],
    scale: 0.25
  },
  front_chest: {
    position: [0.1, 0.08, 0.125],   // Pecho izquierdo (corazón)
    rotation: [0, 0, 0],
    scale: 0.14
  },
  back_center: {
    position: [0, 0.1, -0.16],      // Centro espalda
    rotation: [0, Math.PI, 0],      // Rotación de 180°
    scale: 0.23
  }
};
```

### Interactividad

- **Drag & Rotate**: Captura `pointerdown/move/up` para rotación suave
- **Inercia**: Momentum decae naturalmente (`damping = 0.92`)
- **Auto-rotate**: En landing page (parámetro `autoRotate={true}`)
- **Color Real-time**: `easing.dampC()` interpola color del estado Valtio

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
  freeGenerationsUsed: number,    // 0-3 (cuota de IA)
  totalOrders: number,             // Contador de órdenes completadas
  lastLogin: Timestamp,
  lastGenerationAt: Timestamp,
  lastOrderAt: Timestamp,
  createdAt: Timestamp
}
```

#### `users/{uid}/designs/{designId}` (Subcolección)
```typescript
{
  prompt: string,                  // Descripción de la IA
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
  subtotal: number,                // ARS
  shippingFee: number,             // ARS
  total: number,                   // ARS
  status: "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "failed" | "cancelled",
  mpPaymentId: string,             // ID del pago en MP
  mpPaymentStatus: string,         // "approved", "rejected", etc.
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🚀 Setup & Desarrollo

### Requisitos
- **Node.js** 18+ (se recomienda 20 LTS)
- **npm** 9+ o yarn/pnpm
- **Cuenta Firebase** (con Auth y Firestore habilitados)
- **Credenciales XAI** (para Grok Imagine)
- **Credenciales Mercado Pago** (sandbox para desarrollo)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/cordobacesar29/my-commerce.git
cd my-commerce

# Instalar dependencias
npm install

# Crear .env.local con variables de entorno
cp .env.example .env.local
```

### Variables de Entorno

```env
# === FIREBASE CLIENT (Público) ===
NEXT_PUBLIC_FIREBASE_API_KEY=***
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=***
NEXT_PUBLIC_FIREBASE_PROJECT_ID=***
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=***
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=***
NEXT_PUBLIC_FIREBASE_APP_ID=***

# === FIREBASE ADMIN (Servidor - Secreto) ===
FIREBASE_SERVICE_ACCOUNT_KEY=*** (JSON stringificado de Firebase Admin)

# === XAI GROK IMAGINE ===
XAI_API_KEY=***

# === MERCADO PAGO ===
MERCADOPAGO_ACCESS_TOKEN=***

# === APP CONFIG ===
NEXT_PUBLIC_APP_URL=http://localhost:3000 (cambiar en producción)
```

### Desarrollo Local

```bash
# Iniciar dev server
npm run dev
# Abre http://localhost:3000

# Lint
npm run lint

# Build
npm run build

# Start producción
npm start
```

### Deploy en Vercel

```bash
# 1. Conectar repositorio a Vercel
# 2. Configurar variables de entorno en Dashboard
# 3. Auto-deploy en cada push a main
```

---

## 🎨 Estilos & Diseño

### Tema Glassmorphism Premium

Definido en `src/app/globals.css`:

```css
:root {
  --bg-primary: #0b0f19;           /* Fondo oscuro profundo */
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --accent-gold: #c8a96e;          /* Gold premium */
  --accent-glow: rgba(200,169,110,0.18);
  --border-soft: rgba(255,255,255,0.08);
}

/* Glassmorphism */
.glassmorphism {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  backdrop-filter: blur(14px);
  border: 1px solid var(--border-soft);
}
```

### Tipografía

- **Archivo** (900) — Titulares masivos en hero
- **Geist Sans** — Cuerpo y UI
- **Geist Mono** — Números y código

### Tailwind CSS v4

Actualizado con Tailwind v4 con `@tailwindcss/postcss`.

---

## 📈 Cambios Recientes (v0.2.0)

### ✨ Nuevas Funcionalidades

#### 1. **Carrito Completamente Refactorizado**
- ✅ 5 componentes enfocados con responsabilidades claras
- ✅ CartInteractive orquesta estado con Zustand
- ✅ CartHeader con indicador visual de progreso
- ✅ CartStep para visualizar items
- ✅ CheckoutStep para datos de envío
- ✅ Success/Failure/Pending para estados finales

#### 2. **Sistema Completo de Pagos Mercado Pago**
- ✅ Integración de Preference API
- ✅ Webhook IPN para actualizar estado de órdenes
- ✅ URLs de retorno (success, failure, pending)
- ✅ Validación de datos en servidor
- ✅ Mapeo automático de items a MP

#### 3. **Validación Exhaustiva con Zod**
- ✅ Schemas tipados para CartItem, OrderItem, ShippingData
- ✅ CreateOrderSchema para validación completa
- ✅ Mensajes de error específicos
- ✅ Validación en frontend y backend

#### 4. **Múltiples Posiciones de Logo**
- ✅ Front Center (predeterminado)
- ✅ Front Chest (pecho izquierdo, elegante)
- ✅ Back Center (espalda)
- ✅ Selector interactivo en studio

#### 5. **Flujo Multi-Step Mejorado**
- ✅ Indicador de progreso visual
- ✅ Transiciones suaves con Framer Motion
- ✅ Estados finales claros (Success/Failure/Pending)
- ✅ Retorno automático desde Mercado Pago

#### 6. **Webhook de Mercado Pago**
- ✅ Actualización automática de estado
- ✅ Sincronización servidor-cliente
- ✅ Incremento atómico de contadores
- ✅ Manejo robusto de errores

### 🔧 Mejoras Técnicas

- ✅ Precios uniformes en ARS (antes hardcodeado)
- ✅ Envío gratis para compras > ARS $8000
- ✅ Sincronización automática de usuario en Firestore
- ✅ Toast notifications con Sonner
- ✅ Componentes tipados con TypeScript
- ✅ Optimización de performance con memoization
- ✅ Debounce de inputs con validación en tiempo real

---

## 🔗 Flujos Clave del Usuario

### Flujo 1: Crear un Diseño y Comprar

```
HOME PAGE
  ↓
[Click: "Empezar a diseñar"]
  ↓
AUTENTICACIÓN (si no está logueado)
  ↓
DESIGN STUDIO
  ├─ Descripción del diseño
  ├─ [Generar Diseño] → POST /api/generate-logo
  └─ Grok Imagine genera imagen
  
VISUALIZACIÓN 3D
  ├─ Imagen aparece en canvas
  ├─ Ajustar: color, talle, cantidad
  ├─ Seleccionar posición de logo
  └─ [Añadir al Carrito]
  
CARRITO (localStorage)
  ├─ Ver items
  ├─ Ajustar cantidad
  └─ [Continuar al pago]
  
CHECKOUT
  ├─ Datos personales
  ├─ Dirección de envío
  ├─ Resumen de pedido
  └─ [Confirmar pago]
  
MERCADO PAGO
  ├─ POST /api/checkout
  ├─ Backend crea orden + preference
  ├─ Redirige a init_point
  └─ Usuario paga
  
RESULTADO
  ├─ MP redirige a /cart?status=success
  └─ SuccessStep muestra confirmación
  
WEBHOOK (Background)
  └─ Actualiza orden en Firestore
```

### Flujo 2: Protección de Rutas

```
Usuario intenta acceder a /design-studio sin sesión
  ↓
Middleware detecta ausencia de cookie "token"
  ↓
Redirige a "/" (home)
  ↓
Usuario hace click en "Crear Diseño"
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

## 📚 Documentación Adicional

| Recurso | URL |
|---------|-----|
| Next.js | https://nextjs.org/docs |
| Firebase | https://firebase.google.com/docs |
| Three.js | https://threejs.org/docs |
| React Three Fiber | https://docs.pmnd.rs/react-three-fiber |
| Mercado Pago API | https://www.mercadopago.com.ar/developers |
| Zod | https://zod.dev |
| Zustand | https://docs.pmnd.rs/zustand |
| Tailwind CSS | https://tailwindcss.com |
| Framer Motion | https://www.framer.com/motion |

---

## 🏗️ Arquitectura de Componentes

### Patrones Utilizados

- **Container/Presentational**: CartInteractive (container) vs CartStep/CheckoutStep (presentational)
- **Composition**: Success/Failure/Pending como variantes del mismo patrón
- **Hooks Pattern**: useAuth, useProtectedNavigation, useAuthActions
- **Context API**: AuthContext para estado global de sesión
- **Zustand Store**: useCartStore para persistencia de carrito
- **Zod Schemas**: Validación tipada de datos críticos

### Performance Optimization

- `dynamic()` con `ssr: false` para Three.js
- Lazy loading de componentes en rutas
- `memo()` para componentes que se renderean frecuentemente
- Debounce en inputs de formulario
- `easing.damp*()` en lugar de `setInterval()` para animaciones
- Image optimization con Next.js Image component

---

## ⚙️ Configuración Importante

### Next.js Config
```typescript
// next.config.ts
{
  reactStrictMode: false,  // Evitar issues con compilación de shaders 3D
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
    remotePatterns: [...]
  }
}
```

### TypeScript Config
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### PostCSS Config
```javascript
// postcss.config.mjs
{
  plugins: {
    "@tailwindcss/postcss": {}
  }
}
```

---

## 🔄 Deploying a Producción

### Pasos:

1. **Configurar Firebase**
   - Habilitar Google OAuth en Console
   - Configurar Firestore rules
   - Obtener credenciales de Admin

2. **Configurar Mercado Pago**
   - Cambiar de sandbox a producción
   - Actualizar MERCADOPAGO_ACCESS_TOKEN
   - Configurar webhook URLs en dashboard MP

3. **Configurar Vercel**
   - Conectar repositorio GitHub
   - Configurar variables de entorno
   - Habilitar "Automatic Git branches"

4. **Testing**
   ```bash
   npm run build
   npm run lint
   ```

5. **Deploy**
   ```bash
   git push origin main  # Vercel auto-deploya
   ```

---

## 📝 Licencia

MIT © Ramón Store 2024-2025

---

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repo
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🎯 Roadmap & Mejoras Futuras

- [ ] Dashboard de usuario (historial de diseños, órdenes pasadas)
- [ ] Social sharing de diseños (Instagram, WhatsApp)
- [ ] Variantes de prenda (hoodies, bolsas, gorras)
- [ ] Editor de diseño avanzado (capas, filtros, texto personalizado)
- [ ] Recomendaciones basadas en IA
- [ ] Multi-idioma (EN/ES)
- [ ] Sistema de reseñas y testimonios
- [ ] Programa de afiliados
- [ ] Descuentos por cantidad
- [ ] Integración con otras billeteras digitales
- [ ] Panel admin para gestionar órdenes
- [ ] Notificaciones por email
- [ ] Sistema de tracking de envíos

---

## 📞 Contacto & Soporte

**Email**: cesar@ramonstore.com  
**GitHub Issues**: https://github.com/cordobacesar29/my-commerce/issues

---

**Hecho con ❤️ para creadores que aman el diseño y la tecnología.**

**Ramón Store © 2024-2025**