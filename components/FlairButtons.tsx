"use client";

import { useEffect } from "react";
import gsap from "gsap";

/**
 * Efeito "flair" nos botões com a classe .flair-btn: um círculo verde
 * entra pelo lado onde o mouse entrou, segue o cursor e sai pelo lado
 * onde o mouse saiu. Usa delegação no document, então vale para
 * qualquer botão renderizado depois.
 */
export function FlairButtons() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const pct = gsap.utils.clamp(0, 100);

    const getXY = (btn: HTMLElement, e: PointerEvent) => {
      const { left, top, width, height } = btn.getBoundingClientRect();
      return {
        x: pct(((e.clientX - left) / width) * 100),
        y: pct(((e.clientY - top) / height) * 100),
      };
    };

    const flairOf = (btn: HTMLElement) => btn.querySelector<HTMLElement>(".flair");

    // Retorna o botão só quando o ponteiro realmente cruzou a borda dele.
    const crossed = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLElement>(".flair-btn");
      if (!btn) return null;
      const related = e.relatedTarget as Node | null;
      return related && btn.contains(related) ? null : btn;
    };

    const onOver = (e: PointerEvent) => {
      const btn = crossed(e);
      const flair = btn && flairOf(btn);
      if (!btn || !flair) return;
      const { x, y } = getXY(btn, e);
      gsap.killTweensOf(flair);
      gsap.set(flair, { xPercent: x, yPercent: y });
      gsap.to(flair, { scale: 1, duration: 0.7, ease: "power2.inOut" });
    };

    const onOut = (e: PointerEvent) => {
      const btn = crossed(e);
      const flair = btn && flairOf(btn);
      if (!btn || !flair) return;
      const { x, y } = getXY(btn, e);
      const push = (v: number) => (v > 90 ? v + 20 : v < 10 ? v - 20 : v);
      gsap.killTweensOf(flair);
      gsap.to(flair, { xPercent: push(x), yPercent: push(y), scale: 0, duration: 0.5, ease: "power2.inOut" });
    };

    const onMove = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLElement>(".flair-btn");
      const flair = btn && flairOf(btn);
      if (!btn || !flair) return;
      const { x, y } = getXY(btn, e);
      gsap.to(flair, { xPercent: x, yPercent: y, duration: 0.4, ease: "power2" });
    };

    document.documentElement.classList.add("flair-on");
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointermove", onMove);
    return () => {
      document.documentElement.classList.remove("flair-on");
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
