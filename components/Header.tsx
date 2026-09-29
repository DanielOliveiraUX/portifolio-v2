"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/data/site";
import s from "./Header.module.css";

const links = [
  { href: "/projetos", label: "Trabalhos" },
  { href: "/#sobre", label: "Sobre mim" },
  { href: "/#contato", label: "Contato" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={s.header} data-open={open}>
      <div className={`container ${s.inner}`}>
        <Link
          href="/"
          className={`flair-btn ${s.logo}`}
          aria-label="Daniel Oliveira, página inicial"
          onClick={() => setOpen(false)}
        >
          <span className="flair" aria-hidden="true" />
        </Link>

        <nav className={s.nav} aria-label="Principal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flair-btn">
              <span className="flair" aria-hidden="true" />
              <span className="flair-label">{l.label}</span>
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className={s.toggle}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span data-open={open} />
          <span data-open={open} />
        </button>
      </div>

      <nav id="menu-mobile" className={s.mobile} data-open={open} aria-label="Menu" hidden={!open}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <div className={s.contacts}>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </div>
      </nav>
    </header>
  );
}
