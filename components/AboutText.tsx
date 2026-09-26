"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { about } from "@/data/site";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Texto da seção verde: as palavras surgem em sequência toda vez que cada parágrafo entra na tela. */
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
              // mesmo movimento do split-text do Motion: fade + sobe 10px, mola sem quique
              opacity: 0,
              y: 10,
              duration: 1.4,
              stagger: 0.03,
              ease: "expo.out",
              scrollTrigger: {
                trigger: p,
                start: "top 90%",
                end: "bottom 10%",
                // reinicia sempre que o parágrafo volta à tela, descendo ou subindo
                toggleActions: "restart none restart none",
              },
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
