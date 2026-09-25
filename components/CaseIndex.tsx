"use client";

import { useMemo } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import s from "./CaseIndex.module.css";

export function CaseIndex({ items }: { items: { id: string; title: string }[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useScrollSpy(ids);

  return (
    <nav className={s.index} aria-label="Seções do projeto">
      <ul>
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
