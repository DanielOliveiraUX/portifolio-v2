"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Texto da seção verde, inspirado no pen mdKWBmm da GreenSock: a seção fica presa na tela e,
 * conforme a rolagem avança, cada letra "acende" em sequência, como um marca-texto de leitura.
 */
export function AboutText({
  paragraphs,
  className,
  lineClassName,
}: {
  /** Cada parágrafo é uma lista de linhas; trechos entre **asteriscos** saem em negrito. */
  paragraphs: string[][];
  className?: string;
  lineClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // layout effect: o pin precisa ser desfeito antes de o React remover a seção ao trocar de página
  useLayoutEffect(() => {
    const root = ref.current;
    const section = root?.parentElement;
    if (!root || !section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      SplitText.create(gsap.utils.toArray<HTMLElement>("p", root), {
        // "words" mantém as palavras inteiras na quebra de linha; a animação corre nas letras
        type: "words,chars",
        autoSplit: true,
        // a timeline retornada é revertida junto com o split (resize, fontes carregando)
        onSplit: (self) => {
          // no mobile a seção é mais baixa e não prende a tela: o texto acende enquanto ela cruza a tela
          const mobile = window.matchMedia("(max-width: 767px)").matches;
          return gsap
            .timeline({
              scrollTrigger: mobile
                ? { trigger: section, start: "top 75%", end: "bottom 45%", scrub: 0.75 }
                : { trigger: section, start: "top top", end: "+=150%", pin: true, scrub: 0.75 },
            })
            .fromTo(self.chars, { opacity: 0.18 }, { opacity: 1, stagger: 0.1, duration: 0.1, ease: "none" });
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {paragraphs.map((lines, i) => (
        <p key={i}>
          {lines.map((line, j) => (
            <span key={j} className={lineClassName}>
              {line.split("**").map((part, k) => (k % 2 ? <strong key={k}>{part}</strong> : part))}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
