# 📑 Skill: Firebase & Multi-tenant Architecture

**Uso:** Siempre que se trabaje en la capa de servicios, reglas de seguridad o diseño de colecciones en Firestore.

## 1. Estándares de Modelado (NoSQL)
- **Denormalización:** Priorizar la lectura sobre la escritura. Si el nombre de la tienda es necesario en el listado de diseños del usuario, duplicar el `storeName` para evitar joins costosos.
- **Estructura Multi-tienda:** Todo documento en las colecciones raíz (`designs`, `orders`, `products`) DEBE tener un campo `storeId`.
- **Sub-colecciones:** Usar sub-colecciones solo cuando los datos pertenezcan estrictamente a un padre y no necesiten consultas globales masivas (ej: `users/{uid}/private_settings`).

## 2. Protocolo de Créditos e IA
- **Monetización:** Las generaciones de imágenes por IA se descuentan de un campo `credits` en el perfil del usuario.
- **Validación:** Antes de ejecutar una función de generación, verificar `user.credits > 0`.

## 3. Reglas de Seguridad (Security Rules)
Cualquier propuesta de código debe ser compatible con este esquema mental de reglas:
- `allow read, write: if request.auth != null && resource.data.storeId == request.auth.token.storeId;`

## 4. Gold Standard: Query de Filtrado (React + Firestore)
Este es el código que esperamos para traer diseños de una tienda específica:

```typescript
import { query, collection, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

// Siempre incluir storeId y manejar el orden para paginación
const designsRef = collection(db, "designs");
const q = query(
  designsRef,
  where("storeId", "==", currentStoreId),
  where("status", "==", "active"),
  orderBy("createdAt", "desc")
);