"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero com fundo que amplia, desfoca e escurece conforme a rolagem,
 * enquanto o texto sobe até 30% da altura do hero (inspirado no
 * "scroll zoom hero" do Motion).
 */
export function HeroScroll({
  className,
  bgClassName,
  contentClassName,
  background,
  children,
}: {
  className?: string;
  bgClassName?: string;
  contentClassName?: string;
  background: React.ReactNode;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = root.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: 0, // começa no primeiro movimento da rolagem (o hero fica abaixo do header)
          end: "bottom top",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });

      tl.to(bg.current, { scale: 1.25, filter: "blur(16px)", opacity: 0.35 }, 0).to(
        content.current,
        { y: () => -hero.offsetHeight * 0.3 },
        0
      );
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={className}>
      <div ref={bg} className={bgClassName} aria-hidden="true">
        {background}
      </div>
      <div ref={content} className={contentClassName}>
        {children}
      </div>
    </section>
  );
}
