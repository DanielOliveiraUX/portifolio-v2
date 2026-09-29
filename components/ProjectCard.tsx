import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/content-types";
import s from "./ProjectCard.module.css";

export function ProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={s.card}>
      <div className={s.media}>
        {/* a imagem de capa fica sempre por baixo: se a animação não carregar, ela aparece */}
        <Image
          src={project.cover.src}
          alt={project.coverEmbed ? "" : project.cover.alt}
          fill
          sizes="(max-width: 559px) 100vw, 283px"
          className={s.image}
        />
        {project.coverEmbed && (
          <iframe src={project.coverEmbed} title={project.cover.alt || project.title} className={s.embed} loading="lazy" tabIndex={-1} />
        )}
      </div>
      <div className={s.body}>
        <div className={s.text}>
          <p className={s.meta}>{project.meta}</p>
          <Heading className={s.title}>
            <Link href={`/projetos/${project.slug}`} className={s.titleLink}>
              {project.title}
            </Link>
          </Heading>
          <p className={s.summary}>{project.summary}</p>
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
