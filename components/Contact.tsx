import { Fragment } from "react";
import { getSite } from "@/lib/content";
import { SectionLabel } from "./SectionLabel";
import s from "./Contact.module.css";

export async function Contact({ variant = "home" }: { variant?: "home" | "case" }) {
  const { contact } = await getSite();
  const titleLines = contact.title.split("\n");
  const external = /^https?:/.test(contact.ctaUrl);

  return (
    <section id="contato" className={`${s.section} ${variant === "case" ? s.case : ""}`} aria-labelledby="contato-titulo">
      <div className={`container ${s.inner}`}>
        <SectionLabel>Contato</SectionLabel>

        <h2 id="contato-titulo" className={s.title}>
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <>
                  {" "}
                  <br />
                </>
              )}
              {line}
            </Fragment>
          ))}
        </h2>

        <span className={s.rule} aria-hidden="true" />

        <a
          href={contact.ctaUrl}
          className={`${s.cta} flair-btn`}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <span className="flair" aria-hidden="true" />
          <span className="flair-label">
            <span>
              {contact.ctaLabel}
              {external && <span className="sr-only"> (abre em nova aba)</span>}
            </span>
            <span className={s.arrow} aria-hidden="true">
              →
            </span>
          </span>
        </a>

        <div className={s.spacer} aria-hidden="true" />

        <ul className={s.links}>
          <li>
            <a href={`mailto:${contact.email}`} className="pill pill--lower flair-btn">
              <span className="flair" aria-hidden="true" />
              <span className="flair-label">{contact.email}</span>
            </a>
          </li>
          <li>
            <a href={contact.linkedin} className="pill pill--lower" target="_blank" rel="noopener noreferrer">
              <span className="flair" aria-hidden="true" />
              <span className="flair-label">
                Linkedin<span className="sr-only"> (abre em nova aba)</span>
              </span>
            </a>
          </li>
        </ul>

        <hr className={s.divider} />

        <p className={s.copy}>{contact.footer}</p>
      </div>
    </section>
  );
}
