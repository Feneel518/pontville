export type MenuAvailabilityState = {
  isOpen: boolean;
  message: string;
  opensAt?: string;
  closesAt?: string;
  nextChangeAt?: string;
  timezone?: string;

  lastComputedAt?: number; // always updates
  lastChangedAt?: number; // only when open/close flips
};
