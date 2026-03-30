import { MercadoPagoConfig } from "mercadopago";

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado");
}

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 20000,
  },
});

/**
 * Tipos para la preferencia de Mercado Pago
 */
export interface MPItemRequest {
  id: string;
  title: string;
  description: string;
  picture_url: string;
  category_id: string;
  quantity: number;
  unit_price: number;
}

export interface MPPayerRequest {
  name: string;
  email: string;
  phone?: {
    area_code?: string;
    number: string;
  };
  address?: {
    street_name: string;
    street_number: number;
    zip_code: string;
    city_name: string;
    state_name: string;
  };
}

export interface CreatePreferenceRequest {
  items: MPItemRequest[];
  payer: MPPayerRequest;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  redirect_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: "approved" | "all";
  statement_descriptor: string;
  external_reference: string; // orderId para tracking
  notification_url: string;
}

/**
 * Validaciones para crear preferencia
 */
export const validateMPPreference = (data: CreatePreferenceRequest): string | null => {
  if (!data.items || data.items.length === 0) {
    return "Debe haber al menos un item";
  }

  if (!data.payer?.name || !data.payer?.email) {
    return "Nombre y email del comprador requeridos";
  }

  if (!data.back_urls?.success || !data.back_urls?.failure) {
    return "URLs de retorno requeridas";
  }

  if (!data.external_reference) {
    return "external_reference (orderId) requerido";
  }

  return null;
};