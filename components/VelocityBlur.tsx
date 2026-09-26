"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MAX_BLUR = 8;

/** Desfoca os textos marcados com data-velocity-blur conforme a velocidade do scroll. */
export function VelocityBlur() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = gsap.utils.toArray<HTMLElement>("[data-velocity-blur]");
    if (!targets.length) return;

    const setBlur = (blur: number, duration: number) =>
      gsap.to(targets, { filter: `blur(${blur}px)`, duration, overwrite: true });

    const trigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const blur = Math.min(Math.abs(self.getVelocity()) / 200, MAX_BLUR);
        setBlur(blur, 0.1);
      },
    });

    // onUpdate para quando o scroll para; volta o texto ao foco.
    const clear = () => setBlur(0, 0.3);
    ScrollTrigger.addEventListener("scrollEnd", clear);

    return () => {
      trigger.kill();
      ScrollTrigger.removeEventListener("scrollEnd", clear);
      gsap.set(targets, { clearProps: "filter" });
    };
  }, [pathname]);

  return null;
}
