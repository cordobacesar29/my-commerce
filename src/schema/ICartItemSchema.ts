import { z } from "zod";

export enum LogoPosition {
  FrontCenter = "front_center",
  BackCenter = "back_center",
  FrontChest = "front_chest",
}

export const cartItemSchema = z.object({
  id: z.string(),
  prompt: z.string().min(3, "Describe un poco más tu idea antes de comprar"),
  colorHex: z.string().startsWith("#"),
  colorName: z.string(),
  size: z.string().refine((val) => ["XS", "S", "M", "L", "XL", "XXL"].includes(val), {
  message: "Por favor, selecciona un talle de la lista",
}),
  quantity: z.number().min(1),
  priceUnit: z.number().positive(),
  designUrl: z.string().url("Debes generar un diseño con IA primero"),
  position: z.enum(LogoPosition)
});

export type CartItem = z.infer<typeof cartItemSchema>;
