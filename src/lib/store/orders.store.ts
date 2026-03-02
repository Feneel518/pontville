import { Prisma } from "@prisma/client";
import { create } from "zustand";

type Order = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        menuItem: { select: { name: true } };
        itemVariant: { select: { name: true } };
      };
    };
  };
}>;

type OrdersState = {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  upsertOrder: (order: Partial<Order> & { id: string }) => void;
};

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  upsertOrder: (order) =>
    set((state) => {
      const idx = state.orders.findIndex((o: any) => o.id === order.id);
      if (idx === -1) return { orders: [order as any, ...state.orders] };
      const next = [...state.orders];
      next[idx] = { ...next[idx], ...order };
      return { orders: next };
    }),
}));
