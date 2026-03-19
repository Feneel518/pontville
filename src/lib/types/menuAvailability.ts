export type MenuAvailabilityState = {
  isOpen: boolean;
  message: string;
  opensAt?: string;
  closesAt?: string;
  nextChangeAt?: string;
  timezone: string;
};
