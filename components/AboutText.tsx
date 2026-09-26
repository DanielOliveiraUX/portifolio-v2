"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { about } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Texto da seção verde: as palavras sobem girando quando cada parágrafo entra na tela. */
export function AboutText({ className, lineClassName }: { className?: string; lineClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("p", root).forEach((p) =>
        SplitText.create(p, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              opacity: 0,
              y: 40,
              rotation: 5,
              duration: 0.6,
              stagger: 0.04,
              ease: "power3.out",
              scrollTrigger: { trigger: p, start: "top 85%", once: true },
            }),
        })
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      <p>{about.intro}</p>
      {about.paragraphs.map((lines, i) => (
        <p key={i}>
          {lines.map((line, j) => (
            <span key={j} className={lineClassName}>
              {line}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
