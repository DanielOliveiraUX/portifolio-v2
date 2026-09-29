import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-types";
import s from "./FeaturedProject.module.css";

export function FeaturedProject({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article id={project.slug} className={s.card}>
      <div className={s.media}>
        {/* a imagem de capa fica sempre por baixo: se a animação não carregar (ex.: alguns celulares), ela aparece */}
        <Image
          src={project.cover.src}
          alt={project.coverEmbed ? "" : project.cover.alt}
          fill
          sizes="(max-width: 899px) 100vw, 45vw"
          className={s.image}
          priority={priority}
        />
        {project.coverEmbed && (
          <iframe
            src={project.coverEmbed}
            title={project.cover.alt || project.title}
            className={s.embed}
            loading={priority ? "eager" : "lazy"}
            tabIndex={-1}
          />
        )}
      </div>

      <div className={s.body}>
        <div className={s.text}>
          <p className={s.meta}>{project.meta}</p>
          <h3 className={s.title}>
            <Link href={`/projetos/${project.slug}`} className={s.titleLink}>
              {project.title}
            </Link>
          </h3>
          <p className={s.summary}>{project.summary}</p>
          <ul className={s.bullets}>
            {project.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <Link href={`/projetos/${project.slug}`} className="pill flair-btn">
          <span className="flair" aria-hidden="true" />
          <span className="flair-label">
            Ver projeto completo<span className="sr-only">: {project.title}</span>
          </span>
        </Link>
      </div>
    </article>
  );
}
