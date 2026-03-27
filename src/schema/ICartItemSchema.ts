import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "El título es requerido"),
  prompt: z.string().min(3, "Describe un poco más tu idea antes de comprar"),
  color: z.string().startsWith("#"),
  colorName: z.string(),
  size: z.string().refine((val) => ["XS", "S", "M", "L", "XL", "XXL"].includes(val), {
  message: "Por favor, selecciona un talle de la lista",
}),
  quantity: z.number().min(1),
  price: z.number().positive(),
  designDataUrl: z.string().url("Debes generar un diseño con IA primero"),
});

export type CartItem = z.infer<typeof cartItemSchema>;