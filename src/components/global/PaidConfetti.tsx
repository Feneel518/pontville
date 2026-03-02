"use client";

import * as React from "react";
import confetti from "canvas-confetti";

export default function PaidConfetti({ fire }: { fire: boolean }) {
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!fire || firedRef.current) return;

    firedRef.current = true;
    firePremiumConfetti();
  }, [fire]);

  function firePremiumConfetti() {
    const count = 300;
    const defaults = { origin: { y: 0.7 } };

    const burst = (ratio: number, opts: any) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * ratio),
      });
    };

    burst(0.25, { spread: 26, startVelocity: 55 });
    burst(0.2, { spread: 60 });
    burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    burst(0.1, { spread: 120, startVelocity: 45 });
  }

  return null;
}
