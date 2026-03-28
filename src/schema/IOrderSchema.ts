import { z } from "zod";
import { FieldValue, Timestamp } from "firebase/firestore";
import { LogoPosition } from "./ICartItemSchema";

export const ContactSchema = z.object({
  fullName: z.string().min(3, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  city: z.string().min(2, "Ciudad obligatoria"),
  province: z.string().min(2, "Provincia obligatoria"),
  zipCode: z.string().min(4, "Código postal inválido"),
});


// 1. Esquema de Validación con Zod (Para el Formulario y la API)
export const OrderItemSchema = z.object({
  id: z.string(),
  size: z.enum(["XS","S", "M", "L", "XL", "XXL"]),
  colorName: z.string(),
  colorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color inválido"),
  quantity: z.number().min(1, "Mínimo 1 unidad"),
  priceUnit: z.number().positive(),
  designUrl: z.string().url("URL de diseño inválida").or(z.string().startsWith("data:image")),
  position: z.enum(LogoPosition)
});

export const ShippingSchema = ContactSchema.extend({
  cardNumber: z.string().regex(/^\d{16}$/, "Número de tarjeta inválido (16 dígitos)"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/YY inválido"),
  cardCvv: z.string().min(3, "CVV inválido").max(4),
  cardName: z.string().min(3, "Nombre en tarjeta obligatorio"),
});

export const CreateOrderSchema = z.object({
  userId: z.string(),
  items: z.array(OrderItemSchema),
  shipping: ContactSchema, // <--- CAMBIO AQUÍ
  total: z.number().positive(),
});

// 2. Tipos de TypeScript derivados de Zod
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type ShippingData = z.infer<typeof ShippingSchema>;
export type OrderStatus = "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

// 3. Interfaz completa para Firestore
export interface Order extends z.infer<typeof CreateOrderSchema> {
  id?: string;
  status: OrderStatus;
  createdAt: any
}