"use client";

import { useEffect, useMemo, useRef } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import s from "./CaseIndex.module.css";

export function CaseIndex({ items }: { items: { id: string; title: string }[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useScrollSpy(ids);
  const list = useRef<HTMLUListElement>(null);

  // no mobile o menu rola na horizontal: leva o tópico ativo para o centro, para ele nunca ficar escondido
  useEffect(() => {
    const ul = list.current;
    const link = ul?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!ul || !link || ul.scrollWidth <= ul.clientWidth) return;
    const box = ul.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    const left = ul.scrollLeft + rect.left - box.left - (ul.clientWidth - rect.width) / 2;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  }, [active]);

  return (
    <nav className={s.index} aria-label="Seções do projeto">
      <ul ref={list}>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
              {i.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
