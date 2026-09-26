"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import s from "./ProjectTabs.module.css";

export function ProjectTabs({ items }: { items: { slug: string; tab: string }[] }) {
  const ids = useMemo(() => items.map((i) => i.slug), [items]);
  const active = useScrollSpy(ids);

  return (
    <nav className={s.tabs} aria-label="Projetos em destaque">
      {items.map((i) => {
        const isActive = active === i.slug;
        const split = i.tab.lastIndexOf(" ");
        return (
          <a
            key={i.slug}
            href={`#${i.slug}`}
            aria-label={i.tab}
            aria-current={isActive ? "true" : undefined}
            className="flair-btn"
          >
            <span className="flair" aria-hidden="true" />
            <span className="flair-label">
              {isActive && split > 0 && <span className={s.word}>{i.tab.slice(0, split + 1)}</span>}
              {split > 0 ? i.tab.slice(split + 1) : i.tab}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

export function AllProjectsLink() {
  return (
    <Link href="/projetos" className={`${s.all} flair-btn`} aria-label="Todos os projetos">
      <span className="flair" aria-hidden="true" />
      <span className="flair-label">
        <span className={s.label}>
          Todos<span className={s.more}> os projetos</span>
        </span>
        <span className={s.arrow} aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
