"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./ReadingProgress.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Barra fina no topo que acompanha o progresso de leitura da página. */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={s.track} aria-hidden="true">
      <div ref={bar} className={s.bar} />
    </div>
  );
}
