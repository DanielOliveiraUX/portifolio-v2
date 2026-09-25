import { site } from "@/data/site";
import { SectionLabel } from "./SectionLabel";
import s from "./Contact.module.css";

export function Contact({ variant = "home" }: { variant?: "home" | "case" }) {
  return (
    <section id="contato" className={`${s.section} ${variant === "case" ? s.case : ""}`} aria-labelledby="contato-titulo">
      <div className={`container ${s.inner}`}>
        <SectionLabel>Contato</SectionLabel>

        <h2 id="contato-titulo" className={s.title}>
          Não tem certeza do que o seu produto precisa?{" "}
          <br />
          Vamos descobrir juntos.
        </h2>

        <span className={s.rule} aria-hidden="true" />

        <a href={site.scheduleUrl} className={s.cta}>
          <span>Agende uma chamada de discovery gratuita</span>
          <span className={s.arrow} aria-hidden="true">
            →
          </span>
        </a>

        <div className={s.spacer} aria-hidden="true" />

        <ul className={s.links}>
          <li>
            <a href={`mailto:${site.email}`} className="pill pill--lower">
              {site.email}
            </a>
          </li>
          <li>
            <a href={site.linkedin} className="pill pill--lower" target="_blank" rel="noopener noreferrer">
              Linkedin<span className="sr-only"> (abre em nova aba)</span>
            </a>
          </li>
        </ul>

        <hr className={s.divider} />

        <p className={s.copy}>© 2026 Daniel Oliveira. Todos os direitos reservados.</p>
      </div>
    </section>
  );
}
