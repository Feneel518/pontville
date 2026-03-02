

export const success = (message: string) => ({ ok: true as const, message });
export const fail = (message: string) => ({ ok: false as const, message });

