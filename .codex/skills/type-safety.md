# 🛡️ Skill: Type Safety & Zod Validation

**Uso:** Siempre que se definan interfaces, tipos de TypeScript o validación de formularios y respuestas de API.

## 1. Reglas de Tipado
- **No Any:** Está estrictamente prohibido usar `any`. Usar `unknown` si el tipo no es claro y luego validar con Zod.
- **Interfaces vs Types:** Usar `interface` para objetos que pueden ser extendidos y `type` para uniones o aliases.
- **Naming:** Interfaces comienzan con `I` (ej: `IUser`, `IProduct`).

## 2. Patrón de Validación (Zod)
Para cada modelo de datos, se debe crear un esquema de Zod y exportar su tipo inferido.

```typescript
import { z } from "zod";

export const OrderSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  items: z.array(z.string()),
  total: z.number().positive(),
  status: z.enum(["pending", "paid", "shipped"]),
  createdAt: z.date()
});

export type IOrder = z.infer<typeof OrderSchema>;