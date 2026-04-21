import { z } from "zod";
import { LogoPosition, ShirtSize } from "./ICartItemSchema";

const colorHexSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color invalido");

const imageUrlSchema = z
  .string()
  .url("URL de diseño invalida")
  .or(z.string().startsWith("data:image"));

export const ContactSchema = z.object({
  fullName: z.string().min(3, "El nombre es muy corto"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(8, "Telefono invalido"),
  address: z.string().min(5, "La direccion es obligatoria"),
  city: z.string().min(2, "Ciudad obligatoria"),
  province: z.string().min(2, "Provincia obligatoria"),
  zipCode: z.string().min(3, "Codigo postal invalido"),
});

export const DesignSideSchema = z.enum(["front", "back"]);

export const DesignPlacementSchema = z
  .object({
    side: DesignSideSchema,
    preset: z.enum(LogoPosition),
    anchor: z.enum(["chest", "center"]),
    position: z.tuple([z.number(), z.number(), z.number()]),
    rotation: z.tuple([z.number(), z.number(), z.number()]),
    scale: z.number().positive("La escala del diseño debe ser mayor a cero"),
  })
  .superRefine((placement, ctx) => {
    const isBackPreset = placement.preset === LogoPosition.BackCenter;
    const expectedSide = isBackPreset ? "back" : "front";

    if (placement.side !== expectedSide) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La cara elegida no coincide con el preset del diseño",
        path: ["side"],
      });
    }
  });

export const OrderDesignSchema = z.object({
  prompt: z.string().min(3, "El prompt del diseño es muy corto"),
  imageUrl: imageUrlSchema,
  placement: DesignPlacementSchema,
});

export const OrderItemSchema = z.object({
  id: z.string().min(1, "El item debe tener un id"),
  size: z.enum(ShirtSize),
  colorName: z.string().min(1, "Debes indicar el color de la prenda"),
  colorHex: colorHexSchema,
  quantity: z.number().int().min(1, "Minimo 1 unidad"),
  priceUnit: z.number().positive("El precio debe ser mayor a cero"),
  design: OrderDesignSchema,
});

export const CreateOrderSchema = z.object({
  storeId: z.string().min(1, "storeId es obligatorio"),
  userId: z.string().min(1, "userId es obligatorio"),
  items: z.array(OrderItemSchema).min(1, "La orden debe incluir al menos un item"),
  shipping: ContactSchema,
  total: z.number().positive("El total debe ser mayor a cero"),
});

export const OrderStatusSchema = z.enum([
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export type IContactData = z.infer<typeof ContactSchema>;
export type IDesignSide = z.infer<typeof DesignSideSchema>;
export type IDesignPlacement = z.infer<typeof DesignPlacementSchema>;
export type IOrderDesign = z.infer<typeof OrderDesignSchema>;
export type IOrderItem = z.infer<typeof OrderItemSchema>;
export type ICreateOrder = z.infer<typeof CreateOrderSchema>;
export type IOrderStatus = z.infer<typeof OrderStatusSchema>;

export interface IOrder extends ICreateOrder {
  id?: string;
  status: IOrderStatus;
  subtotal: number;
  shippingFee: number;
  createdAt: Date | null;
  updatedAt?: Date | null;
}

export type ContactData = IContactData;
export type OrderItem = IOrderItem;
export type OrderStatus = IOrderStatus;
export type Order = IOrder;
