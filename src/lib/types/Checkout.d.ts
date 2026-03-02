export type CheckoutItemPayload = {
  menuItemId: string;
  variantId?: string | null;
  quantity: number;
  addOnIds: string[]; // selected addon IDs (per unit)
};

export type CreateCheckoutPayload = {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  pickupTime?: string; // ISO
  notes?: string | null;
  items: CheckoutItemPayload[];
};