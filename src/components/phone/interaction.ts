/**
 * Cursor interaction for the 3D phone (experimental: delete this file and the
 * three marked lines in Phone.tsx to remove it).
 *  - the handset tilts a little toward the cursor
 *  - clicking the phone sends a repair pulse across the screen
 */
export const interaction = {
  /** cursor position, -1..1 from the viewport centre */
  x: 0,
  y: 0,
  /** performance.now() of the last click on the phone, or -1 */
  pulseAt: -1,
};

export const PULSE_MS = 1500;

export function attachInteraction(hit: (clientX: number, clientY: number) => boolean) {
  const move = (e: PointerEvent) => {
    interaction.x = (e.clientX / window.innerWidth) * 2 - 1;
    interaction.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const down = (e: PointerEvent) => {
    if (hit(e.clientX, e.clientY)) interaction.pulseAt = performance.now();
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", down, { passive: true });
  return () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", down);
  };
}

/** 0..1..0 bump over the pulse; 0 when idle */
export function pulseAmount(now: number) {
  if (interaction.pulseAt < 0) return 0;
  const age = (now - interaction.pulseAt) / PULSE_MS;
  if (age >= 1) return 0;
  return Math.sin(Math.PI * age);
}
